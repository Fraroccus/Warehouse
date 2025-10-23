import { useState, useEffect } from 'react'
import { supabase, useOfflineMode } from '../lib/supabase'

const STORAGE_KEY = 'warehouse_data'

export function useWarehouseData() {
  const [shelves, setShelves] = useState([])
  const [loading, setLoading] = useState(true)
  const offline = useOfflineMode()

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [offline])

  // Subscribe to real-time changes if using Supabase
  useEffect(() => {
    if (offline || !supabase) return

    const shelvesChannel = supabase
      .channel('shelves-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelves' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(shelvesChannel)
    }
  }, [offline])

  const loadData = async () => {
    setLoading(true)
    
    if (offline) {
      // Load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setShelves(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading data:', error)
          setShelves([])
        }
      } else {
        // Only initialize with sample data on very first use
        const hasInitialized = localStorage.getItem('warehouse_initialized')
        if (!hasInitialized) {
          setShelves(getInitialShelves())
          localStorage.setItem('warehouse_initialized', 'true')
        } else {
          setShelves([])
        }
      }
    } else {
      // Load from Supabase
      try {
        const { data: shelvesData, error: shelvesError } = await supabase
          .from('shelves')
          .select('*')
          .order('created_at', { ascending: true })

        if (shelvesError) throw shelvesError

        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: true })

        if (itemsError) throw itemsError

        // Combine shelves with their items
        const shelvesWithItems = shelvesData.map(shelf => ({
          ...shelf,
          position: shelf.position,
          size: shelf.size,
          items: itemsData.filter(item => item.shelf_id === shelf.id)
        }))

        setShelves(shelvesWithItems)
      } catch (error) {
        console.error('Error loading from Supabase:', error)
        setShelves([])
      }
    }
    
    setLoading(false)
  }

  // Save to localStorage when offline
  useEffect(() => {
    if (offline) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves))
    }
  }, [shelves, offline])

  const addShelf = async (shelfData) => {
    const newShelf = {
      id: Date.now().toString(),
      items: [],
      ...shelfData
    }

    if (offline) {
      setShelves(prev => [...prev, newShelf])
    } else {
      try {
        const { error } = await supabase
          .from('shelves')
          .insert([{
            id: newShelf.id,
            position: newShelf.position,
            size: newShelf.size,
            color: newShelf.color,
            name: newShelf.name
          }])

        if (error) throw error
        await loadData()
      } catch (error) {
        console.error('Error adding shelf:', error)
      }
    }
  }

  const updateShelf = async (shelfId, updates) => {
    if (offline) {
      setShelves(prev => prev.map(shelf =>
        shelf.id === shelfId ? { ...shelf, ...updates } : shelf
      ))
    } else {
      try {
        const { error } = await supabase
          .from('shelves')
          .update({
            position: updates.position,
            size: updates.size,
            color: updates.color,
            name: updates.name
          })
          .eq('id', shelfId)

        if (error) throw error
        await loadData()
      } catch (error) {
        console.error('Error updating shelf:', error)
      }
    }
  }

  const deleteShelf = async (shelfId) => {
    if (offline) {
      setShelves(prev => prev.filter(shelf => shelf.id !== shelfId))
    } else {
      try {
        const { error } = await supabase
          .from('shelves')
          .delete()
          .eq('id', shelfId)

        if (error) throw error
        await loadData()
      } catch (error) {
        console.error('Error deleting shelf:', error)
      }
    }
  }

  const addItem = async (shelfId, itemData) => {
    const newItem = {
      id: Date.now().toString(),
      ...itemData
    }

    if (offline) {
      setShelves(prev => prev.map(shelf => {
        if (shelf.id === shelfId) {
          return {
            ...shelf,
            items: [...(shelf.items || []), newItem]
          }
        }
        return shelf
      }))
    } else {
      try {
        const { error } = await supabase
          .from('items')
          .insert([{
            id: newItem.id,
            shelf_id: shelfId,
            name: newItem.name,
            quantity: newItem.quantity
          }])

        if (error) throw error
        await loadData()
      } catch (error) {
        console.error('Error adding item:', error)
      }
    }
  }

  const updateItem = async (shelfId, itemId, updates) => {
    if (offline) {
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
    } else {
      try {
        const { error } = await supabase
          .from('items')
          .update({
            name: updates.name,
            quantity: updates.quantity
          })
          .eq('id', itemId)

        if (error) throw error
        await loadData()
      } catch (error) {
        console.error('Error updating item:', error)
      }
    }
  }

  const deleteItem = async (shelfId, itemId) => {
    if (offline) {
      setShelves(prev => prev.map(shelf => {
        if (shelf.id === shelfId) {
          return {
            ...shelf,
            items: shelf.items.filter(item => item.id !== itemId)
          }
        }
        return shelf
      }))
    } else {
      try {
        const { error } = await supabase
          .from('items')
          .delete()
          .eq('id', itemId)

        if (error) throw error
        await loadData()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
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
    loading,
    addShelf,
    updateShelf,
    deleteShelf,
    addItem,
    updateItem,
    deleteItem,
    searchItems
  }
}

function getInitialShelves() {
  return [
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
}
