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
            placeholder="64-character hex collection ID"
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
  return <div>Wallets and Keys screen - implement form fields for wallet addresses and admin public key</div>
}

function PointsAndSupplyScreen({ config, pointsMap, onConfigUpdate, onPointsMapUpdate }: any) {
  return <div>Points and Supply screen - implement point distribution buckets</div>
}

function FundingAndSplitsScreen({ config, onUpdate }: any) {
  return <div>Funding and Splits screen - implement percentage splits</div>
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