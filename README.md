# Backbone - Chia NFT Reward Distribution System

A production-ready, trustless NFT reward distribution system for the Chia blockchain.

## Architecture Overview

**Backbone** implements a scalable, off-chain computation model with on-chain verification using Merkle trees. The system handles periodic reward distribution to NFT holders based on configurable point weights and funding sources.

### Key Features

- **Trustless Claims**: Users verify their rewards using Merkle proofs
- **Batch Operations**: Multiple epoch claims in single transactions
- **Delta Funding**: Elegant accounting with automatic dust handling
- **Scalable Design**: Heavy computation off-chain, minimal on-chain footprint
- **Production Ready**: Addresses state bloat, concurrency races, and authorization

## Components

### 1. Builder UI (`/ui`)
Visual configuration tool with 8 screens for system setup:
- Project Setup
- Wallets and Keys  
- Points and Supply
- Funding and Splits
- Epoch Rules
- Claim Rules
- Validation and Outputs
- Review Packet Preview

### 2. Core Engine (`/core`)
Off-chain computation engine:
- **Snapshot Engine**: NFT ownership tracking
- **Epoch Builder**: Reward calculation and Merkle tree generation
- **Config Manager**: JSON schema validation

### 3. Chialisp Contracts (`/contracts`)
On-chain verification layer:
- **Reward Pool Singleton**: State management and authorization
- **Nullifier Pattern**: Prevents double claims without state bloat
- **Merkle Verification**: Trustless claim validation

### 4. API & Orchestration (`/api`)
RESTful API and workflow coordination:
- Config generation endpoints
- Epoch processing triggers
- Claim verification services

## Critical Security Features

### Double Claim Prevention
Uses nullifier pattern instead of state storage to prevent infinite contract growth:
```chialisp
; Creates unique nullifier coin for each claim
(sha256 epoch_id wallet_puzzle_hash)
```

### Administrative Authorization
Epoch commits require authorized signature:
```chialisp
; Only admin can commit new Merkle roots
(assert (validate_signature admin_pubkey epoch_root))
```

### Atomic State Management
Prevents snapshot/sync concurrency races through atomic updates of `total_received`.

## Quick Start

```bash
# Install dependencies
npm install

# Start development environment
npm run dev

# Build for production  
npm run build

# Run tests
npm test
```

## Development Setup

Requirements:
- Node.js 18+
- Python 3.9+ (for Chia tools)
- Rust 1.70+ (for performance-critical components)

## Project Structure

```
backbone/
├── ui/                 # Builder interface (React/Next.js)
├── core/              # Computation engine (Python/Rust)
├── contracts/         # Chialisp smart contracts
├── api/               # REST API (Node.js/Fastify)
├── docs/              # Documentation
├── examples/          # Usage examples
└── tools/             # Development utilities
```

## Security Model

1. **Off-chain Computation**: Snapshot aggregation, point calculation, Merkle tree generation
2. **On-chain Verification**: State management, proof verification, payout authorization  
3. **Trust Boundaries**: Users trust admin for correct epoch commits, verify their slice trustlessly

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE)

---

Built by [FlipThisCrypto](https://github.com/FlipThisCrypto)