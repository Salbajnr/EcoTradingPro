
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function APIAccess() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [newKeyConfig, setNewKeyConfig] = useState({
    name: '',
    permissions: {
      read: true,
      trade: false,
      withdraw: false
    },
    ipWhitelist: [],
    expiresAt: null
  })
  const [apiDocumentation, setApiDocumentation] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('keys')

  useEffect(() => {
    fetchApiKeys()
    loadApiDocumentation()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/api-keys', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApiKeys(response.data)
    } catch (error) {
      // Mock data for demo
      setApiKeys([
        {
          id: '1',
          name: 'Trading Bot API',
          keyPrefix: 'ctpk_1234...abcd',
          permissions: { read: true, trade: true, withdraw: false },
          lastUsed: new Date('2024-01-20'),
          createdAt: new Date('2024-01-15'),
          status: 'active',
          usageCount: 1847,
          ipWhitelist: ['192.168.1.100', '10.0.0.15']
        },
        {
          id: '2',
          name: 'Portfolio Tracker',
          keyPrefix: 'ctpk_5678...efgh',
          permissions: { read: true, trade: false, withdraw: false },
          lastUsed: new Date('2024-01-19'),
          createdAt: new Date('2024-01-10'),
          status: 'active',
          usageCount: 542,
          ipWhitelist: []
        }
      ])
    }
  }

  const loadApiDocumentation = () => {
    setApiDocumentation([
      {
        category: 'Authentication',
        endpoints: [
          {
            method: 'POST',
            path: '/api/v1/auth',
            description: 'Authenticate with API key',
            params: { 'X-API-Key': 'Your API key', 'X-API-Secret': 'Your API secret' }
          }
        ]
      },
      {
        category: 'Account',
        endpoints: [
          {
            method: 'GET',
            path: '/api/v1/account/balance',
            description: 'Get account balance',
            params: {},
            response: { balance: 10000, portfolio: {} }
          },
          {
            method: 'GET',
            path: '/api/v1/account/portfolio',
            description: 'Get portfolio holdings',
            params: {},
            response: { BTC: 0.5, ETH: 2.3 }
          }
        ]
      },
      {
        category: 'Market Data',
        endpoints: [
          {
            method: 'GET',
            path: '/api/v1/market/prices',
            description: 'Get current market prices',
            params: { symbols: 'BTC,ETH,SOL (optional)' },
            response: { 'BTC/USDT': { price: 68500, change: 2.1 } }
          },
          {
            method: 'GET',
            path: '/api/v1/market/orderbook/{symbol}',
            description: 'Get order book for a symbol',
            params: { symbol: 'BTC' },
            response: { bids: [], asks: [] }
          }
        ]
      },
      {
        category: 'Trading',
        endpoints: [
          {
            method: 'POST',
            path: '/api/v1/orders',
            description: 'Place a new order',
            params: {
              symbol: 'BTC',
              side: 'buy/sell',
              type: 'market/limit',
              amount: 1000,
              price: 68500
            },
            response: { orderId: '123', status: 'filled' }
          },
          {
            method: 'GET',
            path: '/api/v1/orders',
            description: 'Get order history',
            params: { status: 'open/filled/cancelled (optional)' },
            response: []
          },
          {
            method: 'DELETE',
            path: '/api/v1/orders/{orderId}',
            description: 'Cancel an order',
            params: { orderId: '123' },
            response: { status: 'cancelled' }
          }
        ]
      }
    ])
  }

  const createApiKey = async () => {
    if (!newKeyConfig.name.trim()) {
      setMessage('Please enter a name for the API key')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/users/api-keys', newKeyConfig, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setMessage(`API key created successfully! Secret: ${response.data.secret}`)
        setShowCreateModal(false)
        setNewKeyConfig({
          name: '',
          permissions: { read: true, trade: false, withdraw: false },
          ipWhitelist: [],
          expiresAt: null
        })
        fetchApiKeys()
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const revokeApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/api-keys/${keyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('API key revoked successfully')
      fetchApiKeys()
    } catch (error) {
      setMessage('Failed to revoke API key')
    }
  }

  const toggleKeyStatus = async (keyId, status) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/users/api-keys/${keyId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(`API key ${status === 'active' ? 'activated' : 'deactivated'}`)
      fetchApiKeys()
    } catch (error) {
      setMessage('Failed to update API key status')
    }
  }

  const formatPermissions = (permissions) => {
    const perms = []
    if (permissions.read) perms.push('Read')
    if (permissions.trade) perms.push('Trade')
    if (permissions.withdraw) perms.push('Withdraw')
    return perms.join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">API Access</h2>
            <p className="text-gray-600 dark:text-gray-300">Manage your API keys and access documentation</p>
          </div>
          {activeTab === 'keys' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
            >
              Create API Key
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-2xl p-4">
        <div className="flex gap-4">
          {[
            { id: 'keys', name: 'API Keys' },
            { id: 'documentation', name: 'Documentation' },
            { id: 'examples', name: 'Code Examples' }
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
          message.includes('success') || message.includes('created')
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center glass rounded-2xl p-12">
              <p className="text-gray-500">No API keys created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                Create Your First API Key
              </button>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="glass rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{key.name}</h3>
                    <p className="text-gray-500 font-mono text-sm">{key.keyPrefix}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    key.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
                  }`}>
                    {key.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Permissions</p>
                    <p className="font-semibold">{formatPermissions(key.permissions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usage Count</p>
                    <p className="font-semibold">{key.usageCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Used</p>
                    <p className="font-semibold">{key.lastUsed.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-semibold">{key.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>

                {key.ipWhitelist.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">IP Whitelist</p>
                    <div className="flex flex-wrap gap-2">
                      {key.ipWhitelist.map((ip) => (
                        <span key={ip} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleKeyStatus(key.id, key.status === 'active' ? 'inactive' : 'active')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      key.status === 'active'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {key.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setSelectedKey(key)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'documentation' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">API Documentation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Base URL: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">https://api.cryptotradepro.com/v1</code>
            </p>

            <div className="space-y-6">
              {apiDocumentation.map((category, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold mb-3">{category.category}</h4>
                  <div className="space-y-3">
                    {category.endpoints.map((endpoint, endpointIndex) => (
                      <div key={endpointIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            endpoint.method === 'GET' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                            endpoint.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                            'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">{endpoint.description}</p>
                        
                        {Object.keys(endpoint.params).length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-sm mb-2">Parameters:</p>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                              {JSON.stringify(endpoint.params, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {endpoint.response && (
                          <div>
                            <p className="font-semibold text-sm mb-2">Response:</p>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                              {JSON.stringify(endpoint.response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Code Examples</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Python Example</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import requests
import hashlib
import hmac
import time

API_KEY = "your_api_key"
API_SECRET = "your_api_secret"
BASE_URL = "https://api.cryptotradepro.com/v1"

def make_request(method, endpoint, params=None):
    timestamp = str(int(time.time() * 1000))
    
    headers = {
        'X-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json'
    }
    
    # Create signature
    message = timestamp + method + endpoint
    if params:
        message += json.dumps(params)
    
    signature = hmac.new(
        API_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    headers['X-Signature'] = signature
    
    if method == 'GET':
        response = requests.get(BASE_URL + endpoint, headers=headers)
    else:
        response = requests.post(BASE_URL + endpoint, headers=headers, json=params)
    
    return response.json()

# Get account balance
balance = make_request('GET', '/account/balance')
print(balance)

# Place order
order = make_request('POST', '/orders', {
    'symbol': 'BTC',
    'side': 'buy',
    'type': 'market',
    'amount': 1000
})
print(order)`}
                </pre>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">JavaScript Example</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`const crypto = require('crypto');
const axios = require('axios');

const API_KEY = 'your_api_key';
const API_SECRET = 'your_api_secret';
const BASE_URL = 'https://api.cryptotradepro.com/v1';

async function makeRequest(method, endpoint, params = null) {
    const timestamp = Date.now().toString();
    
    const headers = {
        'X-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json'
    };
    
    // Create signature
    let message = timestamp + method + endpoint;
    if (params) {
        message += JSON.stringify(params);
    }
    
    const signature = crypto
        .createHmac('sha256', API_SECRET)
        .update(message)
        .digest('hex');
    
    headers['X-Signature'] = signature;
    
    try {
        let response;
        if (method === 'GET') {
            response = await axios.get(BASE_URL + endpoint, { headers });
        } else {
            response = await axios.post(BASE_URL + endpoint, params, { headers });
        }
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data);
        throw error;
    }
}

// Get market prices
makeRequest('GET', '/market/prices')
    .then(prices => console.log(prices))
    .catch(err => console.error(err));

// Place order
makeRequest('POST', '/orders', {
    symbol: 'BTC',
    side: 'buy',
    type: 'limit',
    amount: 1000,
    price: 68500
}).then(order => console.log(order));`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Create API Key</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key Name</label>
                <input
                  type="text"
                  value={newKeyConfig.name}
                  onChange={(e) => setNewKeyConfig({...newKeyConfig, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="My Trading Bot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Permissions</label>
                <div className="space-y-2">
                  {Object.entries(newKeyConfig.permissions).map(([permission, enabled]) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setNewKeyConfig({
                          ...newKeyConfig,
                          permissions: {
                            ...newKeyConfig.permissions,
                            [permission]: e.target.checked
                          }
                        })}
                        className="mr-3 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="capitalize">{permission}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {permission === 'read' && '(View account data)'}
                        {permission === 'trade' && '(Place/cancel orders)'}
                        {permission === 'withdraw' && '(Withdraw funds - NOT AVAILABLE IN SIMULATION)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ Keep your API secret safe! It will only be shown once after creation.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createApiKey}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default APIAccess
