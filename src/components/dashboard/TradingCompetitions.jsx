
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function TradingCompetitions() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('active')
  const [competitions, setCompetitions] = useState([])
  const [myCompetitions, setMyCompetitions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCompetitions()
    fetchMyCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/competitions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCompetitions(response.data)
    } catch (error) {
      // Mock data for demo
      setCompetitions([
        {
          id: '1',
          title: 'Weekly Crypto Challenge',
          description: 'Trade cryptocurrencies for the highest return in 7 days',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-08'),
          participants: 245,
          maxParticipants: 500,
          entryFee: 0,
          prizePool: 5000,
          startingBalance: 10000,
          status: 'active',
          category: 'general',
          rules: [
            'Starting balance: $10,000 virtual money',
            'All major cryptocurrencies allowed',
            'No leverage trading',
            'Competition ends at midnight UTC'
          ],
          prizes: {
            1: 2000,
            2: 1500,
            3: 1000,
            '4-10': 500
          }
        },
        {
          id: '2',
          title: 'Bitcoin Only Challenge',
          description: 'Trade only Bitcoin for maximum profits',
          startDate: new Date('2024-02-05'),
          endDate: new Date('2024-02-12'),
          participants: 89,
          maxParticipants: 200,
          entryFee: 10,
          prizePool: 2000,
          startingBalance: 5000,
          status: 'upcoming',
          category: 'btc-only',
          rules: [
            'Bitcoin trading only',
            'Leverage up to 3x allowed',
            'Starting balance: $5,000',
            'Entry fee: $10'
          ],
          prizes: {
            1: 800,
            2: 600,
            3: 400,
            '4-5': 200
          }
        }
      ])
    }
  }

  const fetchMyCompetitions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/my-competitions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyCompetitions(response.data)
    } catch (error) {
      // Mock data for demo
      setMyCompetitions([
        {
          id: '1',
          title: 'Weekly Crypto Challenge',
          currentBalance: 12450.67,
          startingBalance: 10000,
          currentRank: 12,
          totalParticipants: 245,
          profitLoss: 2450.67,
          profitLossPercentage: 24.5,
          trades: 15,
          status: 'active'
        }
      ])
    }
  }

  const fetchLeaderboard = async (competitionId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/users/competitions/${competitionId}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeaderboard(response.data)
    } catch (error) {
      // Mock data for demo
      setLeaderboard([
        { rank: 1, name: 'CryptoPro', balance: 15234.56, profit: 5234.56, profitPercent: 52.3 },
        { rank: 2, name: 'TradeKing', balance: 14892.33, profit: 4892.33, profitPercent: 48.9 },
        { rank: 3, name: 'MoonTrader', balance: 13567.89, profit: 3567.89, profitPercent: 35.7 },
        { rank: 4, name: 'DiamondHands', balance: 12890.45, profit: 2890.45, profitPercent: 28.9 },
        { rank: 5, name: 'HODLMaster', balance: 12567.12, profit: 2567.12, profitPercent: 25.7 }
      ])
    }
  }

  const joinCompetition = async (competitionId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`/api/users/competitions/${competitionId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setMessage('Successfully joined the competition!')
        setShowJoinModal(false)
        fetchCompetitions()
        fetchMyCompetitions()
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to join competition')
    } finally {
      setLoading(false)
    }
  }

  const leaveCompetition = async (competitionId) => {
    if (!confirm('Are you sure you want to leave this competition? Your progress will be lost.')) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/users/competitions/${competitionId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Left competition successfully')
      fetchMyCompetitions()
    } catch (error) {
      setMessage('Failed to leave competition')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
      case 'ended':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
    }
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Trading Competitions</h2>
            <p className="text-gray-600 dark:text-gray-300">Compete with traders worldwide</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-2xl p-4">
        <div className="flex gap-4">
          {[
            { id: 'active', name: 'Active Competitions' },
            { id: 'my', name: 'My Competitions' },
            { id: 'results', name: 'Results & History' }
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

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') || message.includes('Successfully')
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Active Competitions Tab */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitions.map((competition) => (
            <div key={competition.id} className="glass rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{competition.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{competition.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(competition.status)}`}>
                  {competition.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Prize Pool</p>
                  <p className="text-xl font-bold text-green-500">${competition.prizePool.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="text-xl font-bold">{competition.participants}/{competition.maxParticipants}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Starting Balance</p>
                  <p className="text-lg font-semibold">${competition.startingBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entry Fee</p>
                  <p className="text-lg font-semibold">
                    {competition.entryFee === 0 ? 'Free' : `$${competition.entryFee}`}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Duration</p>
                <p className="text-sm">
                  {competition.startDate.toLocaleDateString()} - {competition.endDate.toLocaleDateString()}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Prize Distribution</p>
                <div className="text-sm space-y-1">
                  {Object.entries(competition.prizes).map(([position, amount]) => (
                    <div key={position} className="flex justify-between">
                      <span>
                        {position.includes('-') ? `${position} place` : `${position === '1' ? '1st' : position === '2' ? '2nd' : '3rd'} place`}
                      </span>
                      <span className="font-semibold">${amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCompetition(competition)
                    setShowJoinModal(true)
                  }}
                  className="flex-1 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-semibold"
                  disabled={competition.status !== 'active' && competition.status !== 'upcoming'}
                >
                  {competition.status === 'active' ? 'Join Now' : competition.status === 'upcoming' ? 'Register' : 'Ended'}
                </button>
                <button
                  onClick={() => {
                    setSelectedCompetition(competition)
                    fetchLeaderboard(competition.id)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Competitions Tab */}
      {activeTab === 'my' && (
        <div className="space-y-4">
          {myCompetitions.length === 0 ? (
            <div className="text-center glass rounded-2xl p-12">
              <p className="text-gray-500">You're not participating in any competitions yet</p>
              <button
                onClick={() => setActiveTab('active')}
                className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                Browse Competitions
              </button>
            </div>
          ) : (
            myCompetitions.map((competition) => (
              <div key={competition.id} className="glass rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{competition.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        Rank: <span className={`font-bold ${getRankColor(competition.currentRank)}`}>
                          {getRankIcon(competition.currentRank)}
                        </span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {competition.currentRank} of {competition.totalParticipants}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(competition.status)}`}>
                    {competition.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-xl font-bold">${competition.currentBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">P&L</p>
                    <p className={`text-xl font-bold ${competition.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {competition.profitLoss >= 0 ? '+' : ''}${competition.profitLoss.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return %</p>
                    <p className={`text-xl font-bold ${competition.profitLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {competition.profitLossPercentage >= 0 ? '+' : ''}{competition.profitLossPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trades</p>
                    <p className="text-xl font-bold">{competition.trades}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-semibold"
                    onClick={() => {
                      // Navigate to trading with competition mode
                      window.location.href = `/dashboard/trading?competition=${competition.id}`
                    }}
                  >
                    Trade Now
                  </button>
                  <button
                    onClick={() => leaveCompetition(competition.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Join Competition Modal */}
      {showJoinModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Join Competition</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold">{selectedCompetition.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{selectedCompetition.description}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Competition Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Starting Balance:</span>
                    <span className="font-semibold">${selectedCompetition.startingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entry Fee:</span>
                    <span className="font-semibold">
                      {selectedCompetition.entryFee === 0 ? 'Free' : `$${selectedCompetition.entryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prize Pool:</span>
                    <span className="font-semibold text-green-500">${selectedCompetition.prizePool.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-2">Rules</h5>
                <ul className="text-sm space-y-1">
                  {selectedCompetition.rules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-brand-500 mr-2">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => joinCompetition(selectedCompetition.id)}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Competition'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {selectedCompetition && leaderboard.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{selectedCompetition.title} - Leaderboard</h3>
              <button
                onClick={() => {
                  setSelectedCompetition(null)
                  setLeaderboard([])
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </span>
                    <div>
                      <p className="font-semibold">{entry.name}</p>
                      <p className="text-sm text-gray-500">Balance: ${entry.balance.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${entry.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.profit >= 0 ? '+' : ''}${entry.profit.toFixed(2)}
                    </p>
                    <p className={`text-sm ${entry.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.profitPercent >= 0 ? '+' : ''}{entry.profitPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingCompetitions
