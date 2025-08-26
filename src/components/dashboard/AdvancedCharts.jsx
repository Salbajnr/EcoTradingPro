import React, { useState, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import axios from '../../utils/axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

function AdvancedCharts() {
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [timeframe, setTimeframe] = useState('1d')
  const [chartType, setChartType] = useState('candlestick')
  const [indicators, setIndicators] = useState({
    sma: false,
    ema: false,
    bollinger: false,
    rsi: false,
    macd: false,
    volume: true
  })
  const [chartData, setChartData] = useState(null)
  const [technicalData, setTechnicalData] = useState({})
  const [loading, setLoading] = useState(false)
  const [drawings, setDrawings] = useState([])
  const [activeDrawing, setActiveDrawing] = useState(null)

  const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'BNB', 'MATIC', 'DOT', 'LINK', 'UNI']
  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' }
  ]

  const drawingTools = [
    { id: 'trend', name: 'Trend Line', icon: '📈' },
    { id: 'horizontal', name: 'Horizontal Line', icon: '➖' },
    { id: 'rectangle', name: 'Rectangle', icon: '⬛' },
    { id: 'fibonacci', name: 'Fibonacci', icon: '🌀' },
    { id: 'text', name: 'Text', icon: '📝' }
  ]

  useEffect(() => {
    fetchChartData()
  }, [selectedAsset, timeframe])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/market/chart/${selectedAsset}`, {
        params: { timeframe, indicators: Object.keys(indicators).filter(k => indicators[k]) }
      })

      setChartData(response.data.ohlcv)
      setTechnicalData(response.data.indicators || {})
    } catch (error) {
      console.error('Error fetching chart data:', error)
      generateMockChartData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockChartData = () => {
    const data = []
    const basePrice = 50000
    let currentPrice = basePrice

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - (99 - i) * 24 * 60 * 60 * 1000)
      const variation = (Math.random() - 0.5) * 0.1
      currentPrice = currentPrice * (1 + variation)

      const open = currentPrice
      const high = open * (1 + Math.random() * 0.05)
      const low = open * (1 - Math.random() * 0.05)
      const close = low + Math.random() * (high - low)
      const volume = Math.random() * 1000000

      data.push({
        timestamp: timestamp.getTime(),
        open,
        high,
        low,
        close,
        volume
      })
    }

    setChartData(data)
    generateTechnicalIndicators(data)
  }

  const generateTechnicalIndicators = (data) => {
    const technical = {}

    if (indicators.sma) {
      technical.sma = calculateSMA(data.map(d => d.close), 20)
    }

    if (indicators.ema) {
      technical.ema = calculateEMA(data.map(d => d.close), 20)
    }

    if (indicators.rsi) {
      technical.rsi = calculateRSI(data.map(d => d.close), 14)
    }

    if (indicators.macd) {
      technical.macd = calculateMACD(data.map(d => d.close))
    }

    if (indicators.bollinger) {
      technical.bollinger = calculateBollingerBands(data.map(d => d.close), 20)
    }

    setTechnicalData(technical)
  }

  const calculateSMA = (prices, period) => {
    const sma = []
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
    return sma
  }

  const calculateEMA = (prices, period) => {
    const ema = []
    const multiplier = 2 / (period + 1)
    ema[0] = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
    }
    return ema
  }

  const calculateRSI = (prices, period) => {
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

  const calculateMACD = (prices) => {
    const ema12 = calculateEMA(prices, 12)
    const ema26 = calculateEMA(prices, 26)
    const macdLine = ema12.map((val, i) => val - ema26[i])
    const signalLine = calculateEMA(macdLine, 9)
    const histogram = macdLine.map((val, i) => val - signalLine[i])

    return { macdLine, signalLine, histogram }
  }

  const calculateBollingerBands = (prices, period) => {
    const sma = calculateSMA(prices, period)
    const bands = { upper: [], middle: sma, lower: [] }

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = slice.reduce((a, b) => a + b, 0) / period
      const variance = slice.slice(i - period + 1, i + 1).reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
      const stdDev = Math.sqrt(variance)

      bands.upper.push(sma[i - period + 1] + (stdDev * 2))
      bands.lower.push(sma[i - period + 1] - (stdDev * 2))
    }

    return bands
  }

  const toggleIndicator = (indicator) => {
    const newIndicators = {
      ...indicators,
      [indicator]: !indicators[indicator]
    }
    setIndicators(newIndicators)

    if (chartData) {
      generateTechnicalIndicators(chartData)
    }
  }

  const getChartConfig = () => {
    if (!chartData) return null

    const labels = chartData.map(d => new Date(d.timestamp))
    const prices = chartData.map(d => d.close)

    const datasets = [{
      label: `${selectedAsset} Price`,
      data: prices,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0
    }]

    // Add technical indicators
    if (indicators.sma && technicalData.sma) {
      datasets.push({
        label: 'SMA (20)',
        data: technicalData.sma,
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      })
    }

    if (indicators.ema && technicalData.ema) {
      datasets.push({
        label: 'EMA (20)',
        data: technicalData.ema,
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      })
    }

    if (indicators.bollinger && technicalData.bollinger) {
      datasets.push(
        {
          label: 'BB Upper',
          data: technicalData.bollinger.upper,
          borderColor: 'rgba(168, 85, 247, 0.5)',
          borderWidth: 1,
          fill: false,
          pointRadius: 0
        },
        {
          label: 'BB Lower',
          data: technicalData.bollinger.lower,
          borderColor: 'rgba(168, 85, 247, 0.5)',
          borderWidth: 1,
          fill: '+1',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          pointRadius: 0
        }
      )
    }

    return {
      labels,
      datasets
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe.includes('m') ? 'minute' : timeframe.includes('h') ? 'hour' : 'day'
        }
      },
      y: {
        beginAtZero: false
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Advanced Charts</h2>
            <p className="text-gray-600 dark:text-gray-300">Professional trading analysis tools</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {assets.map(asset => (
                <option key={asset} value={asset}>{asset}/USDT</option>
              ))}
            </select>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>

            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="candlestick">Candlestick</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Chart Area */}
        <div className="xl:col-span-3">
          <div className="glass rounded-2xl p-6">
            <div className="h-96 lg:h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : chartData && getChartConfig() ? (
                <Line data={getChartConfig()} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">No chart data available</div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Indicators Panels */}
          {indicators.rsi && technicalData.rsi && (
            <div className="glass rounded-2xl p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">RSI (14)</h3>
              <div className="h-32">
                <Line
                  data={{
                    labels: chartData?.slice(14).map(d => new Date(d.timestamp)) || [],
                    datasets: [{
                      label: 'RSI',
                      data: technicalData.rsi,
                      borderColor: 'rgb(168, 85, 247)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      fill: true,
                      pointRadius: 0
                    }]
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        min: 0,
                        max: 100,
                        grid: {
                          color: (context) => {
                            if (context.tick.value === 30 || context.tick.value === 70) {
                              return 'rgba(239, 68, 68, 0.5)'
                            }
                            return 'rgba(156, 163, 175, 0.2)'
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {indicators.macd && technicalData.macd && (
            <div className="glass rounded-2xl p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">MACD</h3>
              <div className="h-32">
                <Line
                  data={{
                    labels: chartData?.slice(26).map(d => new Date(d.timestamp)) || [],
                    datasets: [
                      {
                        label: 'MACD',
                        data: technicalData.macd.macdLine,
                        borderColor: 'rgb(59, 130, 246)',
                        pointRadius: 0
                      },
                      {
                        label: 'Signal',
                        data: technicalData.macd.signalLine,
                        borderColor: 'rgb(239, 68, 68)',
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tools Panel */}
        <div className="xl:col-span-1 space-y-6">
          {/* Technical Indicators */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
            <div className="space-y-3">
              {Object.entries(indicators).map(([key, enabled]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleIndicator(key)}
                    className="mr-3 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Drawing Tools */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Drawing Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {drawingTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveDrawing(tool.id)}
                  className={`p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-center ${
                    activeDrawing === tool.id ? 'bg-brand-100 dark:bg-brand-900/20 border-brand-500' : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{tool.icon}</div>
                  <div className="text-xs">{tool.name}</div>
                </button>
              ))}
            </div>

            {activeDrawing && (
              <div className="mt-4 p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
                <p className="text-sm text-brand-700 dark:text-brand-400">
                  {drawingTools.find(t => t.id === activeDrawing)?.name} tool selected. 
                  Click on the chart to draw.
                </p>
                <button
                  onClick={() => setActiveDrawing(null)}
                  className="mt-2 text-xs text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Market Info */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Market Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Open</span>
                <span className="font-semibold">
                  ${chartData?.[chartData.length - 1]?.open.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">High</span>
                <span className="font-semibold text-green-500">
                  ${chartData?.[chartData.length - 1]?.high.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Low</span>
                <span className="font-semibold text-red-500">
                  ${chartData?.[chartData.length - 1]?.low.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Close</span>
                <span className="font-semibold">
                  ${chartData?.[chartData.length - 1]?.close.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volume</span>
                <span className="font-semibold">
                  {((chartData?.[chartData.length - 1]?.volume || 0) / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedCharts