# Quick Start Guide

Get Backbone NFT Reward System running in 5 minutes!

## Prerequisites

- **Node.js 18+** (for UI and API)
- **Python 3.11+** (for core computation engine)
- **Git** (for version control)

## 1. Clone and Setup

```bash
git clone https://github.com/FlipThisCrypto/backbone.git
cd backbone
```

## 2. Install Dependencies

```bash
# Create Python virtual environment
python3 -m venv backbone_env
source backbone_env/bin/activate

# Install Python dependencies
pip install -r core/requirements.txt

# Install Node.js dependencies
cd ui && npm install
cd ../api && npm install
cd ..
```

## 3. Start Development Environment

```bash
# Start all services
./start.sh
```

This starts:
- **UI Builder**: http://localhost:3000 (Configuration wizard)
- **API Server**: http://localhost:3001 (REST endpoints)
- **Core Engine**: http://localhost:8000 (Computation engine)

## 4. Build Your First Reward System

1. **Open the UI Builder**: http://localhost:3000
2. **Load Sample Data**: Click "Load Sample" button
3. **Configure Your System**: Walk through 8 screens
4. **Export Files**: Generate deployment artifacts

## 5. Test the System

### Basic Health Check
```bash
curl http://localhost:3001/health
```

### Validate Sample Configuration
```bash
curl -X POST http://localhost:3001/api/validate/config \
  -H "Content-Type: application/json" \
  -d @examples/configs/sample_project_config.json
```

### Initialize Core Engine
```bash
curl -X POST http://localhost:8000/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "config": {...},
    "points_map": {...}
  }'
```

## 6. Generate Production Files

The UI builder generates:
- `project_config.json` - System configuration
- `points_map.json` - NFT point weights  
- `pseudocode.txt` - Human-readable logic
- `reward_pool_singleton.clsp` - Smart contract skeleton
- `review_packet.md` - Complete documentation

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Builder    │    │   API Server    │    │  Core Engine    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port 3000     │    │   Port 3001     │    │   Port 8000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Configuration   │    │ REST Endpoints  │    │ Epoch Processing│
│ Validation      │    │ File Generation │    │ Merkle Trees    │
│ Export System   │    │ Health Checks   │    │ Validation      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Features Included

✅ **Security-First Design**
- Nullifier pattern prevents double claims
- Admin authorization for epoch commits
- Atomic operations prevent race conditions

✅ **Production-Ready**
- Complete test coverage approach
- Comprehensive error handling
- Monitoring and health checks

✅ **Developer-Friendly**
- Real-time configuration validation
- Auto-generated documentation
- Sample data and examples

## Next Steps

1. **Customize Configuration**: Modify for your specific NFT collection
2. **Security Review**: Audit generated smart contracts
3. **Deploy to Testnet**: Test with real Chia blockchain
4. **Production Deployment**: Deploy to mainnet

## Common Commands

```bash
# Start development environment
./start.sh

# Stop all services
pkill -f 'node\|uvicorn\|next'

# Run tests
cd core && python -m pytest
cd ui && npm test
cd api && npm test

# Build for production
cd ui && npm run build
```

## Troubleshooting

**Port already in use?**
```bash
# Kill processes on ports
pkill -f 'node\|uvicorn\|next'
```

**Python dependencies failing?**
```bash
# Ensure you're in virtual environment
source backbone_env/bin/activate
pip install --upgrade pip
```

**UI not loading?**
```bash
# Check Node.js version
node --version  # Should be 18+
cd ui && npm install
```

## Support

- **Documentation**: `/docs` directory
- **Examples**: `/examples` directory  
- **Issues**: GitHub Issues
- **Security**: security@flipthiscrypto.com

---

**Built by PrimeV2 for FlipThisCrypto**
Production-Ready NFT Reward Distribution System