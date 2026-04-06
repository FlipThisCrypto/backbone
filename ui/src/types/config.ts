export interface ProjectConfig {
  version: string
  project_name: string
  collection_id: string
  reward_asset: 'XCH'
  total_supply: number
  wallets: {
    reward_pool: string
    admin_pubkey: string
    developer: string
    project_a?: string
    project_b?: string
  }
  funding: {
    primary_split: {
      developer_pct: number
      reward_pool_pct: number
    }
    royalty_split: {
      developer_pct: number
      reward_pool_pct: number
      project_a_pct?: number
      project_b_pct?: number
    }
    behavior: {
      future_collections_fund_pool: boolean
      random_xch_counts_as_funding: boolean
      funding_mode: 'delta_only'
    }
  }
  epochs: {
    frequency: '1h' | '4h' | '8h' | '12h' | '24h'
    timezone: string
    behavior: {
      snapshot_failure: 'retry_original' | 'skip_epoch' | 'manual_override'
      zero_minted_points: 'skip_epoch' | 'create_empty'
      zero_new_funds: 'skip_epoch' | 'create_empty'
    }
  }
  claims: {
    claim_type: 'full_only' | 'partial_allowed'
    batch_enabled: boolean
    fees_paid_by: 'claimant' | 'pool'
    transfer_rule: 'snapshot_wallet' | 'current_wallet'
    unclaimed_rewards: 'stay_locked' | 'forfeit_to_pool'
    ui_display_mode: 'lifetime_plus_epochs' | 'epochs_only'
  }
}

export interface PointsMap {
  version: string
  collection_id: string
  total_supply: number
  point_distribution: {
    buckets: Record<string, {
      points: number
      count: number
    }>
    totals: {
      card_count: number
      weighted_points: number
    }
  }
  validation?: {
    card_count_matches_supply: boolean
    no_empty_buckets: boolean
    weighted_total_valid: boolean
  }
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  score: number
  errors: ValidationError[]
  warnings: ValidationError[]
  isValid?: boolean
  readiness?: 'strong' | 'usable' | 'needs_work'
}

export interface GeneratedOutputs {
  pseudocode: string
  chialisp: string
  reviewPacket: string
  configBundle: Record<string, any>
}