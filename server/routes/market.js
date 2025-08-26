
const express = require('express')
const marketService = require('../services/marketService')

const router = express.Router()

// Get current cryptocurrency prices
router.get('/prices', async (req, res) => {
  try {
    const marketData = marketService.getCurrentData()
    
    if (Object.keys(marketData).length === 0) {
      // Fetch fresh data if cache is empty
      await marketService.fetchMarketData()
    }
    
    res.json(marketData)
  } catch (error) {
    console.error('Error fetching market data:', error)
    res.json(marketService.getFallbackData())
  }
})

// Get historical chart data
router.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    const { timeframe = '7', indicators } = req.query

    const historicalData = await marketService.getHistoricalData(symbol, timeframe)
    
    const response = { ohlcv: historicalData }
    
    // Add technical indicators if requested
    if (indicators) {
      const indicatorList = indicators.split(',')
      response.indicators = calculateTechnicalIndicators(historicalData, indicatorList)
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    res.status(500).json({ error: 'Failed to fetch chart data' })
  }
})

// Get market overview/stats
router.get('/overview', async (req, res) => {
  try {
    const marketData = marketService.getCurrentData()
    
    const overview = {
      totalMarketCap: Object.values(marketData).reduce((sum, coin) => sum + (coin.marketCap || 0), 0),
      total24hVolume: Object.values(marketData).reduce((sum, coin) => sum + (coin.volume || 0), 0),
      btcDominance: 45.2, // This would be calculated from real data
      activeCoins: Object.keys(marketData).length,
      markets: 15420,
      marketCapChange24h: 2.34
    }
    
    res.json(overview)
  } catch (error) {
    console.error('Error fetching market overview:', error)
    res.status(500).json({ error: 'Failed to fetch market overview' })
  }
})

// Search for cryptocurrencies
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    const marketData = marketService.getCurrentData()
    
    const results = Object.entries(marketData)
      .filter(([pair]) => {
        const [symbol] = pair.split('/')
        return symbol.toLowerCase().includes(q.toLowerCase())
      })
      .map(([pair, data]) => {
        const [symbol] = pair.split('/')
        return {
          symbol,
          name: getFullName(symbol),
          price: data.price,
          change: data.change
        }
      })
    
    res.json(results)
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

function getFullName(symbol) {
  const names = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'XRP': 'Ripple',
    'BNB': 'Binance Coin',
    'MATIC': 'Polygon',
    'DOT': 'Polkadot',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap'
  }
  return names[symbol] || symbol
}

function calculateTechnicalIndicators(data, indicators) {
  const prices = data.map(d => d.close)
  const result = {}
  
  if (indicators.includes('sma')) {
    result.sma = calculateSMA(prices, 20)
  }
  
  if (indicators.includes('ema')) {
    result.ema = calculateEMA(prices, 20)
  }
  
  if (indicators.includes('rsi')) {
    result.rsi = calculateRSI(prices, 14)
  }
  
  if (indicators.includes('macd')) {
    result.macd = calculateMACD(prices)
  }
  
  if (indicators.includes('bollinger')) {
    result.bollinger = calculateBollingerBands(prices, 20)
  }
  
  return result
}

function calculateSMA(prices, period) {
  const sma = []
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

function calculateEMA(prices, period) {
  const ema = []
  const multiplier = 2 / (period + 1)
  ema[0] = prices[0]

  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
  }
  return ema
}

function calculateRSI(prices, period) {
  const rsi = []
  const gains = []
  const losses = []

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
    const rs = avgGain / avgLoss
    rsi.push(100 - (100 / (1 + rs)))
  }
  return rsi
}

function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macdLine = ema12.map((val, i) => val - ema26[i])
  const signalLine = calculateEMA(macdLine, 9)
  const histogram = macdLine.map((val, i) => val - signalLine[i])

  return { macdLine, signalLine, histogram }
}

function calculateBollingerBands(prices, period) {
  const sma = calculateSMA(prices, period)
  const bands = { upper: [], middle: sma, lower: [] }

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
    const stdDev = Math.sqrt(variance)

    bands.upper.push(sma[i - period + 1] + (stdDev * 2))
    bands.lower.push(sma[i - period + 1] - (stdDev * 2))
  }

  return bands
}

module.exports = router
