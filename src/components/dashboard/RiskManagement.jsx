
import React, { useState, useEffect } from 'react'

const RiskManagement = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 10000,
    dailyPnL: 0,
    weeklyPnL: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    volatility: 0
  })

  const [riskSettings, setRiskSettings] = useState({
    maxRiskPerTrade: 2,
    maxPortfolioRisk: 10,
    stopLossPercentage: 5,
    takeProfitRatio: 2,
    maxPositions: 10,
    marginUtilization: 50
  })

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Portfolio risk approaching 8% threshold',
      timestamp: new Date(),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'Recommended rebalancing for BTC position',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'low'
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')

  // Risk calculation functions
  const calculatePositionSize = (accountBalance, riskPercentage, entryPrice, stopLoss) => {
    const riskAmount = (accountBalance * riskPercentage) / 100
    const riskPerShare = Math.abs(entryPrice - stopLoss)
    return riskAmount / riskPerShare
  }

  const calculatePortfolioHeatmap = () => {
    return [
      { asset: 'BTC', exposure: 35, risk: 'medium', correlation: 0.8 },
      { asset: 'ETH', exposure: 25, risk: 'low', correlation: 0.75 },
      { asset: 'SOL', exposure: 15, risk: 'high', correlation: 0.6 },
      { asset: 'ADA', exposure: 10, risk: 'medium', correlation: 0.5 },
      { asset: 'DOT', exposure: 15, risk: 'high', correlation: 0.7 }
    ]
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Risk Management</h2>
            <p className="text-gray-600 dark:text-gray-300">Monitor and control portfolio risk exposure</p>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Portfolio Risk</p>
              <p className="text-2xl font-bold">7.2%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              ⚠️
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Max Drawdown</p>
              <p className="text-2xl font-bold">-12.5%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              📉
            </div>
          </div>
          <div className="mt-2 text-sm text-red-500">Last 30 days</div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sharpe Ratio</p>
              <p className="text-2xl font-bold">1.84</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              📊
            </div>
          </div>
          <div className="mt-2 text-sm text-green-500">Good risk-adjusted return</div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">VaR (95%)</p>
              <p className="text-2xl font-bold">$850</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              🛡️
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">Daily Value at Risk</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-2xl p-4">
        <div className="flex gap-4">
          {[
            { id: 'overview', name: 'Risk Overview' },
            { id: 'positions', name: 'Position Analysis' },
            { id: 'settings', name: 'Risk Settings' },
            { id: 'alerts', name: 'Risk Alerts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Portfolio Heatmap</h3>
            <div className="space-y-3">
              {calculatePortfolioHeatmap().map((asset) => (
                <div key={asset.asset} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {asset.asset[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{asset.asset}</div>
                      <div className="text-sm text-gray-500">{asset.exposure}% allocation</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(asset.risk)}`}>
                      {asset.risk} risk
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Corr: {asset.correlation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Risk Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Beta (vs BTC)</span>
                <span className="font-semibold">1.23</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Volatility (30d)</span>
                <span className="font-semibold">18.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Correlation to Market</span>
                <span className="font-semibold">0.87</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Maximum Position Size</span>
                <span className="font-semibold">$2,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Risk-Free Rate</span>
                <span className="font-semibold">2.5%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'positions' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Position Size Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Balance ($)</label>
                <input
                  type="number"
                  defaultValue="10000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Risk Per Trade (%)</label>
                <input
                  type="number"
                  defaultValue="2"
                  max="10"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Entry Price ($)</label>
                <input
                  type="number"
                  defaultValue="45000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stop Loss ($)</label>
                <input
                  type="number"
                  defaultValue="42000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                <h4 className="font-semibold mb-2">Recommended Position Size</h4>
                <p className="text-2xl font-bold text-brand-500">0.067 BTC</p>
                <p className="text-sm text-gray-500">≈ $3,000 USD</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <h4 className="font-semibold mb-2">Maximum Loss</h4>
                <p className="text-2xl font-bold text-red-500">$200</p>
                <p className="text-sm text-gray-500">2% of account</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h4 className="font-semibold mb-2">Risk/Reward Ratio</h4>
                <p className="text-2xl font-bold text-green-500">1:2.5</p>
                <p className="text-sm text-gray-500">Good ratio</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Risk Management Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Max Risk Per Trade (%)</label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={riskSettings.maxRiskPerTrade}
                  onChange={(e) => setRiskSettings({...riskSettings, maxRiskPerTrade: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0.5%</span>
                  <span className="font-semibold">{riskSettings.maxRiskPerTrade}%</span>
                  <span>10%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Portfolio Risk (%)</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={riskSettings.maxPortfolioRisk}
                  onChange={(e) => setRiskSettings({...riskSettings, maxPortfolioRisk: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5%</span>
                  <span className="font-semibold">{riskSettings.maxPortfolioRisk}%</span>
                  <span>50%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Stop Loss (%)</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={riskSettings.stopLossPercentage}
                  onChange={(e) => setRiskSettings({...riskSettings, stopLossPercentage: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1%</span>
                  <span className="font-semibold">{riskSettings.stopLossPercentage}%</span>
                  <span>20%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Take Profit Ratio</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={riskSettings.takeProfitRatio}
                  onChange={(e) => setRiskSettings({...riskSettings, takeProfitRatio: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1:1</span>
                  <span className="font-semibold">1:{riskSettings.takeProfitRatio}</span>
                  <span>1:5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Open Positions</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={riskSettings.maxPositions}
                  onChange={(e) => setRiskSettings({...riskSettings, maxPositions: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1</span>
                  <span className="font-semibold">{riskSettings.maxPositions}</span>
                  <span>20</span>
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition">
                  Save Risk Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Risk Alerts</h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{alert.message}</p>
                    <p className="text-sm text-gray-500">{alert.timestamp.toLocaleString()}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            <div className="mt-6 text-center">
              <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                View All Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskManagement
