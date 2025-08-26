
import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [marketData, setMarketData] = useState({})
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000')
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      
      // Join user room for notifications
      if (user) {
        newSocket.emit('join-user-room', user.id)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })

    // Handle price updates
    newSocket.on('price-update', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: data
      }))
    })

    // Handle notifications
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep last 20
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const joinMarketData = () => {
    if (socket) {
      socket.emit('join-market')
    }
  }

  const leaveMarketData = () => {
    if (socket) {
      socket.emit('leave-market')
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const value = {
    socket,
    isConnected,
    marketData,
    notifications,
    joinMarketData,
    leaveMarketData,
    clearNotifications,
    removeNotification
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
