
import React, { useState, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'

const PerformanceAnalytics = () => {
  const [activeTab, setActiveTab] = useState('performance')
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  const [performanceData, setPerformanceData] = useState({
    totalReturn: 15.8,
    annualizedReturn: 23.4,
    volatility: 18.2,
    sharpeRatio: 1.28,
    maxDrawdown: -12.5,
    winRate: 68.5,
    avgWin: 4.2,
    avgLoss: -2.8,
    profitFactor: 2.1
  })

  const generatePerformanceChart = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return date.toLocaleDateString()
    })

    let portfolioValue = 10000
    const data = labels.map(() => {
      const change = (Math.random() - 0.48) * 200 // Slight upward bias
      portfolioValue += change
      return portfolioValue
    })

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'S&P 500 Benchmark',
          data: labels.map(() => 10000 + (Math.random() - 0.5) * 100),
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderDash: [5, 5]
        }
      ]
    }
  }

  const generateReturnsDistribution = () => {
    const returns = Array.from({ length: 50 }, () => (Math.random() - 0.5) * 10)
    const bins = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
    const histogram = bins.map(bin => {
      return returns.filter(r => r >= bin && r < bin + 1).length
    })

    return {
      labels: bins.map(b => `${b}%`),
      datasets: [{
        label: 'Frequency',
        data: histogram,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1
      }]
    }
  }

  const calculateTradeMetrics = () => {
    return [
      { metric: 'Total Trades', value: 156, change: '+12' },
      { metric: 'Winning Trades', value: 107, change: '+8' },
      { metric: 'Losing Trades', value: 49, change: '+4' },
      { metric: 'Average Hold Time', value: '2.3 days', change: '-0.2' },
      { metric: 'Best Trade', value: '+$850', change: null },
      { metric: 'Worst Trade', value: '-$320', change: null }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300">Deep dive into your trading performance</p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total Return</p>
            <p className="text-2xl font-bold text-green-500">+{performanceData.totalReturn}%</p>
            <p className="text-xs text-gray-400">{timeRange}</p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Sharpe Ratio</p>
            <p className="text-2xl font-bold">{performanceData.sharpeRatio}</p>
            <p className="text-xs text-green-400">Excellent</p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Max Drawdown</p>
            <p className="text-2xl font-bold text-red-500">{performanceData.maxDrawdown}%</p>
            <p className="text-xs text-gray-400">Peak to trough</p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Win Rate</p>
            <p className="text-2xl font-bold">{performanceData.winRate}%</p>
            <p className="text-xs text-green-400">Above average</p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Profit Factor</p>
            <p className="text-2xl font-bold">{performanceData.profitFactor}</p>
            <p className="text-xs text-green-400">Very good</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-2xl p-4">
        <div className="flex gap-4">
          {[
            { id: 'performance', name: 'Performance Chart' },
            { id: 'returns', name: 'Returns Analysis' },
            { id: 'trades', name: 'Trade Metrics' },
            { id: 'benchmark', name: 'Benchmark Comparison' }
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
      {activeTab === 'performance' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Portfolio Performance vs Benchmark</h3>
          <div className="h-96">
            <Line data={generatePerformanceChart()} options={chartOptions} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Portfolio Performance</h4>
              <p className="text-2xl font-bold text-green-600">+15.8%</p>
              <p className="text-sm text-gray-500">Outperforming market</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">Market Benchmark</h4>
              <p className="text-2xl font-bold text-blue-600">+8.2%</p>
              <p className="text-sm text-gray-500">S&P 500 equivalent</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Alpha Generated</h4>
              <p className="text-2xl font-bold text-yellow-600">+7.6%</p>
              <p className="text-sm text-gray-500">Excess return</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Returns Distribution</h3>
            <div className="h-64">
              <Bar data={generateReturnsDistribution()} options={chartOptions} />
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Risk-Adjusted Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <span>Annualized Return</span>
                <span className="font-semibold text-green-500">+23.4%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <span>Annualized Volatility</span>
                <span className="font-semibold">18.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <span>Sortino Ratio</span>
                <span className="font-semibold">1.67</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <span>Calmar Ratio</span>
                <span className="font-semibold">1.87</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <span>Information Ratio</span>
                <span className="font-semibold">0.92</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Trading Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {calculateTradeMetrics().map((metric, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                <p className="text-sm text-gray-500 mb-1">{metric.metric}</p>
                <p className="text-lg font-bold">{metric.value}</p>
                {metric.change && (
                  <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change} this period
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Best Performing Assets</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>SOL/USDT</span>
                  <span className="font-semibold">+24.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>ETH/USDT</span>
                  <span className="font-semibold">+18.3%</span>
                </div>
                <div className="flex justify-between">
                  <span>BTC/USDT</span>
                  <span className="font-semibold">+12.1%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Most Active Trading Hours</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>9:00 - 11:00 AM</span>
                  <span className="font-semibold">32% of trades</span>
                </div>
                <div className="flex justify-between">
                  <span>2:00 - 4:00 PM</span>
                  <span className="font-semibold">28% of trades</span>
                </div>
                <div className="flex justify-between">
                  <span>7:00 - 9:00 PM</span>
                  <span className="font-semibold">22% of trades</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'benchmark' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Benchmark Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Performance Comparison</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div>
                    <div className="font-semibold">Your Portfolio</div>
                    <div className="text-sm text-gray-500">Last 30 days</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">+15.8%</div>
                    <div className="text-sm text-gray-500">$11,580</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div>
                    <div className="font-semibold">Bitcoin</div>
                    <div className="text-sm text-gray-500">Same period</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">+12.3%</div>
                    <div className="text-sm text-gray-500">Outperformed</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div>
                    <div className="font-semibold">S&P 500</div>
                    <div className="text-sm text-gray-500">Traditional market</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">+8.2%</div>
                    <div className="text-sm text-gray-500">Outperformed</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Risk-Adjusted Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Beta (vs Bitcoin)</span>
                  <span className="font-semibold">0.87</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Correlation to Market</span>
                  <span className="font-semibold">0.72</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tracking Error</span>
                  <span className="font-semibold">8.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Up Capture Ratio</span>
                  <span className="font-semibold text-green-500">112%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Down Capture Ratio</span>
                  <span className="font-semibold text-green-500">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceAnalytics
