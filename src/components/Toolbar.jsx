import { Plus, Move, Eye, StickyNote } from 'lucide-react'
import DataManager from './DataManager'
import './Toolbar.css'

function Toolbar({ editMode, setEditMode, onAddShelf, showNotes, setShowNotes, notesCount, shelves, notes, onImportData }) {
  return (
    <div className="toolbar">
      <button
        className={`toolbar-btn ${editMode ? 'active' : ''}`}
        onClick={() => setEditMode(!editMode)}
        title={editMode ? 'Esci dalla modalità modifica' : 'Entra in modalità modifica'}
      >
        {editMode ? <Eye size={20} /> : <Move size={20} />}
        <span>{editMode ? 'Modalità visualizzazione' : 'Modalità modifica'}</span>
      </button>

      <button
        className="toolbar-btn"
        onClick={onAddShelf}
        title="Aggiungi nuovo scaffale"
      >
        <Plus size={20} />
        <span>Aggiungi scaffale</span>
      </button>

      <button
        className={`toolbar-btn notes-btn ${showNotes ? 'active' : ''}`}
        onClick={() => setShowNotes(!showNotes)}
        title="Note e annunci"
      >
        <StickyNote size={20} />
        <span>Note</span>
        {notesCount > 0 && <span className="notes-badge">{notesCount}</span>}
      </button>

      <div className="toolbar-divider"></div>

      <DataManager shelves={shelves} notes={notes} onImportData={onImportData} />

      {editMode && (
        <div className="edit-instructions">
          <span>📝 Trascina gli scaffali per spostarli | Doppio-click per modificare dimensioni</span>
        </div>
      )}
    </div>
  )
}

export default Toolbar
