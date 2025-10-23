import { useState } from 'react'
import { X, Maximize2, Palette } from 'lucide-react'
import './ShelfDimensionsPanel.css'

function ShelfDimensionsPanel({ shelf, onUpdateShelf, onClose }) {
  const [dimensions, setDimensions] = useState({
    width: shelf.size[0],
    height: shelf.size[1],
    depth: shelf.size[2],
    elevation: shelf.position[1] - (shelf.size[1] / 2), // Calculate current elevation (ground offset)
    color: shelf.color || '#8B4513'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Update shelf with new dimensions
    const newSize = [
      parseFloat(dimensions.width) || 1,
      parseFloat(dimensions.height) || 2,
      parseFloat(dimensions.depth) || 0.5
    ]
    
    const elevation = parseFloat(dimensions.elevation) || 0
    
    // Calculate Y position: elevation + half height (center positioning)
    // Elevation is the distance from ground to shelf bottom
    const newPosition = [
      shelf.position[0],
      elevation + (newSize[1] / 2),  // Elevation + half of height for center positioning
      shelf.position[2]
    ]
    
    onUpdateShelf(shelf.id, { 
      size: newSize,
      position: newPosition,
      color: dimensions.color
    })
    
    onClose()
  }

  const handleChange = (field, value) => {
    setDimensions(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="dimensions-panel">
      <div className="panel-header">
        <h2>
          <Maximize2 size={20} />
          Dimensioni scaffale {shelf.name || shelf.id}
        </h2>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        <form onSubmit={handleSubmit} className="dimensions-form">
          <div className="form-group">
            <label>Larghezza (Width)</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={dimensions.width}
                onChange={(e) => handleChange('width', e.target.value)}
                min="0.1"
                step="0.1"
                required
              />
              <span className="unit">m</span>
            </div>
            <span className="help-text">Dimensione orizzontale (asse X)</span>
          </div>

          <div className="form-group">
            <label>Altezza (Height)</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => handleChange('height', e.target.value)}
                min="0.1"
                step="0.1"
                required
              />
              <span className="unit">m</span>
            </div>
            <span className="help-text">Dimensione verticale (asse Y)</span>
          </div>

          <div className="form-group">
            <label>Profondità (Depth)</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={dimensions.depth}
                onChange={(e) => handleChange('depth', e.target.value)}
                min="0.1"
                step="0.1"
                required
              />
              <span className="unit">m</span>
            </div>
            <span className="help-text">Dimensione in profondità (asse Z)</span>
          </div>

          <div className="form-group elevation-group">
            <label>Elevazione dal suolo</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={dimensions.elevation}
                onChange={(e) => handleChange('elevation', e.target.value)}
                min="0"
                step="0.1"
                required
              />
              <span className="unit">m</span>
            </div>
            <span className="help-text">Distanza dal pavimento (0 = a terra)</span>
          </div>

          <div className="form-group color-group">
            <label>
              <Palette size={16} />
              Colore scaffale
            </label>
            <div className="color-picker-container">
              <input
                type="color"
                value={dimensions.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={dimensions.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="#8B4513"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="color-text-input"
              />
              <div 
                className="color-preview" 
                style={{ backgroundColor: dimensions.color }}
                title={dimensions.color}
              />
            </div>
            <span className="help-text">Scegli un colore per lo scaffale</span>
          </div>

          <div className="dimension-preview">
            <p>Dimensioni: {dimensions.width} × {dimensions.height} × {dimensions.depth} m</p>
            <p className="elevation-preview">Elevazione: {dimensions.elevation} m dal suolo</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Applica dimensioni
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ShelfDimensionsPanel
