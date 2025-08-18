
const express = require('express')
const axios = require('axios')

const router = express.Router()

// Cache for market data
let marketDataCache = {}
let lastFetch = 0
const CACHE_DURATION = 30000 // 30 seconds

// Get cryptocurrency prices from CoinGecko
router.get('/prices', async (req, res) => {
  try {
    const now = Date.now()
    
    // Return cached data if still fresh
    if (now - lastFetch < CACHE_DURATION && Object.keys(marketDataCache).length > 0) {
      return res.json(marketDataCache)
    }

    // Fetch fresh data from CoinGecko
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum,solana,cardano,ripple,binancecoin',
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_24hr_vol: 'true'
      }
    })

    // Transform the data
    const transformedData = {
      'BTC/USDT': {
        price: response.data.bitcoin.usd,
        change: response.data.bitcoin.usd_24h_change
      },
      'ETH/USDT': {
        price: response.data.ethereum.usd,
        change: response.data.ethereum.usd_24h_change
      },
      'SOL/USDT': {
        price: response.data.solana.usd,
        change: response.data.solana.usd_24h_change
      },
      'ADA/USDT': {
        price: response.data.cardano.usd,
        change: response.data.cardano.usd_24h_change
      },
      'XRP/USDT': {
        price: response.data.ripple.usd,
        change: response.data.ripple.usd_24h_change
      },
      'BNB/USDT': {
        price: response.data.binancecoin.usd,
        change: response.data.binancecoin.usd_24h_change
      }
    }

    marketDataCache = transformedData
    lastFetch = now

    res.json(transformedData)
  } catch (error) {
    console.error('Error fetching market data:', error)
    
    // Return cached data or fallback data if API fails
    if (Object.keys(marketDataCache).length > 0) {
      res.json(marketDataCache)
    } else {
      res.json({
        'BTC/USDT': { price: 68355, change: 1.2 },
        'ETH/USDT': { price: 3210, change: -0.4 },
        'SOL/USDT': { price: 182.4, change: 2.1 },
        'XRP/USDT': { price: 0.62, change: 0.7 },
        'BNB/USDT': { price: 598.3, change: 0.9 },
        'ADA/USDT': { price: 0.52, change: -0.3 }
      })
    }
  }
})

// Get historical chart data
router.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    const { timeframe = '7' } = req.query

    const coinIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'BNB': 'binancecoin'
    }

    const coinId = coinIds[symbol]
    if (!coinId) {
      return res.status(400).json({ error: 'Invalid symbol' })
    }

    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: timeframe
      }
    })

    res.json(response.data.prices)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    
    // Return mock data if API fails
    const mockData = []
    for (let i = 0; i < 7; i++) {
      mockData.push([
        Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
        40000 + Math.random() * 5000
      ])
    }
    res.json(mockData)
  }
})

module.exports = router
