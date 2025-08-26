
const axios = require('axios')
const EventEmitter = require('events')

class MarketService extends EventEmitter {
  constructor() {
    super()
    this.marketData = {}
    this.subscribers = new Set()
    this.updateInterval = null
    this.coinGeckoUrl = 'https://api.coingecko.com/api/v3'
    
    this.supportedAssets = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum', 
      'SOL': 'solana',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'BNB': 'binancecoin',
      'MATIC': 'matic-network',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'UNI': 'uniswap'
    }
    
    this.startRealTimeUpdates()
  }

  async fetchMarketData() {
    try {
      const coinIds = Object.values(this.supportedAssets).join(',')
      
      const [pricesResponse, globalResponse] = await Promise.all([
        axios.get(`${this.coinGeckoUrl}/simple/price`, {
          params: {
            ids: coinIds,
            vs_currencies: 'usd',
            include_24hr_change: 'true',
            include_24hr_vol: 'true',
            include_market_cap: 'true'
          }
        }),
        axios.get(`${this.coinGeckoUrl}/global`)
      ])

      const updatedData = {}
      
      Object.entries(this.supportedAssets).forEach(([symbol, coinId]) => {
        const coinData = pricesResponse.data[coinId]
        if (coinData) {
          updatedData[`${symbol}/USDT`] = {
            price: coinData.usd,
            change: coinData.usd_24h_change || 0,
            volume: coinData.usd_24h_vol || 0,
            marketCap: coinData.usd_market_cap || 0,
            timestamp: Date.now()
          }
        }
      })

      this.marketData = updatedData
      this.emit('marketUpdate', this.marketData)
      
      return this.marketData
    } catch (error) {
      console.error('Error fetching market data:', error)
      return this.getFallbackData()
    }
  }

  getFallbackData() {
    return {
      'BTC/USDT': { price: 68355, change: 1.2, volume: 28500000000, marketCap: 1300000000000 },
      'ETH/USDT': { price: 3210, change: -0.4, volume: 15000000000, marketCap: 385000000000 },
      'SOL/USDT': { price: 182.4, change: 2.1, volume: 3200000000, marketCap: 85000000000 },
      'XRP/USDT': { price: 0.62, change: 0.7, volume: 2100000000, marketCap: 35000000000 },
      'BNB/USDT': { price: 598.3, change: 0.9, volume: 1800000000, marketCap: 89000000000 },
      'ADA/USDT': { price: 0.52, change: -0.3, volume: 950000000, marketCap: 18000000000 }
    }
  }

  async getHistoricalData(symbol, timeframe = '7') {
    try {
      const coinId = this.supportedAssets[symbol]
      if (!coinId) throw new Error('Unsupported symbol')

      const response = await axios.get(`${this.coinGeckoUrl}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: timeframe,
          interval: timeframe <= 1 ? 'hourly' : 'daily'
        }
      })

      return response.data.prices.map(([timestamp, price]) => ({
        timestamp,
        open: price * (0.98 + Math.random() * 0.04),
        high: price * (1.01 + Math.random() * 0.03),
        low: price * (0.97 + Math.random() * 0.02),
        close: price,
        volume: Math.random() * 1000000000
      }))
    } catch (error) {
      console.error('Error fetching historical data:', error)
      return this.generateMockHistoricalData(symbol, timeframe)
    }
  }

  generateMockHistoricalData(symbol, days = 7) {
    const data = []
    const basePrice = this.marketData[`${symbol}/USDT`]?.price || 50000
    let currentPrice = basePrice

    for (let i = 0; i < parseInt(days); i++) {
      const timestamp = Date.now() - (parseInt(days) - 1 - i) * 24 * 60 * 60 * 1000
      const variation = (Math.random() - 0.5) * 0.1
      currentPrice = currentPrice * (1 + variation)

      const open = currentPrice
      const high = open * (1 + Math.random() * 0.05)
      const low = open * (1 - Math.random() * 0.05)
      const close = low + Math.random() * (high - low)

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000000
      })
    }

    return data
  }

  startRealTimeUpdates() {
    // Initial fetch
    this.fetchMarketData()
    
    // Update every 30 seconds
    this.updateInterval = setInterval(() => {
      this.fetchMarketData()
    }, 30000)
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  getCurrentData() {
    return this.marketData
  }

  subscribe(callback) {
    this.on('marketUpdate', callback)
  }

  unsubscribe(callback) {
    this.off('marketUpdate', callback)
  }
}

module.exports = new MarketService()
