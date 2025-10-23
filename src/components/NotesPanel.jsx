import { useState } from 'react'
import { StickyNote, Plus, X, Check, History, Calendar } from 'lucide-react'
import './NotesPanel.css'

function NotesPanel({ notes, onAddNote, onMarkAsRead, onClose }) {
  const [isAdding, setIsAdding] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '' })

  const activeNotes = notes.filter(note => !note.isRead)
  const readNotes = notes.filter(note => note.isRead)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) return

    onAddNote({
      title: formData.title.trim(),
      content: formData.content.trim()
    })

    setFormData({ title: '', content: '' })
    setIsAdding(false)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setFormData({ title: '', content: '' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <h2>
          <StickyNote size={20} />
          Note
        </h2>
        <div className="header-actions">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`history-btn ${showHistory ? 'active' : ''}`}
            title="Storico note"
          >
            <History size={18} />
            <span className="btn-text">{showHistory ? 'Note attive' : 'Storico'}</span>
          </button>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
            <span className="btn-text">Chiudi</span>
          </button>
        </div>
      </div>

      <div className="notes-content">
        {showHistory ? (
          /* History View */
          <div className="history-view">
            <h3>Storico note lette</h3>
            {readNotes.length > 0 ? (
              <div className="history-list">
                {readNotes.map(note => (
                  <div key={note.id} className="history-note">
                    <div className="history-note-header">
                      <h4>{note.title}</h4>
                      <span className="history-date">
                        <Calendar size={14} />
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p>{note.content}</p>
                    {note.readAt && (
                      <span className="read-date">
                        Letta il: {formatDate(note.readAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <History size={48} />
                <p>Nessuna nota nello storico</p>
              </div>
            )}
          </div>
        ) : (
          /* Active Notes View */
          <>
            {/* Add Note Button */}
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="add-note-btn">
                <Plus size={20} />
                <span>Aggiungi nota</span>
              </button>
            )}

            {/* Add Note Form */}
            {isAdding && (
              <form onSubmit={handleSubmit} className="note-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titolo nota"
                    required
                    autoFocus
                    className="note-title-input"
                  />
                </div>
                <div className="form-group">
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Contenuto della nota..."
                    required
                    rows="4"
                    className="note-content-input"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Crea nota
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-secondary">
                    Annulla
                  </button>
                </div>
              </form>
            )}

            {/* Active Notes List */}
            <div className="active-notes">
              {activeNotes.length > 0 ? (
                activeNotes.map(note => (
                  <div key={note.id} className="sticky-note">
                    <div className="sticky-note-header">
                      <h4>{note.title}</h4>
                      <span className="note-date">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="sticky-note-content">{note.content}</p>
                    <button
                      onClick={() => onMarkAsRead(note.id)}
                      className="mark-read-btn"
                    >
                      <Check size={16} />
                      Segna come letta
                    </button>
                  </div>
                ))
              ) : (
                !isAdding && (
                  <div className="empty-notes">
                    <StickyNote size={48} />
                    <p>Nessuna nota attiva</p>
                    <p className="empty-subtitle">Clicca "Aggiungi nota" per iniziare</p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NotesPanel
