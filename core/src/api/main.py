"""
Core API - FastAPI server for Backbone computation engine
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import json
from datetime import datetime

# Import our core modules
from ..epoch_builder.epoch_processor import EpochProcessor, EpochState
from ..validation.schema_validator import SchemaValidator

app = FastAPI(
    title="Backbone Core API",
    description="NFT Reward System Computation Engine",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state (in production, this would be persistent storage)
processor = None
validator = SchemaValidator()

class ConfigRequest(BaseModel):
    config: Dict[str, Any]
    points_map: Dict[str, Any]

class DepositRequest(BaseModel):
    amount: int

class SnapshotRequest(BaseModel):
    timestamp: int
    ownership_data: Dict[str, int]

@app.get("/")
async def root():
    return {
        "service": "backbone-core-api",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "processor_initialized": processor is not None
    }

@app.post("/initialize")
async def initialize_processor(request: ConfigRequest):
    """Initialize the epoch processor with configuration"""
    global processor
    
    try:
        # Validate configuration
        if not validator.validate_project_config(request.config):
            raise HTTPException(status_code=400, detail={
                "error": "Invalid project configuration",
                "details": validator.get_errors()
            })
        
        if not validator.validate_points_map(request.points_map):
            raise HTTPException(status_code=400, detail={
                "error": "Invalid points map",
                "details": validator.get_errors()
            })
        
        # Save configs temporarily (in production, use proper storage)
        with open("/tmp/backbone_config.json", "w") as f:
            json.dump(request.config, f)
        with open("/tmp/backbone_points.json", "w") as f:
            json.dump(request.points_map, f)
        
        # Initialize processor
        processor = EpochProcessor("/tmp/backbone_config.json", "/tmp/backbone_points.json")
        
        return {
            "status": "initialized",
            "config_valid": True,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deposit")
async def handle_deposit(request: DepositRequest):
    """Handle XCH deposit to reward pool"""
    if not processor:
        raise HTTPException(status_code=400, detail="Processor not initialized")
    
    try:
        processor.on_deposit(request.amount)
        state = processor.get_state()
        
        return {
            "status": "deposit_processed",
            "amount": request.amount,
            "new_total": state.total_received_mojos,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/snapshot")
async def process_snapshot(request: SnapshotRequest):
    """Process NFT ownership snapshot and generate epoch if funded"""
    if not processor:
        raise HTTPException(status_code=400, detail="Processor not initialized")
    
    try:
        manifest, claims = processor.on_snapshot(
            request.timestamp, 
            request.ownership_data
        )
        
        if manifest is None:
            return {
                "status": "epoch_skipped",
                "reason": "No funding or no minted points",
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "status": "epoch_created",
            "epoch_id": manifest.epoch_id,
            "manifest": manifest.__dict__,
            "claims_count": len(claims),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/state")
async def get_system_state():
    """Get current system state"""
    if not processor:
        raise HTTPException(status_code=400, detail="Processor not initialized")
    
    state = processor.get_state()
    return {
        "state": state.__dict__,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/validate")
async def validate_configuration(request: ConfigRequest):
    """Validate configuration without initializing processor"""
    try:
        config_valid = validator.validate_project_config(request.config)
        points_valid = validator.validate_points_map(request.points_map)
        
        return {
            "config_valid": config_valid,
            "points_valid": points_valid,
            "errors": validator.get_errors() if not (config_valid and points_valid) else [],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)