'use client'

import { useState } from 'react'
import { ProjectConfig, PointsMap, ValidationResult } from '@/types/config'

interface BuilderWizardProps {
  config: Partial<ProjectConfig>
  pointsMap: Partial<PointsMap>
  validation: ValidationResult
  currentScreen: number
  onConfigUpdate: (updates: Partial<ProjectConfig>) => void
  onPointsMapUpdate: (updates: Partial<PointsMap>) => void
  onScreenChange: (screen: number) => void
  onExport: (type: 'config' | 'points' | 'all' | 'pseudocode' | 'chialisp') => void
}

const SCREENS = [
  'Project Setup',
  'Wallets and Keys', 
  'Points and Supply',
  'Funding and Splits',
  'Epoch Rules',
  'Claim Rules',
  'Validation and Outputs',
  'Review Packet Preview'
]

export function BuilderWizard({
  config,
  pointsMap,
  validation,
  currentScreen,
  onConfigUpdate,
  onPointsMapUpdate,
  onScreenChange,
  onExport
}: BuilderWizardProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
      onScreenChange(currentScreen + 1)
    }
  }

  const handleBack = () => {
    if (currentScreen > 0) {
      onScreenChange(currentScreen - 1)
    }
  }

  const handleExport = async (type: Parameters<typeof onExport>[0]) => {
    setIsExporting(true)
    try {
      await onExport(type)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-backbone-500 to-backbone-600 px-6 py-4">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold">
            {SCREENS[currentScreen]}
          </h2>
          <div className="text-sm opacity-90">
            Step {currentScreen + 1} of {SCREENS.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-backbone-400/30 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentScreen + 1) / SCREENS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex overflow-x-auto">
          {SCREENS.map((screen, index) => (
            <button
              key={index}
              onClick={() => onScreenChange(index)}
              className={`
                py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${index === currentScreen 
                  ? 'border-backbone-500 text-backbone-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {index + 1}. {screen}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Content */}
      <div className="p-6 min-h-[500px]">
        {currentScreen === 0 && (
          <ProjectSetupScreen 
            config={config}
            onUpdate={onConfigUpdate}
          />
        )}
        
        {currentScreen === 1 && (
          <WalletsAndKeysScreen 
            config={config}
            onUpdate={onConfigUpdate}
          />
        )}
        
        {currentScreen === 2 && (
          <PointsAndSupplyScreen 
            config={config}
            pointsMap={pointsMap}
            onConfigUpdate={onConfigUpdate}
            onPointsMapUpdate={onPointsMapUpdate}
          />
        )}
        
        {currentScreen === 3 && (
          <FundingAndSplitsScreen 
            config={config}
            onUpdate={onConfigUpdate}
          />
        )}
        
        {currentScreen === 4 && (
          <EpochRulesScreen 
            config={config}
            onUpdate={onConfigUpdate}
          />
        )}
        
        {currentScreen === 5 && (
          <ClaimRulesScreen 
            config={config}
            onUpdate={onConfigUpdate}
          />
        )}
        
        {currentScreen === 6 && (
          <ValidationAndOutputsScreen 
            config={config}
            pointsMap={pointsMap}
            validation={validation}
            onExport={handleExport}
            isExporting={isExporting}
          />
        )}
        
        {currentScreen === 7 && (
          <ReviewPacketPreviewScreen 
            config={config}
            pointsMap={pointsMap}
            validation={validation}
            onExport={handleExport}
            isExporting={isExporting}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={currentScreen === 0}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${currentScreen === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus-outline'
            }
          `}
        >
          ← Back
        </button>

        <div className="flex items-center space-x-2">
          {validation.errors.length > 0 && (
            <span className="text-sm text-red-600 font-medium">
              {validation.errors.length} error(s) to fix
            </span>
          )}
          {validation.warnings.length > 0 && (
            <span className="text-sm text-yellow-600 font-medium">
              {validation.warnings.length} warning(s)
            </span>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentScreen === SCREENS.length - 1}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${currentScreen === SCREENS.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-backbone-500 text-white hover:bg-backbone-600 focus-outline'
            }
          `}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// Placeholder screen components - would be fully implemented
function ProjectSetupScreen({ config, onUpdate }: { 
  config: Partial<ProjectConfig>
  onUpdate: (updates: Partial<ProjectConfig>) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Project Setup
        </h3>
        <p className="text-gray-600 mb-6">
          Define the core identity and scope of your reward system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={config.project_name || ''}
            onChange={(e) => onUpdate({ project_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent"
            placeholder="Genesis Collection Rewards"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collection ID *
          </label>
          <input
            type="text"
            value={config.collection_id || ''}
            onChange={(e) => onUpdate({ collection_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent font-mono text-sm"
            placeholder="e.g. 4f4c447b-66c4-48de-bc27-4e6900176500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Asset *
          </label>
          <select
            value={config.reward_asset || 'XCH'}
            onChange={(e) => onUpdate({ reward_asset: e.target.value as 'XCH' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent"
          >
            <option value="XCH">XCH (Chia)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">V1 supports XCH only</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Supply *
          </label>
          <input
            type="number"
            value={config.total_supply || ''}
            onChange={(e) => onUpdate({ total_supply: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent"
            placeholder="100"
            min="1"
            max="1000000"
          />
        </div>
      </div>
    </div>
  )
}

// Additional screen components would be implemented similarly...
function WalletsAndKeysScreen({ config, onUpdate }: { config: Partial<ProjectConfig>, onUpdate: (updates: Partial<ProjectConfig>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Wallets and Authorization
        </h3>
        <p className="text-gray-600 mb-6">
          Configure wallet addresses and cryptographic keys for the reward system.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Pool Wallet Address *
          </label>
          <input
            type="text"
            value={config.wallets?.reward_pool || ''}
            onChange={(e) => onUpdate({ 
              wallets: { 
                reward_pool: e.target.value,
                admin_pubkey: config.wallets?.admin_pubkey || '',
                developer: config.wallets?.developer || ''
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent font-mono text-sm"
            placeholder="xch1abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr"
          />
          <p className="text-sm text-gray-500 mt-1">Main wallet that holds and distributes rewards</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Public Key *
          </label>
          <input
            type="text"
            value={config.wallets?.admin_pubkey || ''}
            onChange={(e) => onUpdate({ 
              wallets: { 
                reward_pool: config.wallets?.reward_pool || '',
                admin_pubkey: e.target.value,
                developer: config.wallets?.developer || ''
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent font-mono text-xs"
            placeholder="abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456"
          />
          <p className="text-sm text-gray-500 mt-1">BLS public key for signing epoch commits (96 hex characters)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Developer Wallet Address *
          </label>
          <input
            type="text"
            value={config.wallets?.developer || ''}
            onChange={(e) => onUpdate({ 
              wallets: { 
                reward_pool: config.wallets?.reward_pool || '',
                admin_pubkey: config.wallets?.admin_pubkey || '',
                developer: e.target.value
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent font-mono text-sm"
            placeholder="xch1developer1234567890abcdefghijklmnopqrstuvwxyz1234567"
          />
          <p className="text-sm text-gray-500 mt-1">Wallet that receives developer split from sales and royalties</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
              <p className="text-sm text-amber-700 mt-1">
                Keep your admin private key secure. It's required to sign epoch commits and authorize reward distributions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PointsAndSupplyScreen({ config, pointsMap, onConfigUpdate, onPointsMapUpdate }: any) {
  const buckets = pointsMap?.point_distribution?.buckets || {}
  
  const addBucket = () => {
    const newPoints = Object.keys(buckets).length + 1
    onPointsMapUpdate({
      point_distribution: {
        ...pointsMap?.point_distribution,
        buckets: {
          ...buckets,
          [newPoints]: { points: newPoints, count: 1 }
        }
      }
    })
  }

  const updateBucket = (points: string, field: 'points' | 'count', value: number) => {
    const updatedBuckets = { ...buckets }
    if (field === 'points' && points !== value.toString()) {
      // Changing points value - need to rename key
      delete updatedBuckets[points]
      updatedBuckets[value] = { ...buckets[points], points: value }
    } else {
      updatedBuckets[points] = { ...updatedBuckets[points], [field]: value }
    }
    
    onPointsMapUpdate({
      point_distribution: {
        ...pointsMap?.point_distribution,
        buckets: updatedBuckets
      }
    })
  }

  const removeBucket = (points: string) => {
    const updatedBuckets = { ...buckets }
    delete updatedBuckets[points]
    onPointsMapUpdate({
      point_distribution: {
        ...pointsMap?.point_distribution,
        buckets: updatedBuckets
      }
    })
  }

  const totalCards = Object.values(buckets).reduce((sum: number, bucket: any) => sum + (bucket.count || 0), 0)
  const totalWeightedPoints = Object.values(buckets).reduce((sum: number, bucket: any) => sum + (bucket.points || 0) * (bucket.count || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Points and Supply Distribution
        </h3>
        <p className="text-gray-600 mb-6">
          Define how many NFTs have each point value. Higher points = larger reward share.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Total Supply:</span>
            <span className="ml-2 text-blue-600">{config.total_supply || 0}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Cards Allocated:</span>
            <span className="ml-2 text-blue-600">{totalCards}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Weighted Points:</span>
            <span className="ml-2 text-blue-600">{totalWeightedPoints}</span>
          </div>
        </div>
        {totalCards !== config.total_supply && (
          <p className="text-amber-600 text-sm mt-2">
            ⚠️ Cards allocated ({totalCards}) doesn't match total supply ({config.total_supply || 0})
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Point Distribution Buckets</h4>
          <button
            onClick={addBucket}
            className="px-3 py-1 text-sm bg-backbone-500 text-white rounded hover:bg-backbone-600"
          >
            Add Bucket
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(buckets).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([points, bucket]: [string, any]) => (
            <div key={points} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Points per NFT</label>
                <input
                  type="number"
                  value={bucket.points || 0}
                  onChange={(e) => updateBucket(points, 'points', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-backbone-500"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Count of NFTs</label>
                <input
                  type="number"
                  value={bucket.count || 0}
                  onChange={(e) => updateBucket(points, 'count', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-backbone-500"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Total Points</label>
                <div className="px-2 py-1 text-sm bg-gray-100 rounded text-gray-700">
                  {(bucket.points || 0) * (bucket.count || 0)}
                </div>
              </div>
              <button
                onClick={() => removeBucket(points)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {Object.keys(buckets).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No point buckets configured yet.</p>
            <p className="text-sm">Click "Add Bucket" to start defining your point distribution.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FundingAndSplitsScreen({ config, onUpdate }: any) {
  const funding = config.funding || {}
  const primarySplit = funding.primary_split || {}
  const royaltySplit = funding.royalty_split || {}
  const behavior = funding.behavior || {}

  const updatePrimarySplit = (field: string, value: number) => {
    const newPrimary = { ...primarySplit, [field]: value }
    const otherField = field === 'developer_pct' ? 'reward_pool_pct' : 'developer_pct'
    newPrimary[otherField] = 100 - value
    
    onUpdate({
      funding: {
        ...funding,
        primary_split: newPrimary
      }
    })
  }

  const updateRoyaltySplit = (field: string, value: number) => {
    const newRoyalty = { ...royaltySplit, [field]: value }
    const otherField = field === 'developer_pct' ? 'reward_pool_pct' : 'developer_pct'
    newRoyalty[otherField] = 100 - value
    
    onUpdate({
      funding: {
        ...funding,
        royalty_split: newRoyalty
      }
    })
  }

  const updateBehavior = (field: string, value: any) => {
    onUpdate({
      funding: {
        ...funding,
        behavior: {
          ...behavior,
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Funding and Revenue Splits
        </h3>
        <p className="text-gray-600 mb-6">
          Configure how sales proceeds are split between developer and reward pool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Primary Sale Split</h4>
          <p className="text-sm text-gray-600">Initial NFT sales from collection launch</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={primarySplit.developer_pct || 10}
                onChange={(e) => updatePrimarySplit('developer_pct', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="w-12 text-right font-medium">
                {primarySplit.developer_pct || 10}%
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward Pool Percentage
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded text-gray-700 font-medium">
              {primarySplit.reward_pool_pct || 90}%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Royalty Split</h4>
          <p className="text-sm text-gray-600">Secondary market sales royalties</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={royaltySplit.developer_pct || 5}
                onChange={(e) => updateRoyaltySplit('developer_pct', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="w-12 text-right font-medium">
                {royaltySplit.developer_pct || 5}%
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward Pool Percentage
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded text-gray-700 font-medium">
              {royaltySplit.reward_pool_pct || 95}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Funding Behavior</h4>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={behavior.future_collections_fund_pool || false}
              onChange={(e) => updateBehavior('future_collections_fund_pool', e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <label className="font-medium text-gray-700">
                Future Collections Fund Pool
              </label>
              <p className="text-sm text-gray-600">
                Sales from future collections also contribute to this reward pool
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              checked={behavior.random_xch_counts_as_funding || false}
              onChange={(e) => updateBehavior('random_xch_counts_as_funding', e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <label className="font-medium text-gray-700">
                Random XCH Counts as Funding
              </label>
              <p className="text-sm text-gray-600">
                Direct XCH deposits to pool wallet count as funding for rewards
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funding Mode
          </label>
          <select
            value={behavior.funding_mode || 'delta_only'}
            onChange={(e) => updateBehavior('funding_mode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-backbone-500 focus:border-transparent"
          >
            <option value="delta_only">Delta Only (Recommended)</option>
            <option value="total_balance">Total Balance</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Delta only distributes new funding since last epoch. Total balance distributes entire wallet balance.
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="font-medium text-green-800 mb-2">Funding Summary</h5>
        <div className="text-sm text-green-700 space-y-1">
          <p>Primary sales: Developer gets {primarySplit.developer_pct || 10}%, Pool gets {primarySplit.reward_pool_pct || 90}%</p>
          <p>Royalties: Developer gets {royaltySplit.developer_pct || 5}%, Pool gets {royaltySplit.reward_pool_pct || 95}%</p>
          <p>Mode: {behavior.funding_mode === 'delta_only' ? 'Only new funding distributed each epoch' : 'Entire pool balance distributed each epoch'}</p>
        </div>
      </div>
    </div>
  )
}

function EpochRulesScreen({ config, onUpdate }: any) {
  return <div>Epoch Rules screen - implement epoch frequency and behavior settings</div>
}

function ClaimRulesScreen({ config, onUpdate }: any) {
  return <div>Claim Rules screen - implement claim type and transfer rules</div>
}

function ValidationAndOutputsScreen({ config, pointsMap, validation, onExport, isExporting }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Validation and Outputs</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onExport('config')}
          disabled={isExporting}
          className="px-4 py-2 bg-backbone-500 text-white rounded hover:bg-backbone-600 disabled:opacity-50"
        >
          Export Config
        </button>
        <button
          onClick={() => onExport('all')}
          disabled={isExporting}
          className="px-4 py-2 bg-backbone-500 text-white rounded hover:bg-backbone-600 disabled:opacity-50"
        >
          Export All
        </button>
      </div>
    </div>
  )
}

function ReviewPacketPreviewScreen({ config, pointsMap, validation, onExport, isExporting }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Packet Preview</h3>
      <p>Final review of all configurations before export.</p>
    </div>
  )
}