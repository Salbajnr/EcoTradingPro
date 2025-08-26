
import React, { useState, useEffect } from 'react'
import axios from '../../utils/axios'

function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'general', label: 'General' },
    { value: 'market', label: 'Market Analysis' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'trading', label: 'Trading Tips' },
    { value: 'platform', label: 'Platform Updates' },
    { value: 'regulation', label: 'Regulation' }
  ]

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await axios.get('/api/news')
      setNews(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching news:', error)
      setLoading(false)
    }
  }

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨'
      case 'high': return '📢'
      case 'normal': return '📰'
      case 'low': return '📝'
      default: return '📰'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'normal': return 'text-blue-600 dark:text-blue-400'
      case 'low': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Latest News & Updates</h2>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold mb-2">No articles found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Check back later for the latest news and updates'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <div key={article._id} className="glass rounded-2xl p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setSelectedArticle(article)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPriorityIcon(article.priority)}</span>
                  <span className={`text-sm font-medium ${getPriorityColor(article.priority)}`}>
                    {article.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {categories.find(c => c.value === article.category)?.label}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
              
              {article.summary && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {article.summary}
                </p>
              )}
              
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {article.content}
              </p>
              
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{article.tags.length - 3} more</span>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>By {article.author}</span>
                <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getPriorityIcon(selectedArticle.priority)}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>By {selectedArticle.author}</span>
                      <span>{new Date(selectedArticle.publishedAt || selectedArticle.createdAt).toLocaleDateString()}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {categories.find(c => c.value === selectedArticle.category)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedArticle.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
              >
                ×
              </button>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {selectedArticle.summary && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{selectedArticle.summary}</p>
                </div>
              )}
              <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default News
