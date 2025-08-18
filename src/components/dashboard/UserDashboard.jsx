
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import Chart from 'chart.js/auto'

function UserDashboard() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  const [activeTab, setActiveTab] = useState('buy')
  const [activeTimeFilter, setActiveTimeFilter] = useState('1W')
  const [marketData, setMarketData] = useState({
    'BTC/USDT': { price: 68355, change: 1.2 },
    'ETH/USDT': { price: 3210, change: -0.4 },
    'SOL/USDT': { price: 182.4, change: 2.1 },
    'XRP/USDT': { price: 0.62, change: 0.7 },
    'BNB/USDT': { price: 598.3, change: 0.9 },
    'ADA/USDT': { price: 0.52, change: -0.3 }
  })

  // Fetch market data
  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market/prices')
      const data = await response.json()
      setMarketData(data)
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
  }

  const [portfolioData, setPortfolioData] = useState({
    totalValue: 42689.24,
    dailyChange: 1280.50,
    dailyChangePercent: 3.1,
    activeOrders: 12
  })

  const [tradeForm, setTradeForm] = useState({
    asset: 'BTC',
    amount: 500.00,
    orderType: 'market'
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Fetch initial market data
    fetchMarketData()
    
    // Set up periodic updates every 30 seconds
    const marketInterval = setInterval(fetchMarketData, 30000)
    
    // Initialize chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d')
      
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'BTC/USD',
            data: [39500, 40200, 39800, 41000, 40800, 41500, 41230],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              grid: {
                color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#94a3b8',
                callback: function(value) {
                  return '$' + value.toLocaleString()
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#94a3b8'
              }
            }
          }
        }
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
      clearInterval(marketInterval)
    }
  }, [isDark])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleTradeFormChange = (field, value) => {
    setTradeForm(prev => ({ ...prev, [field]: value }))
  }

  const generateRandomChartData = () => {
    const data = []
    let current = 40000
    for (let i = 0; i < 7; i++) {
      const change = (Math.random() - 0.5) * 2000
      current += change
      data.push(Math.round(current))
    }
    return data
  }

  const handleTimeFilterChange = (filter) => {
    setActiveTimeFilter(filter)
    if (chartInstance.current) {
      chartInstance.current.data.datasets[0].data = generateRandomChartData()
      chartInstance.current.update()
    }
  }

  const cryptoIcons = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'SOL': '◎',
    'XRP': 'X',
    'BNB': 'B',
    'ADA': '₳'
  }

  return (
    <div className="bg-white text-gray-900 dark:bg-[#0A0F1A] dark:text-gray-100 min-h-screen">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white/90 dark:bg-[#0F172A]/85 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 transition-all duration-300 fixed h-full z-50`}>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                {sidebarCollapsed ? 'C' : '📊'}
              </div>
              {!sidebarCollapsed && (
                <div className="text-xl font-extrabold">
                  <span className="text-brand-500">CRYPTO</span> TRADE <span className="text-emerald-500">PRO</span>
                </div>
              )}
            </div>
          </div>

          <nav className="px-4">
            <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border-l-4 border-brand-500 mb-2">
              <i className="fas fa-home text-lg"></i>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
            <Link to="/markets" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 mb-2">
              <i className="fas fa-chart-bar text-lg"></i>
              {!sidebarCollapsed && <span>Markets</span>}
            </Link>
            <Link to="/portfolio" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 mb-2">
              <i className="fas fa-wallet text-lg"></i>
              {!sidebarCollapsed && <span>Portfolio</span>}
            </Link>
            <Link to="/trade" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 mb-2">
              <i className="fas fa-exchange-alt text-lg"></i>
              {!sidebarCollapsed && <span>Trade</span>}
            </Link>
            <Link to="/transactions" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 mb-2">
              <i className="fas fa-history text-lg"></i>
              {!sidebarCollapsed && <span>Transactions</span>}
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
          {/* Top Bar */}
          <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <i className="fas fa-bars"></i>
                </button>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cryptocurrencies..."
                    className="w-80 px-4 py-2 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 relative">
                  <i className="fas fa-bell"></i>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-gray-500">Pro Trader</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-red-500"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass rounded-2xl p-6 hover:shadow-glow transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wide">Portfolio Value</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <i className="fas fa-wallet text-brand-500"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">${portfolioData.totalValue.toLocaleString()}</div>
                <div className="text-emerald-500 text-sm font-medium">
                  <i className="fas fa-arrow-up mr-1"></i>
                  +{portfolioData.dailyChangePercent}% (${portfolioData.dailyChange.toLocaleString()})
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-glow transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wide">Available Balance</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-emerald-500"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">${user?.balance?.toLocaleString() || '0.00'}</div>
                <div className="text-gray-500 text-sm">Simulation Balance</div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-glow transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wide">24h Profit/Loss</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <i className="fas fa-chart-line text-brand-500"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-emerald-500">+$1,280.50</div>
                <div className="text-emerald-500 text-sm font-medium">
                  <i className="fas fa-arrow-up mr-1"></i>
                  +3.1% Today
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-glow transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wide">Active Orders</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <i className="fas fa-exchange-alt text-brand-500"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">{portfolioData.activeOrders}</div>
                <div className="text-gray-500 text-sm">5 Open | 7 Completed</div>
              </div>
            </div>

            {/* Trading Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Chart */}
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">BTC/USD Chart</h3>
                  <div className="flex gap-2">
                    {['1H', '1D', '1W', '1M', '1Y'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => handleTimeFilterChange(filter)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          activeTimeFilter === filter
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>

              {/* Trade Panel */}
              <div className="glass rounded-2xl p-6">
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                  {['buy', 'sell', 'convert'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-1 font-medium text-sm transition ${
                        activeTab === tab
                          ? 'border-b-2 border-brand-500 text-brand-500'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Asset</label>
                    <select 
                      value={tradeForm.asset}
                      onChange={(e) => handleTradeFormChange('asset', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="ADA">Cardano (ADA)</option>
                      <option value="XRP">Ripple (XRP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                    <input
                      type="number"
                      value={tradeForm.amount}
                      onChange={(e) => handleTradeFormChange('amount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (USD)</label>
                      <input
                        type="text"
                        value="41,230.50"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity</label>
                      <input
                        type="text"
                        value="0.0121"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Order Type</label>
                    <select 
                      value={tradeForm.orderType}
                      onChange={(e) => handleTradeFormChange('orderType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="market">Market Order</option>
                      <option value="limit">Limit Order</option>
                      <option value="stop">Stop Order</option>
                    </select>
                  </div>

                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                      activeTab === 'buy'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <i className={`fas ${activeTab === 'buy' ? 'fa-arrow-up' : 'fa-arrow-down'} mr-2`}></i>
                    {activeTab === 'buy' ? 'Buy' : 'Sell'} {tradeForm.asset}
                  </button>
                </div>
              </div>
            </div>

            {/* Market Overview & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Movers */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Top Movers</h3>
                <div className="space-y-4">
                  {Object.entries(marketData).map(([pair, data]) => {
                    const [base] = pair.split('/')
                    return (
                      <div key={pair} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {cryptoIcons[base] || base[0]}
                          </div>
                          <div>
                            <div className="font-semibold">{base}</div>
                            <div className="text-sm text-gray-500">{pair}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${data.price.toLocaleString()}</div>
                          <div className={`text-sm ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data.change >= 0 ? '+' : ''}{data.change}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="glass rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Recent Transactions</h3>
                  <Link to="/transactions" className="text-brand-500 hover:text-brand-600 text-sm font-medium">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    { type: 'buy', asset: 'Bitcoin', amount: '+0.25 BTC', date: 'Today, 09:42 AM', positive: true },
                    { type: 'sell', asset: 'Ethereum', amount: '-2.5 ETH', date: 'Yesterday, 03:15 PM', positive: false },
                    { type: 'buy', asset: 'Solana', amount: '+15.2 SOL', date: 'Dec 12, 2023', positive: true },
                    { type: 'buy', asset: 'Cardano', amount: '+320 ADA', date: 'Dec 10, 2023', positive: true }
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.positive 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        <i className={`fas ${transaction.positive ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{transaction.type === 'buy' ? 'Buy' : 'Sell'} {transaction.asset}</div>
                        <div className="text-sm text-gray-500">{transaction.date}</div>
                      </div>
                      <div className={`font-semibold ${transaction.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
