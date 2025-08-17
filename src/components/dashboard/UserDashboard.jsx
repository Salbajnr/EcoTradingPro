
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import axios from 'axios'

function UserDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState(null)
  const [marketData, setMarketData] = useState({})
  const [news, setNews] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchMarketData()
    fetchNews()
    fetchAnnouncements()

    // Set up real-time market updates
    const interval = setInterval(fetchMarketData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile')
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchMarketData = async () => {
    try {
      const response = await axios.get('/api/market/prices')
      setMarketData(response.data)
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
  }

  const fetchNews = async () => {
    try {
      const response = await axios.get('/api/news')
      setNews(response.data)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements')
      setAnnouncements(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1A]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#0A84FF" opacity=".14"/>
                <path d="M16 34c8-6 14-14 16-24 2 10 8 18 16 24-8 6-14 14-16 24-2-10-8-18-16-24z" fill="#10B981"/>
              </svg>
              <span className="text-xl font-extrabold">
                <span className="text-brand-500">CRYPTO</span> TRADE <span className="text-emerald-500">PRO</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {profile?.name || user?.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-2">Account Balance</h2>
          <p className="text-3xl font-bold text-emerald-500">
            ${profile?.balance?.toLocaleString() || '10,000'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Available for trading</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Data */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(marketData).map(([pair, data]) => (
                  <div key={pair} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{pair}</span>
                      <span className={`text-sm ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xl font-bold mt-1">
                      ${data.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Announcements</h2>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement._id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium text-sm">{announcement.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {announcement.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Crypto News</h2>
              <div className="space-y-3">
                {news.slice(0, 5).map((article) => (
                  <div key={article._id} className="border-b dark:border-gray-700 pb-3 last:border-b-0">
                    <h3 className="font-medium text-sm">{article.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
