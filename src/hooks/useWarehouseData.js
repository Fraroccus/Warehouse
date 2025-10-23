import { useState, useEffect } from 'react'

const STORAGE_KEY = 'warehouse_data'

export function useWarehouseData() {
  const [shelves, setShelves] = useState([])

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setShelves(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading data:', error)
        // If there's an error, initialize with empty array
        setShelves([])
      }
    } else {
      // Only initialize with sample data on very first use
      const hasInitialized = localStorage.getItem('warehouse_initialized')
      if (!hasInitialized) {
        // Initialize with sample data
        const initialShelves = [
          {
            id: '1',
            position: [-3, 1, 0],
            size: [1, 2, 0.5],
            color: '#8B4513',
            items: [
              { id: 'item1', name: 'Set di cacciaviti', quantity: 15 },
              { id: 'item2', name: 'Martello', quantity: 8 }
            ]
          },
          {
            id: '2',
            position: [0, 1, 0],
            size: [1, 2, 0.5],
            color: '#A0522D',
            items: [
              { id: 'item3', name: 'Barattoli di vernice', quantity: 24 },
              { id: 'item4', name: 'Pennelli', quantity: 30 }
            ]
          },
          {
            id: '3',
            position: [3, 1, 0],
            size: [1, 2, 0.5],
            color: '#8B4513',
            items: [
              { id: 'item5', name: 'Scatola di chiodi', quantity: 50 }
            ]
          }
        ]
        setShelves(initialShelves)
        localStorage.setItem('warehouse_initialized', 'true')
      } else {
        // Already initialized before, start with empty array
        setShelves([])
      }
    }
  }, [])

  // Save data to localStorage whenever shelves change
  useEffect(() => {
    // Always save, even if empty (to preserve deletions)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves))
  }, [shelves])

  const addShelf = (shelfData) => {
    const newShelf = {
      id: Date.now().toString(),
      items: [],
      ...shelfData
    }
    setShelves(prev => [...prev, newShelf])
  }

  const updateShelf = (shelfId, updates) => {
    setShelves(prev => prev.map(shelf =>
      shelf.id === shelfId ? { ...shelf, ...updates } : shelf
    ))
  }

  const deleteShelf = (shelfId) => {
    setShelves(prev => prev.filter(shelf => shelf.id !== shelfId))
  }

  const addItem = (shelfId, itemData) => {
    setShelves(prev => prev.map(shelf => {
      if (shelf.id === shelfId) {
        const newItem = {
          id: Date.now().toString(),
          ...itemData
        }
        return {
          ...shelf,
          items: [...(shelf.items || []), newItem]
        }
      }
      return shelf
    }))
  }

  const updateItem = (shelfId, itemId, updates) => {
    setShelves(prev => prev.map(shelf => {
      if (shelf.id === shelfId) {
        return {
          ...shelf,
          items: shelf.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        }
      }
      return shelf
    }))
  }

  const deleteItem = (shelfId, itemId) => {
    setShelves(prev => prev.map(shelf => {
      if (shelf.id === shelfId) {
        return {
          ...shelf,
          items: shelf.items.filter(item => item.id !== itemId)
        }
      }
      return shelf
    }))
  }

  const searchItems = (query) => {
    const results = []
    const lowerQuery = query.toLowerCase()

    shelves.forEach(shelf => {
      shelf.items?.forEach(item => {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            ...item,
            shelfId: shelf.id
          })
        }
      })
    })

    return results
  }

  return {
    shelves,
    addShelf,
    updateShelf,
    deleteShelf,
    addItem,
    updateItem,
    deleteItem,
    searchItems
  }
}
