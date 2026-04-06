'use client'

import { useState, useEffect } from 'react'
import { BuilderWizard } from '@/components/BuilderWizard'
import { ProjectConfig, PointsMap, ValidationResult } from '@/types/config'
import { validateConfiguration } from '@/utils/validation'
import { generateOutputs } from '@/utils/generators'

export default function Home() {
  const [config, setConfig] = useState<Partial<ProjectConfig>>({})
  const [pointsMap, setPointsMap] = useState<Partial<PointsMap>>({})
  const [validation, setValidation] = useState<ValidationResult>({ score: 0, errors: [], warnings: [] })
  const [currentScreen, setCurrentScreen] = useState(0)

  // Auto-save to localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('backbone-config')
    const savedPointsMap = localStorage.getItem('backbone-points-map')
    
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (e) {
        console.warn('Failed to load saved config')
      }
    }
    
    if (savedPointsMap) {
      try {
        setPointsMap(JSON.parse(savedPointsMap))
      } catch (e) {
        console.warn('Failed to load saved points map')
      }
    }
  }, [])

  // Auto-validate on config changes
  useEffect(() => {
    const result = validateConfiguration(config, pointsMap)
    setValidation(result)
    
    // Auto-save
    localStorage.setItem('backbone-config', JSON.stringify(config))
    localStorage.setItem('backbone-points-map', JSON.stringify(pointsMap))
  }, [config, pointsMap])

  const handleConfigUpdate = (updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const handlePointsMapUpdate = (updates: Partial<PointsMap>) => {
    setPointsMap(prev => ({ ...prev, ...updates }))
  }

  const handleExport = async (type: 'config' | 'points' | 'all' | 'pseudocode' | 'chialisp') => {
    try {
      const outputs = await generateOutputs(config as ProjectConfig, pointsMap as PointsMap)
      
      switch (type) {
        case 'config':
          downloadFile(JSON.stringify(config, null, 2), 'project_config.json')
          break
        case 'points':
          downloadFile(JSON.stringify(pointsMap, null, 2), 'points_map.json')
          break
        case 'pseudocode':
          downloadFile(outputs.pseudocode, 'pseudocode.txt')
          break
        case 'chialisp':
          downloadFile(outputs.chialisp, 'reward_pool_singleton.clsp')
          break
        case 'all':
          // Create zip bundle
          const bundle = {
            'project_config.json': JSON.stringify(config, null, 2),
            'points_map.json': JSON.stringify(pointsMap, null, 2),
            'pseudocode.txt': outputs.pseudocode,
            'reward_pool_singleton.clsp': outputs.chialisp,
            'review_packet.md': outputs.reviewPacket
          }
          downloadFile(JSON.stringify(bundle, null, 2), 'backbone_bundle.json')
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please check your configuration.')
    }
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSampleData = () => {
    const sampleConfig: Partial<ProjectConfig> = {
      version: "PROJECT_CONFIG_V1",
      project_name: "Genesis Collection Rewards",
      collection_id: "a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890",
      reward_asset: "XCH",
      total_supply: 100,
      wallets: {
        reward_pool: "xch1abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr",
        admin_pubkey: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
        developer: "xch1developer1234567890abcdefghijklmnopqrstuvwxyz1234567"
      },
      funding: {
        primary_split: { developer_pct: 10, reward_pool_pct: 90 },
        royalty_split: { developer_pct: 5, reward_pool_pct: 95 },
        behavior: {
          future_collections_fund_pool: false,
          random_xch_counts_as_funding: false,
          funding_mode: "delta_only"
        }
      },
      epochs: {
        frequency: "4h",
        timezone: "UTC",
        behavior: {
          snapshot_failure: "retry_original",
          zero_minted_points: "skip_epoch",
          zero_new_funds: "skip_epoch"
        }
      },
      claims: {
        claim_type: "full_only",
        batch_enabled: true,
        fees_paid_by: "claimant",
        transfer_rule: "snapshot_wallet",
        unclaimed_rewards: "stay_locked",
        ui_display_mode: "lifetime_plus_epochs"
      }
    }

    const samplePointsMap: Partial<PointsMap> = {
      version: "POINTS_MAP_V1",
      collection_id: "a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890",
      total_supply: 100,
      point_distribution: {
        buckets: {
          "10": { points: 10, count: 10 },
          "9": { points: 9, count: 10 },
          "8": { points: 8, count: 10 },
          "7": { points: 7, count: 10 },
          "6": { points: 6, count: 10 },
          "5": { points: 5, count: 10 },
          "4": { points: 4, count: 10 },
          "3": { points: 3, count: 10 },
          "2": { points: 2, count: 10 },
          "1": { points: 1, count: 10 }
        },
        totals: {
          card_count: 100,
          weighted_points: 550
        }
      }
    }

    setConfig(sampleConfig)
    setPointsMap(samplePointsMap)
  }

  const resetForm = () => {
    setConfig({})
    setPointsMap({})
    localStorage.removeItem('backbone-config')
    localStorage.removeItem('backbone-points-map')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-backbone-900 mb-4">
          NFT Reward System Builder
        </h1>
        <p className="text-lg text-backbone-700 mb-6 max-w-3xl mx-auto">
          Configure a production-ready, trustless NFT reward distribution system for Chia blockchain. 
          Define your rules, validate your setup, and generate all the files needed to deploy.
        </p>
        
        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={loadSampleData}
            className="px-4 py-2 bg-backbone-100 text-backbone-700 rounded-lg hover:bg-backbone-200 transition-colors focus-outline"
          >
            Load Sample
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-outline"
          >
            Reset Form
          </button>
        </div>

        {/* Readiness Score */}
        <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-white shadow-md">
          <span className="text-sm font-medium text-gray-600">Readiness Score:</span>
          <div className={`flex items-center space-x-2 ${
            validation.score >= 90 ? 'text-green-600' :
            validation.score >= 75 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  validation.score >= 90 ? 'bg-green-500' :
                  validation.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(validation.score, 0)}%` }}
              />
            </div>
            <span className="font-bold">{validation.score}/100</span>
          </div>
        </div>
      </div>

      <BuilderWizard
        config={config}
        pointsMap={pointsMap}
        validation={validation}
        currentScreen={currentScreen}
        onConfigUpdate={handleConfigUpdate}
        onPointsMapUpdate={handlePointsMapUpdate}
        onScreenChange={setCurrentScreen}
        onExport={handleExport}
      />
    </div>
  )
}