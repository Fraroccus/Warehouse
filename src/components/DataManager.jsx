import { Download, Upload } from 'lucide-react'
import './DataManager.css'

function DataManager({ shelves, notes, onImportData }) {
  const handleExport = () => {
    const data = {
      shelves,
      notes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `magazzino-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (window.confirm('Importare questi dati? Questo sovrascriverà tutti i dati attuali.')) {
          onImportData(data)
          alert('Dati importati con successo!')
        }
      } catch (error) {
        alert('Errore durante l\'importazione del file. Assicurati che sia un file di backup valido.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    
    // Reset input so same file can be imported again
    event.target.value = ''
  }

  return (
    <div className="data-manager">
      <button onClick={handleExport} className="data-btn export-btn" title="Esporta dati">
        <Download size={18} />
        <span>Esporta</span>
      </button>
      
      <label className="data-btn import-btn" title="Importa dati">
        <Upload size={18} />
        <span>Importa</span>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}

export default DataManager
