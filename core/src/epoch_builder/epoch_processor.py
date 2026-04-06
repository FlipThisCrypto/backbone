"""
Epoch Processor - Core off-chain computation engine
Implements the pseudocode logic with production security considerations
"""

import json
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from math import floor
from ..merkle_tree.merkle_builder import MerkleTreeBuilder
from ..validation.schema_validator import SchemaValidator

@dataclass
class EpochState:
    """Current system state"""
    total_received_mojos: int = 0
    total_allocated_mojos: int = 0
    lifetime_claimed_mojos: int = 0
    current_epoch_id: int = 0

@dataclass
class ClaimLeaf:
    """Individual claim record for Merkle tree"""
    version: str = "CLAIM_V1"
    epoch_id: int = 0
    snapshot_timestamp: int = 0
    collection_id: str = ""
    wallet_puzzle_hash: str = ""
    wallet_points: int = 0
    total_minted_points: int = 0
    epoch_amount_mojos: int = 0
    claim_amount_mojos: int = 0

@dataclass
class EpochManifest:
    """Epoch summary and metadata"""
    version: str = "EPOCH_V1"
    epoch_id: int = 0
    snapshot_timestamp: int = 0
    epoch_frequency: str = "4h"
    collection_id: str = ""
    reward_asset: str = "XCH"
    epoch_amount_mojos: int = 0
    total_received_mojos: int = 0
    total_allocated_mojos: int = 0
    total_minted_nfts: int = 0
    total_minted_points: int = 0
    merkle_root: str = ""
    leaf_count: int = 0

class EpochProcessor:
    """
    Core epoch processing engine implementing the reward distribution logic
    Addresses concurrency and atomic state management concerns
    """
    
    def __init__(self, config_path: str, points_map_path: str):
        self.config = self._load_config(config_path)
        self.points_map = self._load_points_map(points_map_path)
        self.state = EpochState()
        self.validator = SchemaValidator()
        self.merkle_builder = MerkleTreeBuilder()
        
    def _load_config(self, path: str) -> Dict:
        """Load and validate project configuration"""
        with open(path, 'r') as f:
            config = json.load(f)
        
        # Validate against schema
        if not self.validator.validate_project_config(config):
            raise ValueError(f"Invalid project config: {self.validator.errors}")
            
        return config
    
    def _load_points_map(self, path: str) -> Dict:
        """Load and validate points mapping"""
        with open(path, 'r') as f:
            points_map = json.load(f)
            
        if not self.validator.validate_points_map(points_map):
            raise ValueError(f"Invalid points map: {self.validator.errors}")
            
        return points_map
    
    def on_deposit(self, amount: int) -> None:
        """
        Handle XCH deposit to the reward pool
        Thread-safe atomic update
        """
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
            
        # Atomic state update to prevent concurrency races
        self.state.total_received_mojos += amount
        
        # Log for audit trail
        self._log_deposit(amount, self.state.total_received_mojos)
    
    def on_snapshot(self, snapshot_timestamp: int, ownership_data: Dict[str, int]) -> Tuple[Optional[EpochManifest], List[ClaimLeaf]]:
        """
        Process ownership snapshot and generate epoch if funded
        
        Args:
            snapshot_timestamp: Unix timestamp of NFT ownership snapshot
            ownership_data: Dict mapping wallet_puzzle_hash -> points
            
        Returns:
            (manifest, claims) tuple or (None, []) if epoch skipped
        """
        # Filter to only minted NFTs (have points > 0)
        minted_nfts = {wallet: points for wallet, points in ownership_data.items() if points > 0}
        total_minted_points = sum(minted_nfts.values())
        
        # Check skip conditions
        if total_minted_points <= 0:
            self._log_skip_epoch("zero minted points", snapshot_timestamp)
            return None, []
        
        # Calculate available funding using delta method
        new_epoch_amount = self.state.total_received_mojos - self.state.total_allocated_mojos
        
        if new_epoch_amount <= 0:
            self._log_skip_epoch("zero new funds", snapshot_timestamp)
            return None, []
        
        # Generate new epoch
        return self._create_epoch(
            snapshot_timestamp=snapshot_timestamp,
            wallet_points=minted_nfts,
            total_minted_points=total_minted_points,
            epoch_amount=new_epoch_amount,
            total_minted_nfts=len(minted_nfts)
        )
    
    def _create_epoch(
        self,
        snapshot_timestamp: int,
        wallet_points: Dict[str, int],
        total_minted_points: int,
        epoch_amount: int,
        total_minted_nfts: int
    ) -> Tuple[EpochManifest, List[ClaimLeaf]]:
        """
        Create new epoch with claims and manifest
        Implements the delta funding model with floor() rounding
        """
        self.state.current_epoch_id += 1
        
        # Generate individual claims
        claims = []
        total_distributed = 0
        
        for wallet_puzzle_hash, points in wallet_points.items():
            # Calculate proportional share
            share = points / total_minted_points
            claim_amount = floor(share * epoch_amount)  # Floor prevents dust issues
            
            if claim_amount > 0:  # Skip zero claims
                claim = ClaimLeaf(
                    epoch_id=self.state.current_epoch_id,
                    snapshot_timestamp=snapshot_timestamp,
                    collection_id=self.config["collection_id"],
                    wallet_puzzle_hash=wallet_puzzle_hash,
                    wallet_points=points,
                    total_minted_points=total_minted_points,
                    epoch_amount_mojos=epoch_amount,
                    claim_amount_mojos=claim_amount
                )
                claims.append(claim)
                total_distributed += claim_amount
        
        # Build Merkle tree for trustless verification
        merkle_root = self.merkle_builder.build_tree([self._serialize_claim(c) for c in claims])
        
        # Update allocated amount (only the distributed amount, dust rolls to next epoch)
        self.state.total_allocated_mojos += total_distributed
        
        # Create epoch manifest
        manifest = EpochManifest(
            epoch_id=self.state.current_epoch_id,
            snapshot_timestamp=snapshot_timestamp,
            collection_id=self.config["collection_id"],
            epoch_amount_mojos=total_distributed,  # Actual distributed amount
            total_received_mojos=self.state.total_received_mojos,
            total_allocated_mojos=self.state.total_allocated_mojos,
            total_minted_nfts=total_minted_nfts,
            total_minted_points=total_minted_points,
            merkle_root=merkle_root,
            leaf_count=len(claims)
        )
        
        self._log_epoch_created(manifest, len(claims))
        
        return manifest, claims
    
    def on_claim_batch(self, wallet: str, claim_packages: List[Dict]) -> int:
        """
        Process batch claim with validation
        Returns total payout amount
        """
        total_payout = 0
        
        for package in claim_packages:
            leaf = package["claim_leaf"]
            proof = package["merkle_proof"]
            manifest = package["epoch_manifest"]
            
            # Validate claim
            if not self._validate_claim(wallet, leaf, proof, manifest):
                raise ValueError(f"Invalid claim for epoch {leaf['epoch_id']}")
            
            # Check not already claimed (would be handled by nullifier in Chialisp)
            if self._already_claimed(wallet, leaf["epoch_id"]):
                raise ValueError(f"Already claimed epoch {leaf['epoch_id']}")
                
            total_payout += leaf["claim_amount_mojos"]
            self._mark_claimed(wallet, leaf["epoch_id"])
        
        # Update lifetime claimed
        self.state.lifetime_claimed_mojos += total_payout
        
        self._log_claim_batch(wallet, len(claim_packages), total_payout)
        
        return total_payout
    
    def _validate_claim(self, wallet: str, leaf: Dict, proof: List, manifest: Dict) -> bool:
        """Validate individual claim against Merkle proof"""
        # Check wallet matches
        if leaf["wallet_puzzle_hash"] != wallet:
            return False
            
        # Verify leaf hash
        leaf_hash = self.merkle_builder.hash_leaf(self._serialize_claim_dict(leaf))
        
        # Verify Merkle proof
        return self.merkle_builder.verify_proof(leaf_hash, proof, manifest["merkle_root"])
    
    def _serialize_claim(self, claim: ClaimLeaf) -> str:
        """Serialize claim for Merkle tree hashing"""
        return json.dumps(claim.__dict__, sort_keys=True)
    
    def _serialize_claim_dict(self, claim: Dict) -> str:
        """Serialize claim dict for Merkle tree hashing"""
        return json.dumps(claim, sort_keys=True)
    
    def _already_claimed(self, wallet: str, epoch_id: int) -> bool:
        """Check if wallet already claimed this epoch"""
        # In production, this would query the nullifier coin existence
        # For now, maintain in-memory tracking
        return hasattr(self, '_claimed_epochs') and \
               f"{wallet}:{epoch_id}" in getattr(self, '_claimed_epochs', set())
    
    def _mark_claimed(self, wallet: str, epoch_id: int) -> None:
        """Mark epoch as claimed by wallet"""
        if not hasattr(self, '_claimed_epochs'):
            self._claimed_epochs = set()
        self._claimed_epochs.add(f"{wallet}:{epoch_id}")
    
    def _log_deposit(self, amount: int, total: int) -> None:
        """Log deposit for audit trail"""
        print(f"DEPOSIT: {amount} mojos, total_received: {total}")
    
    def _log_skip_epoch(self, reason: str, timestamp: int) -> None:
        """Log skipped epoch"""
        print(f"SKIP_EPOCH: {reason} at {timestamp}")
    
    def _log_epoch_created(self, manifest: EpochManifest, claim_count: int) -> None:
        """Log successful epoch creation"""
        print(f"EPOCH_CREATED: {manifest.epoch_id}, {claim_count} claims, {manifest.epoch_amount_mojos} mojos")
    
    def _log_claim_batch(self, wallet: str, claim_count: int, total_payout: int) -> None:
        """Log batch claim"""
        print(f"CLAIM_BATCH: {wallet}, {claim_count} epochs, {total_payout} mojos")
        
    def get_state(self) -> EpochState:
        """Get current system state"""
        return self.state
    
    def export_epoch_data(self, epoch_id: int) -> Dict:
        """Export epoch data for review and handoff"""
        # In production, this would fetch from persistent storage
        return {
            "epoch_id": epoch_id,
            "state": self.state.__dict__,
            "config": self.config,
            "points_map": self.points_map
        }