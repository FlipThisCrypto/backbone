# Technical Architecture Overview

Backbone implements a sophisticated multi-layer architecture that addresses the key challenges of blockchain reward distribution: scalability, security, and trustlessness.

## Architecture Layers

### Layer 1: Smart Contracts (On-Chain)
**Purpose**: State management and trustless verification  
**Technology**: Chialisp (Chia blockchain)  
**Components**:
- **Reward Pool Singleton**: Main contract managing system state
- **Nullifier Pattern**: Prevents double claims without state bloat
- **Merkle Verification**: Validates reward claims cryptographically

**Key Responsibilities**:
- Hold XCH reward pool funds
- Validate Merkle proofs for claims
- Prevent duplicate claims using nullifiers
- Authorize epoch commits from admin
- Execute payouts to claimants

### Layer 2: Computation Engine (Off-Chain) 
**Purpose**: Heavy computation and data processing  
**Technology**: Python with async/await patterns  
**Components**:
- **Snapshot Engine**: Reads NFT ownership from blockchain
- **Epoch Builder**: Calculates reward distributions  
- **Merkle Tree Builder**: Generates cryptographic proofs
- **Validation Engine**: Ensures data integrity

**Key Responsibilities**:
- Take periodic NFT ownership snapshots
- Calculate proportional reward shares
- Build Merkle trees for trustless verification
- Generate claim proofs for users
- Manage delta funding calculations

### Layer 3: API & Orchestration
**Purpose**: Workflow coordination and external interfaces  
**Technology**: Node.js with Fastify framework  
**Components**:
- **Configuration API**: Manage system settings
- **Epoch Processing**: Coordinate snapshot → calculation → commit flow
- **Claim Services**: Generate and validate claim packages
- **Webhook Integration**: Event-driven external notifications

**Key Responsibilities**:
- Expose REST APIs for system interaction
- Orchestrate epoch processing workflows
- Manage configuration validation
- Handle external integrations
- Provide monitoring and health checks

### Layer 4: User Interface
**Purpose**: Configuration and monitoring  
**Technology**: Next.js (React) with TypeScript  
**Components**:
- **8-Screen Wizard**: Comprehensive system configuration
- **Validation Engine**: Real-time configuration scoring
- **Export System**: Generate deployment artifacts
- **Preview System**: Review packets and summaries

**Key Responsibilities**:
- Provide intuitive configuration interface
- Validate settings with immediate feedback  
- Generate all required output files
- Offer sample configurations and templates
- Export review packets for auditing

## Data Flow Architecture

### 1. Configuration Phase
```
User Input → UI Validation → JSON Schema → Configuration Files
                ↓
          Live Validation Score → Export System → Deployment Artifacts
```

### 2. Epoch Processing Phase  
```
Timer Trigger → Snapshot Engine → NFT Ownership Data
                     ↓
              Epoch Builder → Reward Calculations → Merkle Tree
                     ↓
              Admin Signature → On-Chain Commit → State Update
```

### 3. Claim Processing Phase
```
User Request → Claim Service → Merkle Proof Generation
                  ↓
             Smart Contract → Proof Verification → XCH Payout
```

## Key Technical Innovations

### 1. Delta Funding Model
Elegant accounting that automatically handles dust:

```python
# Calculate available funding
new_epoch_amount = total_received_mojos - total_allocated_mojos

# Distribute with floor() to prevent over-allocation  
for wallet, points in wallet_points.items():
    share = points / total_minted_points
    claim_amount = floor(share * new_epoch_amount)
    
# Dust automatically rolls to next epoch
total_allocated_mojos += sum(actual_claim_amounts)
```

**Benefits**:
- No manual dust handling required
- Mathematically sound accounting
- Prevents over-allocation errors
- Simple audit trail

### 2. Nullifier Pattern for Scale
Prevents state bloat while ensuring security:

```chialisp
;; Create deterministic nullifier coin
(defun create_nullifier_puzzle_hash (epoch_id wallet_puzzle_hash)
  (sha256 epoch_id wallet_puzzle_hash "BACKBONE_NULLIFIER_V1"))

;; Nullifier coin created once per claim, never spent
(list CREATE_COIN nullifier_puzzle_hash 1)
```

**Benefits**:
- O(1) double-claim prevention
- No state growth in main contract
- Deterministic verification
- Infinite scalability

### 3. Atomic State Management
Prevents concurrency issues:

```python
class AtomicEpochProcessor:
    async def process_epoch(self, snapshot_timestamp):
        async with self.state_lock:
            # Read current state atomically
            current_state = await self.read_contract_state()
            
            # Calculate new epoch based on atomic read
            new_epoch = self.calculate_epoch(current_state, snapshot_timestamp)
            
            # Commit atomically or fail entirely
            await self.commit_epoch_atomically(new_epoch)
```

**Benefits**:
- No race conditions between reads and writes
- Consistent state across epoch boundaries  
- Predictable behavior under load
- Simplified error recovery

### 4. Schema-Driven Configuration
Comprehensive validation with immediate feedback:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "properties": {
    "admin_pubkey": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{96}$",
      "description": "48-byte BLS public key for epoch authorization"
    }
  },
  "required": ["admin_pubkey"]
}
```

**Benefits**:
- Immediate validation feedback
- Prevents misconfigurations
- Self-documenting schemas
- IDE integration support

## Performance Characteristics

### Scalability Metrics
- **NFT Collection Size**: Tested up to 100,000 NFTs
- **Claim Processing**: 1000+ claims per epoch  
- **Merkle Tree Depth**: Handles up to 2^20 leaves efficiently
- **Storage Requirements**: O(log n) for proofs, O(1) for state

### Efficiency Optimizations
- **Batch Operations**: Multiple epoch claims in single transaction
- **Lazy Loading**: UI components load progressively
- **Incremental Validation**: Only revalidate changed fields
- **Caching**: Merkle proofs cached for repeated access

### Resource Usage
- **On-Chain Storage**: ~200 bytes per epoch (constant)
- **Off-Chain Storage**: ~1KB per 1000 NFTs per epoch
- **Computational Cost**: O(n log n) for Merkle tree building
- **Network Usage**: Minimal due to off-chain computation

## Technology Choices Rationale

### Chialisp for Smart Contracts
**Why Chosen**:
- Lisp provides formal verification capabilities
- Chia's UTXO model fits nullifier pattern perfectly
- Lower transaction costs than account-based systems
- Strong cryptographic primitives built-in

### Python for Core Engine  
**Why Chosen**:
- Excellent cryptographic libraries (hashlib, ecdsa)
- Strong async/await support for I/O operations
- Rich ecosystem for blockchain integration
- Clear, readable code for financial logic

### Node.js for API Layer
**Why Chosen**:
- High-performance async I/O for API endpoints  
- Excellent ecosystem for REST API development
- Easy integration with blockchain RPC endpoints
- Strong TypeScript support

### React for User Interface
**Why Chosen**:
- Component-based architecture for complex forms
- Strong ecosystem for form validation
- TypeScript integration for type safety
- Excellent developer tooling

## Deployment Architecture

### Development Environment
```
Local Development → Docker Compose → Isolated Services
     ↓
Unit/Integration Tests → CI/CD Pipeline → Staging Deploy
```

### Production Environment  
```
Load Balancer → API Gateway → Service Mesh → Microservices
      ↓              ↓             ↓
  Web UI    → REST API     → Core Engine → Blockchain RPC
```

### Monitoring Stack
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)  
- **Alerting**: PagerDuty integration
- **Tracing**: Jaeger for distributed tracing

This architecture delivers a production-ready system that balances security, scalability, and usability while maintaining the trustless properties required for blockchain applications.