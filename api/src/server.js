/**
 * Backbone API Server
 * REST API for NFT reward system configuration and management
 */

const fastify = require('fastify')({ 
  logger: { level: 'info' } 
});
const path = require('path');
const fs = require('fs');

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: true
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'backbone-api',
    version: '1.0.0'
  };
});

// Configuration endpoints
fastify.get('/api/config/project', async (request, reply) => {
  return {
    message: 'Project configuration endpoint',
    schema: 'project_config_schema.json'
  };
});

fastify.get('/api/config/points', async (request, reply) => {
  return {
    message: 'Points map configuration endpoint', 
    schema: 'points_map_schema.json'
  };
});

// Validation endpoints
fastify.post('/api/validate/config', async (request, reply) => {
  const { config, pointsMap } = request.body;
  
  // Comprehensive validation matching UI logic
  const errors = [];
  const warnings = [];
  let score = 100;
  
  // Project name validation
  if (!config?.project_name?.trim()) {
    errors.push({ field: 'project_name', message: 'Project name is required', severity: 'error' });
    score -= 15;
  }
  
  // Collection ID validation (UUID format)
  if (!config?.collection_id?.trim()) {
    errors.push({ field: 'collection_id', message: 'Collection ID is required', severity: 'error' });
    score -= 15;
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.collection_id)) {
    errors.push({ field: 'collection_id', message: 'Collection ID must be valid UUID format (e.g. 4f4c447b-66c4-48de-bc27-4e6900176500)', severity: 'error' });
    score -= 15;
  }
  
  // Wallet validation
  if (!config?.wallets?.reward_pool) {
    errors.push({ field: 'wallets.reward_pool', message: 'Reward pool wallet is required', severity: 'error' });
    score -= 15;
  } else if (!/^xch1[a-z0-9]{54}$/.test(config.wallets.reward_pool)) {
    errors.push({ field: 'wallets.reward_pool', message: 'Invalid Chia wallet address format', severity: 'error' });
    score -= 10;
  }
  
  if (!config?.wallets?.admin_pubkey) {
    errors.push({ field: 'wallets.admin_pubkey', message: 'Admin public key is required', severity: 'error' });
    score -= 15;
  } else if (!/^[a-fA-F0-9]{96}$/.test(config.wallets.admin_pubkey)) {
    errors.push({ field: 'wallets.admin_pubkey', message: 'Admin public key must be 96-character hex string', severity: 'error' });
    score -= 15;
  }
  
  if (!config?.wallets?.developer) {
    errors.push({ field: 'wallets.developer', message: 'Developer wallet is required', severity: 'error' });
    score -= 15;
  } else if (!/^xch1[a-z0-9]{54}$/.test(config.wallets.developer)) {
    errors.push({ field: 'wallets.developer', message: 'Invalid developer wallet address format', severity: 'error' });
    score -= 10;
  }
  
  // Total supply validation
  if (typeof config?.total_supply !== 'number' || config.total_supply < 1) {
    errors.push({ field: 'total_supply', message: 'Total supply must be a positive number', severity: 'error' });
    score -= 10;
  }
  
  score = Math.max(0, score);
  
  return {
    score,
    errors,
    warnings,
    isValid: errors.length === 0
  };
});

// Generation endpoints
fastify.post('/api/generate/pseudocode', async (request, reply) => {
  const { config } = request.body;
  
  const pseudocode = `
BACKBONE REWARD SYSTEM V1 PSEUDOCODE
Generated for: ${config?.project_name || 'Unknown Project'}

state:
  total_received_mojos = 0
  total_allocated_mojos = 0
  current_epoch_id = 0

on_deposit(amount):
  total_received_mojos += amount

on_snapshot(timestamp):
  # Implementation would go here
  return "Epoch processing logic"
`;

  return { pseudocode };
});

fastify.post('/api/generate/chialisp', async (request, reply) => {
  const { config } = request.body;
  
  const chialisp = `
;; Backbone Reward Pool Singleton
;; Generated for: ${config?.project_name || 'Unknown Project'}
;;
;; This is a skeleton - implement full logic for production

(mod (singleton_struct solution)
  ;; Placeholder implementation
  (list "BACKBONE_SKELETON")
)
`;

  return { chialisp };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Backbone API server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();