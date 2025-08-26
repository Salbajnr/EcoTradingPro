
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function NewsManagement() {
  const { user } = useAuth()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    isPublished: false,
    tags: '',
    summary: ''
  })

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'market', label: 'Market Analysis' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'trading', label: 'Trading Tips' },
    { value: 'platform', label: 'Platform Updates' },
    { value: 'regulation', label: 'Regulation' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' }
  ]

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/news', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNews(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching news:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage('Title and content are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const newsData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author: user.name || `${user.firstName} ${user.lastName}`
      }

      if (editingNews) {
        await axios.put(`/api/admin/news/${editingNews._id}`, newsData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMessage('News updated successfully')
      } else {
        await axios.post('/api/admin/news', newsData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMessage('News created successfully')
      }

      resetForm()
      fetchNews()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      priority: newsItem.priority,
      isPublished: newsItem.isPublished,
      tags: newsItem.tags.join(', '),
      summary: newsItem.summary || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/news/${newsId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('News deleted successfully')
      fetchNews()
    } catch (error) {
      setMessage('Failed to delete news')
    }
  }

  const togglePublishStatus = async (newsId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/news/${newsId}/publish`, {
        isPublished: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(`News ${!currentStatus ? 'published' : 'unpublished'} successfully`)
      fetchNews()
    } catch (error) {
      setMessage('Failed to update publish status')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'normal',
      isPublished: false,
      tags: '',
      summary: ''
    })
    setEditingNews(null)
    setShowForm(false)
  }

  const getPriorityStyle = (priority) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-700'
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">News Management</h2>
          <p className="text-gray-500 mt-1">Create and manage news articles for the platform</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <span>+</span>
          Create News
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total Articles</h3>
          <p className="text-3xl font-bold text-brand-500">{news.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Published</h3>
          <p className="text-3xl font-bold text-emerald-500">
            {news.filter(n => n.isPublished).length}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-orange-500">
            {news.filter(n => !n.isPublished).length}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">High Priority</h3>
          <p className="text-3xl font-bold text-red-500">
            {news.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message}
          <button 
            onClick={() => setMessage('')}
            className="float-right text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* News Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingNews ? 'Edit News Article' : 'Create New Article'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter news title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="bitcoin, trading, analysis"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Brief summary of the article"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={10}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Write your news content here..."
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  {editingNews ? 'Update Article' : 'Create Article'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">All Articles</h3>
        
        {news.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
            <p className="text-gray-500 mb-4">Create your first news article to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Create Article
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{article.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(article.priority)}`}>
                        {article.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        article.isPublished 
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Category: {categories.find(c => c.value === article.category)?.label} | 
                      Author: {article.author} | 
                      Created: {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                    
                    {article.summary && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{article.summary}</p>
                    )}
                    
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => togglePublishStatus(article._id, article.isPublished)}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        article.isPublished
                          ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                          : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/30'
                      }`}
                    >
                      {article.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleEdit(article)}
                      className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {article.content.substring(0, 200)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsManagement
