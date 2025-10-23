import { useState, useEffect } from 'react'
import WarehouseView from './components/WarehouseView'
import Toolbar from './components/Toolbar'
import ContentPanel from './components/ContentPanel'
import ShelfDimensionsPanel from './components/ShelfDimensionsPanel'
import NotesPanel from './components/NotesPanel'
import SearchBar from './components/SearchBar'
import { useWarehouseData } from './hooks/useWarehouseDataSupabase'
import { useNotes } from './hooks/useNotes'
import './App.css'

function App() {
  const {
    shelves,
    loading: shelvesLoading,
    addShelf,
    updateShelf,
    deleteShelf,
    addItem,
    updateItem,
    deleteItem,
    searchItems
  } = useWarehouseData()

  const {
    notes,
    loading: notesLoading,
    addNote,
    markAsRead
  } = useNotes()

  const [selectedShelf, setSelectedShelf] = useState(null)
  const [highlightedShelves, setHighlightedShelves] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [editingDimensions, setEditingDimensions] = useState(null)
  const [showNotes, setShowNotes] = useState(false)

  const handleSearch = (query) => {
    if (!query.trim()) {
      setHighlightedShelves([])
      return
    }

    const results = searchItems(query)
    const shelfIds = [...new Set(results.map(item => item.shelfId))]
    setHighlightedShelves(shelfIds)
  }

  const handleShelfClick = (shelfId) => {
    if (!editMode) {
      setSelectedShelf(shelfId)
    }
  }

  const handleShelfDoubleClick = (shelfId) => {
    if (editMode) {
      setEditingDimensions(shelfId)
    }
  }

  const handleDeleteShelf = (shelfId) => {
    deleteShelf(shelfId)
    setSelectedShelf(null)
  }

  const handleAddShelf = () => {
    const newShelf = {
      position: [0, 1, 0],
      size: [1, 2, 0.5],
      color: '#8B4513'
    }
    addShelf(newShelf)
  }

  const handleAddNote = (noteData) => {
    addNote(noteData)
  }

  const handleMarkAsRead = (noteId) => {
    markAsRead(noteId)
  }

  const handleImportData = async (data) => {
    if (data.shelves) {
      // Import shelves through the warehouse data system
      localStorage.setItem('warehouse_data', JSON.stringify(data.shelves))
      window.location.reload() // Reload to apply changes
    }
    if (data.notes) {
      // Import notes
      for (const note of data.notes) {
        await addNote({
          title: note.title,
          content: note.content
        })
      }
    }
  }

  // Show loading state
  if (shelvesLoading || notesLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Caricamento dati...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Gestione Magazzino</h1>
        <div className="header-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            <span>Mostra etichette scaffali</span>
          </label>
          <SearchBar 
            onSearch={handleSearch}
            shelves={shelves}
          />
        </div>
      </div>

      <Toolbar 
        editMode={editMode}
        setEditMode={setEditMode}
        onAddShelf={handleAddShelf}
        showNotes={showNotes}
        setShowNotes={setShowNotes}
        notesCount={notes.filter(n => !n.isRead).length}
        shelves={shelves}
        notes={notes}
        onImportData={handleImportData}
      />

      <div className="main-content">
        <WarehouseView
          shelves={shelves}
          selectedShelf={selectedShelf}
          highlightedShelves={highlightedShelves}
          onShelfClick={handleShelfClick}
          onShelfDoubleClick={handleShelfDoubleClick}
          editMode={editMode}
          onUpdateShelf={updateShelf}
          onDeleteShelf={deleteShelf}
          showLabels={showLabels}
        />

        {selectedShelf && !editMode && (
          <ContentPanel
            shelf={shelves.find(s => s.id === selectedShelf)}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onDeleteShelf={handleDeleteShelf}
            onUpdateShelf={updateShelf}
            onClose={() => setSelectedShelf(null)}
          />
        )}

        {editingDimensions && editMode && (
          <ShelfDimensionsPanel
            shelf={shelves.find(s => s.id === editingDimensions)}
            onUpdateShelf={updateShelf}
            onClose={() => setEditingDimensions(null)}
          />
        )}

        {showNotes && (
          <NotesPanel
            notes={notes}
            onAddNote={handleAddNote}
            onMarkAsRead={handleMarkAsRead}
            onClose={() => setShowNotes(false)}
          />
        )}
      </div>
    </div>
  )
}

export default App
