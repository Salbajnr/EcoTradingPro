
const User = require('../models/User')
const marketService = require('./marketService')

class PortfolioService {
  constructor() {
    this.performanceCache = new Map()
  }

  async calculatePortfolioValue(userId) {
    try {
      const user = await User.findById(userId)
      if (!user) throw new Error('User not found')

      const marketData = marketService.getCurrentData()
      const portfolio = user.portfolio || {}
      
      let totalValue = user.balance || 0
      const holdings = []

      Object.entries(portfolio).forEach(([asset, quantity]) => {
        if (quantity > 0) {
          const marketPrice = marketData[`${asset}/USDT`]?.price || 0
          const value = quantity * marketPrice
          totalValue += value

          holdings.push({
            asset,
            quantity,
            marketPrice,
            value,
            allocation: 0 // Will be calculated after total
          })
        }
      })

      // Calculate allocations
      holdings.forEach(holding => {
        holding.allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0
      })

      return {
        totalValue,
        cashBalance: user.balance || 0,
        holdings,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error calculating portfolio value:', error)
      throw error
    }
  }

  async calculatePerformanceMetrics(userId, timeRange = 30) {
    try {
      const user = await User.findById(userId)
      if (!user) throw new Error('User not found')

      const trades = user.trades || []
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (timeRange * 24 * 60 * 60 * 1000))

      const relevantTrades = trades.filter(trade => 
        new Date(trade.timestamp) >= startDate && new Date(trade.timestamp) <= endDate
      )

      const portfolio = await this.calculatePortfolioValue(userId)
      const initialBalance = 10000 // Starting simulation balance

      // Calculate returns
      const totalReturn = ((portfolio.totalValue - initialBalance) / initialBalance) * 100
      const totalPnL = portfolio.totalValue - initialBalance

      // Calculate trade statistics
      const winningTrades = relevantTrades.filter(trade => {
        // Simplified P&L calculation for demonstration
        return trade.type === 'sell' && Math.random() > 0.4 // Mock win rate
      })

      const losingTrades = relevantTrades.filter(trade => {
        return trade.type === 'sell' && !winningTrades.includes(trade)
      })

      const winRate = relevantTrades.length > 0 ? (winningTrades.length / relevantTrades.length) * 100 : 0

      // Calculate volatility (simplified)
      const dailyReturns = this.calculateDailyReturns(userId, timeRange)
      const volatility = this.calculateVolatility(dailyReturns)

      // Calculate Sharpe ratio (simplified)
      const riskFreeRate = 0.02 // 2% annual
      const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
      const sharpeRatio = volatility > 0 ? (avgReturn - riskFreeRate / 365) / volatility : 0

      // Calculate maximum drawdown
      const maxDrawdown = this.calculateMaxDrawdown(userId, timeRange)

      return {
        totalReturn,
        totalPnL,
        winRate,
        totalTrades: relevantTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        volatility: volatility * 100, // Convert to percentage
        sharpeRatio,
        maxDrawdown,
        avgWin: winningTrades.length > 0 ? 4.2 : 0, // Mock data
        avgLoss: losingTrades.length > 0 ? -2.8 : 0, // Mock data
        profitFactor: losingTrades.length > 0 ? Math.abs(4.2 / -2.8) : 0,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error calculating performance metrics:', error)
      throw error
    }
  }

  calculateDailyReturns(userId, days) {
    // This would normally fetch historical portfolio values
    // For simulation, we'll generate realistic daily returns
    const returns = []
    for (let i = 0; i < days; i++) {
      // Generate returns with slight positive bias and realistic volatility
      returns.push((Math.random() - 0.47) * 0.05) // -2.5% to +2.5% daily range with positive bias
    }
    return returns
  }

  calculateVolatility(returns) {
    if (returns.length < 2) return 0
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1)
    return Math.sqrt(variance)
  }

  calculateMaxDrawdown(userId, days) {
    // Simplified max drawdown calculation
    // In practice, this would use historical portfolio values
    let peak = 10000
    let maxDrawdown = 0
    
    for (let i = 0; i < days; i++) {
      const dailyChange = (Math.random() - 0.47) * 0.05
      const currentValue = peak * (1 + dailyChange)
      
      if (currentValue > peak) {
        peak = currentValue
      } else {
        const drawdown = (peak - currentValue) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
    
    return maxDrawdown * 100 // Convert to percentage
  }

  async getRiskMetrics(userId) {
    try {
      const portfolio = await this.calculatePortfolioValue(userId)
      const performance = await this.calculatePerformanceMetrics(userId)
      
      // Calculate Value at Risk (95% confidence)
      const portfolioValue = portfolio.totalValue
      const dailyVolatility = performance.volatility / 100 / Math.sqrt(365)
      const var95 = portfolioValue * dailyVolatility * 1.645 // 95% confidence level

      // Calculate portfolio concentration
      const holdings = portfolio.holdings
      const concentrationRisk = holdings.length > 0 ? Math.max(...holdings.map(h => h.allocation)) : 0

      // Calculate correlation risk (simplified)
      const correlationRisk = holdings.length > 3 ? 'Low' : holdings.length > 1 ? 'Medium' : 'High'

      return {
        var95,
        concentrationRisk,
        correlationRisk,
        leverageRatio: 1.0, // No leverage in simulation
        betaToMarket: 0.85 + Math.random() * 0.3, // Mock beta between 0.85-1.15
        trackingError: Math.random() * 0.15, // Mock tracking error
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error calculating risk metrics:', error)
      throw error
    }
  }

  async getPortfolioComposition(userId) {
    try {
      const portfolio = await this.calculatePortfolioValue(userId)
      const marketData = marketService.getCurrentData()
      
      const composition = {
        byAsset: portfolio.holdings.map(holding => ({
          asset: holding.asset,
          allocation: holding.allocation,
          value: holding.value,
          quantity: holding.quantity,
          marketPrice: holding.marketPrice,
          change24h: marketData[`${holding.asset}/USDT`]?.change || 0
        })),
        byMarketCap: {
          largeCap: 0,
          midCap: 0,
          smallCap: 0
        },
        cashAllocation: portfolio.totalValue > 0 ? (portfolio.cashBalance / portfolio.totalValue) * 100 : 100
      }

      // Classify by market cap (simplified)
      composition.byAsset.forEach(asset => {
        const marketCap = marketData[`${asset.asset}/USDT`]?.marketCap || 0
        if (marketCap > 100000000000) { // > $100B
          composition.byMarketCap.largeCap += asset.allocation
        } else if (marketCap > 10000000000) { // $10B - $100B
          composition.byMarketCap.midCap += asset.allocation
        } else { // < $10B
          composition.byMarketCap.smallCap += asset.allocation
        }
      })

      return composition
    } catch (error) {
      console.error('Error calculating portfolio composition:', error)
      throw error
    }
  }
}

module.exports = new PortfolioService()
