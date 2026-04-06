import { ProjectConfig, PointsMap, ValidationResult, ValidationError } from '@/types/config'

export function validateConfiguration(
  config: Partial<ProjectConfig>, 
  pointsMap: Partial<PointsMap>
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let score = 100

  // Hard validation errors (-15 to -20 points each)
  if (!config.project_name?.trim()) {
    errors.push({ field: 'project_name', message: 'Project name is required', severity: 'error' })
    score -= 15
  }

  if (!config.collection_id?.trim()) {
    errors.push({ field: 'collection_id', message: 'Collection ID is required', severity: 'error' })
    score -= 15
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.collection_id)) {
    errors.push({ field: 'collection_id', message: 'Collection ID must be valid UUID format (e.g. 4f4c447b-66c4-48de-bc27-4e6900176500)', severity: 'error' })
    score -= 15
  }

  if (!config.wallets?.reward_pool) {
    errors.push({ field: 'wallets.reward_pool', message: 'Reward pool wallet is required', severity: 'error' })
    score -= 15
  } else if (!/^xch[a-z0-9]{59}$/.test(config.wallets.reward_pool)) {
    errors.push({ field: 'wallets.reward_pool', message: 'Invalid Chia wallet address format', severity: 'error' })
    score -= 10
  }

  if (!config.wallets?.admin_pubkey) {
    errors.push({ field: 'wallets.admin_pubkey', message: 'Admin public key is required', severity: 'error' })
    score -= 15
  } else if (!/^[a-fA-F0-9]{96}$/.test(config.wallets.admin_pubkey)) {
    errors.push({ field: 'wallets.admin_pubkey', message: 'Admin public key must be 96-character hex string', severity: 'error' })
    score -= 15
  }

  if (!config.wallets?.developer) {
    errors.push({ field: 'wallets.developer', message: 'Developer wallet is required', severity: 'error' })
    score -= 15
  } else if (!/^xch[a-z0-9]{59}$/.test(config.wallets.developer)) {
    errors.push({ field: 'wallets.developer', message: 'Invalid developer wallet address format', severity: 'error' })
    score -= 10
  }

  // Validate supply and points mapping
  if (config.total_supply && pointsMap.total_supply) {
    if (config.total_supply !== pointsMap.total_supply) {
      errors.push({ field: 'total_supply', message: 'Total supply mismatch between config and points map', severity: 'error' })
      score -= 20
    }
  }

  // Validate points distribution totals
  if (pointsMap.point_distribution?.buckets && pointsMap.point_distribution?.totals) {
    const buckets = pointsMap.point_distribution.buckets
    const totals = pointsMap.point_distribution.totals
    
    const calculatedCardCount = Object.values(buckets).reduce((sum, bucket) => sum + bucket.count, 0)
    const calculatedWeightedPoints = Object.values(buckets).reduce((sum, bucket) => sum + (bucket.points * bucket.count), 0)
    
    if (calculatedCardCount !== totals.card_count) {
      errors.push({ field: 'point_distribution', message: 'Card count calculation mismatch', severity: 'error' })
      score -= 15
    }
    
    if (calculatedWeightedPoints !== totals.weighted_points) {
      errors.push({ field: 'point_distribution', message: 'Weighted points calculation mismatch', severity: 'error' })
      score -= 15
    }

    if (config.total_supply && calculatedCardCount !== config.total_supply) {
      errors.push({ field: 'point_distribution', message: 'Points map card count does not match total supply', severity: 'error' })
      score -= 20
    }
  }

  // Validate funding splits
  if (config.funding?.primary_split) {
    const primary = config.funding.primary_split
    const total = primary.developer_pct + primary.reward_pool_pct
    if (Math.abs(total - 100) > 0.01) {
      errors.push({ field: 'funding.primary_split', message: 'Primary split must total 100%', severity: 'error' })
      score -= 20
    }
  }

  if (config.funding?.royalty_split) {
    const royalty = config.funding.royalty_split
    const total = royalty.developer_pct + royalty.reward_pool_pct + (royalty.project_a_pct || 0) + (royalty.project_b_pct || 0)
    if (Math.abs(total - 100) > 0.01) {
      errors.push({ field: 'funding.royalty_split', message: 'Royalty split must total 100%', severity: 'error' })
      score -= 20
    }

    // Check required wallets for non-zero splits
    if ((royalty.project_a_pct || 0) > 0 && !config.wallets?.project_a) {
      errors.push({ field: 'wallets.project_a', message: 'Project A wallet required when Project A percentage > 0', severity: 'error' })
      score -= 15
    }
    if ((royalty.project_b_pct || 0) > 0 && !config.wallets?.project_b) {
      errors.push({ field: 'wallets.project_b', message: 'Project B wallet required when Project B percentage > 0', severity: 'error' })
      score -= 15
    }
  }

  // Warning validations (-3 to -15 points each)
  if (config.funding?.behavior?.random_xch_counts_as_funding) {
    warnings.push({ field: 'funding.behavior', message: 'Random XCH funding enabled - may complicate accounting', severity: 'warning' })
    score -= 3
  }

  if (config.funding?.behavior?.funding_mode && config.funding.behavior.funding_mode !== 'delta_only') {
    warnings.push({ field: 'funding.behavior', message: 'Non-delta funding mode selected - may cause issues', severity: 'warning' })
    score -= 15
  }

  if (config.claims?.claim_type === 'partial_allowed') {
    warnings.push({ field: 'claims.claim_type', message: 'Partial claims add complexity', severity: 'warning' })
    score -= 8
  }

  if (config.claims?.fees_paid_by === 'pool') {
    warnings.push({ field: 'claims.fees_paid_by', message: 'Pool-paid fees increase operating costs', severity: 'warning' })
    score -= 8
  }

  if (config.claims?.transfer_rule === 'current_wallet') {
    warnings.push({ field: 'claims.transfer_rule', message: 'Current wallet rule may move old rewards unexpectedly', severity: 'warning' })
    score -= 10
  }

  if (config.claims?.unclaimed_rewards === 'forfeit_to_pool') {
    warnings.push({ field: 'claims.unclaimed_rewards', message: 'Forfeit rule enabled - holders may lose rewards', severity: 'warning' })
    score -= 7
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.round(score))

  // Determine readiness level
  let readiness: 'strong' | 'usable' | 'needs_work'
  if (score >= 90) readiness = 'strong'
  else if (score >= 75) readiness = 'usable' 
  else readiness = 'needs_work'

  return {
    score,
    errors,
    warnings,
    isValid: errors.length === 0,
    readiness
  }
}

export function validateWalletAddress(address: string): boolean {
  return /^xch1[a-z0-9]{55}$/.test(address)
}

export function validateCollectionId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export function validatePublicKey(key: string): boolean {
  return /^[a-fA-F0-9]{96}$/.test(key)
}

export function calculatePointsTotals(buckets: Record<string, { points: number; count: number }>) {
  const cardCount = Object.values(buckets).reduce((sum, bucket) => sum + bucket.count, 0)
  const weightedPoints = Object.values(buckets).reduce((sum, bucket) => sum + (bucket.points * bucket.count), 0)
  
  return { cardCount, weightedPoints }
}