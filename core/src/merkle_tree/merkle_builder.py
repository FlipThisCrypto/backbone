"""
Merkle Tree Builder - Cryptographically secure proof generation
Implements standard binary Merkle tree with SHA256 hashing
"""

import hashlib
import json
from typing import List, Optional, Tuple, Dict
from dataclasses import dataclass

@dataclass
class MerkleProof:
    """Merkle proof data structure"""
    leaf_hash: str
    proof_path: List[Tuple[str, bool]]  # (hash, is_right_sibling)
    root: str
    leaf_index: int

class MerkleTreeBuilder:
    """
    Production-ready Merkle tree implementation
    Used for generating trustless claim proofs
    """
    
    def __init__(self):
        self.hash_function = hashlib.sha256
    
    def hash_data(self, data: str) -> str:
        """Hash data using SHA256"""
        return self.hash_function(data.encode('utf-8')).hexdigest()
    
    def hash_leaf(self, leaf_data: str) -> str:
        """Hash leaf data with prefix to prevent second preimage attacks"""
        return self.hash_data(f"LEAF:{leaf_data}")
    
    def hash_internal(self, left: str, right: str) -> str:
        """Hash internal node with prefix"""
        return self.hash_data(f"INTERNAL:{left}{right}")
    
    def build_tree(self, leaf_data: List[str]) -> str:
        """
        Build Merkle tree and return root hash
        
        Args:
            leaf_data: List of serialized leaf data (claims)
            
        Returns:
            Root hash as hex string
        """
        if not leaf_data:
            raise ValueError("Cannot build tree with empty leaf data")
        
        # Hash all leaves
        leaves = [self.hash_leaf(data) for data in leaf_data]
        
        # Build tree bottom-up
        current_level = leaves
        
        while len(current_level) > 1:
            next_level = []
            
            # Process pairs
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                
                # Handle odd number of nodes by duplicating last
                if i + 1 < len(current_level):
                    right = current_level[i + 1]
                else:
                    right = left  # Duplicate last node
                
                # Create parent hash
                parent = self.hash_internal(left, right)
                next_level.append(parent)
            
            current_level = next_level
        
        # Store tree for proof generation
        self._last_leaves = leaves
        self._last_leaf_data = leaf_data
        
        return current_level[0]  # Root hash
    
    def generate_proof(self, leaf_index: int) -> MerkleProof:
        """
        Generate Merkle proof for leaf at given index
        
        Args:
            leaf_index: Index of leaf to prove
            
        Returns:
            MerkleProof object with path to root
        """
        if not hasattr(self, '_last_leaves'):
            raise ValueError("Must build tree before generating proofs")
        
        if leaf_index >= len(self._last_leaves):
            raise ValueError(f"Leaf index {leaf_index} out of range")
        
        leaves = self._last_leaves.copy()
        proof_path = []
        current_index = leaf_index
        
        # Build proof path bottom-up
        current_level = leaves
        
        while len(current_level) > 1:
            next_level = []
            
            # Find sibling for current index
            if current_index % 2 == 0:
                # Current is left child
                sibling_index = current_index + 1
                is_right_sibling = True
            else:
                # Current is right child  
                sibling_index = current_index - 1
                is_right_sibling = False
            
            # Get sibling hash (handle odd length)
            if sibling_index < len(current_level):
                sibling_hash = current_level[sibling_index]
            else:
                sibling_hash = current_level[current_index]  # Duplicate
            
            proof_path.append((sibling_hash, is_right_sibling))
            
            # Build next level and find parent index
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                next_level.append(self.hash_internal(left, right))
            
            current_level = next_level
            current_index //= 2
        
        # Generate root from leaf using proof path
        root = self._compute_root_from_proof(
            self._last_leaves[leaf_index],
            proof_path
        )
        
        return MerkleProof(
            leaf_hash=self._last_leaves[leaf_index],
            proof_path=proof_path,
            root=root,
            leaf_index=leaf_index
        )
    
    def verify_proof(self, leaf_hash: str, proof_path: List[Tuple[str, bool]], root: str) -> bool:
        """
        Verify Merkle proof against root
        
        Args:
            leaf_hash: Hash of the leaf being proven
            proof_path: List of (sibling_hash, is_right_sibling) tuples
            root: Expected root hash
            
        Returns:
            True if proof is valid
        """
        computed_root = self._compute_root_from_proof(leaf_hash, proof_path)
        return computed_root == root
    
    def _compute_root_from_proof(self, leaf_hash: str, proof_path: List[Tuple[str, bool]]) -> str:
        """Compute root hash from leaf and proof path"""
        current_hash = leaf_hash
        
        for sibling_hash, is_right_sibling in proof_path:
            if is_right_sibling:
                # Sibling is on the right
                current_hash = self.hash_internal(current_hash, sibling_hash)
            else:
                # Sibling is on the left
                current_hash = self.hash_internal(sibling_hash, current_hash)
        
        return current_hash
    
    def generate_all_proofs(self) -> List[MerkleProof]:
        """Generate proofs for all leaves in the last built tree"""
        if not hasattr(self, '_last_leaves'):
            raise ValueError("Must build tree before generating proofs")
        
        return [self.generate_proof(i) for i in range(len(self._last_leaves))]
    
    def export_tree_data(self) -> Dict:
        """Export tree data for debugging and verification"""
        if not hasattr(self, '_last_leaves'):
            return {}
        
        return {
            "leaf_count": len(self._last_leaves),
            "leaf_hashes": self._last_leaves,
            "root": self.build_tree(self._last_leaf_data),
            "tree_depth": len(self.generate_proof(0).proof_path) if self._last_leaves else 0
        }
    
    def batch_verify_proofs(self, proofs: List[MerkleProof]) -> Dict[int, bool]:
        """
        Verify multiple proofs efficiently
        
        Returns:
            Dict mapping leaf_index -> verification_result
        """
        results = {}
        
        for proof in proofs:
            results[proof.leaf_index] = self.verify_proof(
                proof.leaf_hash,
                proof.proof_path, 
                proof.root
            )
        
        return results

# Utility functions for integration
def create_claim_merkle_tree(claims: List[Dict]) -> Tuple[str, List[MerkleProof]]:
    """
    Create Merkle tree from claim data and return root + all proofs
    
    Args:
        claims: List of claim dictionaries
        
    Returns:
        (root_hash, list_of_proofs)
    """
    builder = MerkleTreeBuilder()
    
    # Serialize claims consistently
    leaf_data = [json.dumps(claim, sort_keys=True) for claim in claims]
    
    # Build tree
    root = builder.build_tree(leaf_data)
    
    # Generate all proofs
    proofs = builder.generate_all_proofs()
    
    return root, proofs

def verify_claim_proof(claim: Dict, proof: MerkleProof, expected_root: str) -> bool:
    """
    Verify a single claim against its Merkle proof
    
    Args:
        claim: Claim data dictionary
        proof: Merkle proof for the claim
        expected_root: Expected tree root hash
        
    Returns:
        True if proof is valid
    """
    builder = MerkleTreeBuilder()
    
    # Serialize claim consistently  
    claim_data = json.dumps(claim, sort_keys=True)
    claim_hash = builder.hash_leaf(claim_data)
    
    # Verify proof
    return builder.verify_proof(claim_hash, proof.proof_path, expected_root)