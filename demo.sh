#!/bin/bash

echo "🎯 Backbone NFT Reward System - Live Demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check prerequisites
echo "📋 Checking Prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found"
    exit 1
else
    echo "✅ Python $(python3 --version | cut -d' ' -f2)"
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
else
    echo "✅ Node.js $(node --version)"
fi

if [ ! -d "backbone_env" ]; then
    echo "❌ Python virtual environment not found"
    exit 1
else
    echo "✅ Python virtual environment ready"
fi

# Test core modules
echo ""
echo "🧪 Testing Core Components..."

# Test Python imports
source backbone_env/bin/activate
cd core
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from src.epoch_builder.epoch_processor import EpochProcessor
    from src.merkle_tree.merkle_builder import MerkleTreeBuilder
    from src.validation.schema_validator import SchemaValidator
    print('✅ Core Python modules import successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"

cd ..

# Test Node.js modules
echo "📦 Testing Node.js Dependencies..."
cd ui
if npm list &> /dev/null; then
    echo "✅ UI dependencies installed"
else
    echo "❌ UI dependencies not properly installed"
fi
cd ..

cd api
if npm list &> /dev/null; then
    echo "✅ API dependencies installed"
else
    echo "❌ API dependencies not properly installed"
fi
cd ..

# Test build process
echo ""
echo "🏗️  Testing Build Process..."
cd ui
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ UI builds successfully"
else
    echo "❌ UI build failed"
fi
cd ..

echo ""
echo "🎉 Demo Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Ready to Start Development Environment:"
echo "   ./start.sh"
echo ""
echo "📊 Access Points:"
echo "   UI Builder:    http://localhost:3000"
echo "   API Server:    http://localhost:3001" 
echo "   Core Engine:   http://localhost:8000"
echo ""
echo "📚 Documentation:"
echo "   Quick Start:   ./QUICK_START.md"
echo "   Architecture:  ./docs/architecture/"
echo "   Examples:      ./examples/"
echo ""
echo "🔧 Next Steps:"
echo "   1. Run ./start.sh to start all services"
echo "   2. Open http://localhost:3000 in browser"
echo "   3. Load sample data and build your reward system"
echo "   4. Export production-ready deployment files"
echo ""
echo "Built by PrimeV2 for FlipThisCrypto 🚀"