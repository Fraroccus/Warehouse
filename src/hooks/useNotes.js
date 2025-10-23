import { useState, useEffect } from 'react'
import { supabase, useOfflineMode } from '../lib/supabase'

const STORAGE_KEY = 'warehouse_notes'

export function useNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const offline = useOfflineMode()

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [offline])

  // Subscribe to real-time changes if using Supabase
  useEffect(() => {
    if (offline || !supabase) return

    const notesChannel = supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        loadDataSilently() // Load without showing loading screen
      })
      .subscribe()

    return () => {
      supabase.removeChannel(notesChannel)
    }
  }, [offline])

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    
    if (offline) {
      // Load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setNotes(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading notes:', error)
          setNotes([])
        }
      } else {
        setNotes([])
      }
    } else {
      // Load from Supabase
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Convert timestamp strings to numbers for compatibility
        const formattedNotes = data.map(note => ({
          ...note,
          createdAt: new Date(note.created_at).getTime(),
          readAt: note.read_at ? new Date(note.read_at).getTime() : null,
          isRead: note.is_read
        }))

        setNotes(formattedNotes)
      } catch (error) {
        console.error('Error loading notes from Supabase:', error)
        setNotes([])
      }
    }
    
    if (showLoading) setLoading(false)
  }

  // Load data without showing loading screen (for real-time updates)
  const loadDataSilently = () => loadData(false)

  // Save to localStorage when offline
  useEffect(() => {
    if (offline && notes.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }
  }, [notes, offline])

  const addNote = async (noteData) => {
    const newNote = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      isRead: false,
      ...noteData
    }

    // Optimistic update: add to UI immediately
    const previousNotes = notes
    setNotes(prev => [newNote, ...prev])

    if (!offline) {
      try {
        const { error } = await supabase
          .from('notes')
          .insert([{
            id: newNote.id,
            title: newNote.title,
            content: newNote.content,
            is_read: false
          }])

        if (error) throw error
        // Real-time subscription will handle updates from other users
      } catch (error) {
        console.error('Error adding note:', error)
        // Rollback on error
        setNotes(previousNotes)
      }
    }
  }

  const markAsRead = async (noteId) => {
    // Optimistic update: update UI immediately
    const previousNotes = notes
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, isRead: true, readAt: Date.now() }
        : note
    ))

    if (!offline) {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('id', noteId)

        if (error) throw error
        // Real-time subscription will handle updates from other users
      } catch (error) {
        console.error('Error marking note as read:', error)
        // Rollback on error
        setNotes(previousNotes)
      }
    }
  }

  return {
    notes,
    loading,
    addNote,
    markAsRead
  }
}
