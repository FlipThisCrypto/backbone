# Backbone Tailscale Access

## 🔗 Live Access Points

The complete Backbone NFT Reward Distribution System is now running and accessible via Tailscale:

### **🎨 UI Builder (Primary Interface)**
```
https://sentinel.tail105037.ts.net/
```
- Complete 8-screen configuration wizard
- Real-time validation with scoring system
- Load sample configurations
- Export deployment artifacts
- Generate review packets and documentation

### **📡 Core Engine (Python/FastAPI)**
```  
https://sentinel.tail105037.ts.net:8001/
```
- Health check: `/health`
- Initialize processor: `/initialize`  
- Handle deposits: `/deposit`
- Process snapshots: `/snapshot`
- Get system state: `/state`
- Validate config: `/validate`

### **🔌 API Server (Node.js/Express)**
```
https://sentinel.tail105037.ts.net:3001/
```
- Health check: `/health`
- Config endpoints: `/api/config/*`
- Validation: `/api/validate/config`
- Code generation: `/api/generate/*`

## 🚦 Service Status

All services are running in background mode:

```bash
# Check if services are running
ps aux | grep -E "(uvicorn|node)" | grep -v grep

# View logs
tail -f ~/backbone/backbone_core.log    # Core Engine logs
tail -f ~/backbone/backbone_api.log     # API Server logs  
tail -f ~/backbone/backbone_ui.log      # UI Builder logs
```

## 🎯 Quick Start via Tailscale

1. **Open the UI Builder**: https://sentinel.tail105037.ts.net/
2. **Click "Load Sample"** to populate with example data
3. **Walk through the 8-screen wizard**:
   - Project Setup
   - Collection Configuration  
   - Wallet Configuration
   - Funding Setup
   - Points Map
   - Epochs Configuration
   - Claims Rules
   - Review & Export
4. **Export deployment files** when complete

## 🔧 API Testing Examples

Test the Core Engine health:
```bash
curl https://sentinel.tail105037.ts.net:8001/health
```

Test configuration validation:
```bash
curl -X POST https://sentinel.tail105037.ts.net:3001/api/validate/config \
  -H "Content-Type: application/json" \
  -d '{"config": {...}, "pointsMap": {...}}'
```

## 📁 File System Access

The complete system is also available directly on the server at:
```
/home/rac-app-server/backbone/
```

Key directories:
- `/contracts/` - Chialisp smart contracts
- `/core/` - Python computation engine
- `/api/` - Node.js API server  
- `/ui/` - React/Next.js interface
- `/docs/` - Complete documentation
- `/examples/` - Sample configurations

## 🏗️ System Architecture Running

```
Tailscale Network (tail105037.ts.net)
└── sentinel (100.102.141.121)
    ├── UI Builder (:3000) → :443/tcp
    ├── Core Engine (:8000) → :8001/tcp  
    ├── API Server (:3001) → :3001/tcp
    └── File System Access via SSH

Security: Tailnet-only access, no public internet exposure
```

## 🔐 Security Features Active

- **Nullifier Pattern**: Prevents double claims without state bloat
- **Admin Authorization**: Signed epoch commits prevent unauthorized operations
- **Atomic Operations**: Prevents concurrency races  
- **Delta Funding**: Elegant accounting with automatic dust handling
- **Schema Validation**: Real-time configuration validation
- **HTTPS Encryption**: All Tailscale traffic encrypted

## 📊 System Capabilities

✅ **Complete NFT Reward System**: From configuration to deployment  
✅ **Real-time Validation**: Live scoring and error detection  
✅ **Production Export**: Generate all deployment artifacts  
✅ **Security Architecture**: Addresses all identified Chialisp gotchas  
✅ **Sample Data**: Pre-loaded examples for quick testing  
✅ **Documentation**: Complete technical and user guides  

## 🎉 Ready for Use

The system is **immediately usable** for:

1. **Building reward systems** for any NFT collection
2. **Testing configurations** with real-time feedback  
3. **Exporting production files** ready for blockchain deployment
4. **Learning the architecture** through working examples
5. **Customizing and extending** for specific needs

## Support

- **Live System**: All services running and accessible
- **Documentation**: Complete guides in `/docs/`  
- **Examples**: Working configurations in `/examples/`
- **Logs**: Real-time service logs available
- **Source Code**: Full access via Tailscale or GitHub

---

**Built by PrimeV2 for FlipThisCrypto**  
**Deployed on Sentinel via Tailscale** 🚀

**Production-Ready NFT Reward Distribution System**