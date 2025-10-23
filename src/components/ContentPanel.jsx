import { useState } from 'react'
import { X, Plus, Edit2, Trash2, Package, AlertTriangle, Tag } from 'lucide-react'
import './ContentPanel.css'

function ContentPanel({ shelf, onAddItem, onUpdateItem, onDeleteItem, onDeleteShelf, onUpdateShelf, onClose }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', quantity: 1 })
  const [isRenamingShelf, setIsRenamingShelf] = useState(false)
  const [shelfName, setShelfName] = useState(shelf.name || shelf.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    if (editingItem) {
      onUpdateItem(shelf.id, editingItem.id, formData)
      setEditingItem(null)
    } else {
      onAddItem(shelf.id, formData)
      setIsAdding(false)
    }

    setFormData({ name: '', quantity: 1 })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ name: item.name, quantity: item.quantity })
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingItem(null)
    setFormData({ name: '', quantity: 1 })
  }

  const handleDelete = (itemId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo articolo?')) {
      onDeleteItem(shelf.id, itemId)
    }
  }

  const handleDeleteShelf = () => {
    if (window.confirm('Sei sicuro di voler eliminare questo scaffale e tutti i suoi articoli?')) {
      onDeleteShelf(shelf.id)
      onClose()
    }
  }

  const handleRenameShelf = (e) => {
    e.preventDefault()
    if (shelfName.trim()) {
      onUpdateShelf(shelf.id, { name: shelfName.trim() })
      setIsRenamingShelf(false)
    }
  }

  return (
    <div className="content-panel">
      <div className="panel-header">
        {isRenamingShelf ? (
          <form onSubmit={handleRenameShelf} className="rename-form">
            <input
              type="text"
              value={shelfName}
              onChange={(e) => setShelfName(e.target.value)}
              className="rename-input"
              autoFocus
              onBlur={() => setIsRenamingShelf(false)}
            />
          </form>
        ) : (
          <h2>
            Scaffale {shelf.name || shelf.id} - Contenuti
            <button 
              onClick={() => setIsRenamingShelf(true)} 
              className="rename-btn"
              title="Rinomina scaffale"
            >
              <Tag size={16} />
            </button>
          </h2>
        )}
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        {/* Items list */}
        <div className="items-list">
          {shelf.items && shelf.items.length > 0 ? (
            shelf.items.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-icon">
                  <Package size={20} />
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>Quantità: {item.quantity}</p>
                </div>
                <div className="item-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="action-btn edit"
                    title="Modifica"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="action-btn delete"
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Package size={48} />
              <p>Nessun articolo in questo scaffale</p>
              <p className="empty-subtitle">Clicca "Aggiungi articolo" per iniziare</p>
            </div>
          )}
        </div>

        {/* Add/Edit form */}
        {isAdding ? (
          <form onSubmit={handleSubmit} className="item-form">
            <h3>{editingItem ? 'Modifica articolo' : 'Aggiungi nuovo articolo'}</h3>
            <div className="form-group">
              <label>Nome articolo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Inserisci nome articolo"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Quantità</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Annulla
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="add-item-btn">
            <Plus size={20} />
            <span>Aggiungi articolo</span>
          </button>
        )}

        {/* Delete shelf button */}
        <button onClick={handleDeleteShelf} className="delete-shelf-btn">
          <AlertTriangle size={18} />
          <span>Rimuovi scaffale</span>
        </button>
      </div>
    </div>
  )
}

export default ContentPanel
