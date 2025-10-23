import { useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Shelf from './Shelf'
import './WarehouseView.css'

// Camera controller component
function CameraController({ editMode }) {
  const { camera, controls } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    if (editMode) {
      // Snap to top-down view
      camera.position.set(0, 15, 0)
      camera.lookAt(0, 0, 0)
      if (controls) {
        controls.target.set(0, 0, 0)
        controls.update()
      }
    }
  }, [editMode, camera, controls])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={!editMode}
      minDistance={5}
      maxDistance={30}
      mouseButtons={editMode ? {
        LEFT: null, // In edit mode, disable left button
        MIDDLE: 1,
        RIGHT: 2 // Right click pans
      } : {
        LEFT: 0, // In view mode, left click rotates
        MIDDLE: 1,
        RIGHT: 2 // Right click pans
      }}
    />
  )
}

function WarehouseView({ 
  shelves, 
  selectedShelf, 
  highlightedShelves,
  onShelfClick,
  onShelfDoubleClick,
  editMode,
  onUpdateShelf,
  onDeleteShelf,
  showLabels
}) {
  return (
    <div className="warehouse-view">
      <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
        {/* White background */}
        <color attach="background" args={['#ffffff']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />

        {/* Grid floor */}
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5}
          cellColor="#1a1a1a"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#000000"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />

        {/* Shelves */}
        {shelves.map(shelf => (
          <Shelf
            key={shelf.id}
            shelf={shelf}
            allShelves={shelves}
            isSelected={selectedShelf === shelf.id}
            isHighlighted={highlightedShelves.includes(shelf.id)}
            onClick={() => onShelfClick(shelf.id)}
            onDoubleClick={() => onShelfDoubleClick(shelf.id)}
            editMode={editMode}
            onUpdate={onUpdateShelf}
            onDelete={onDeleteShelf}
            showLabels={showLabels}
          />
        ))}

        {/* Camera controls */}
        <CameraController editMode={editMode} />
      </Canvas>

      <div className="view-controls">
        <div className="help-text">
          {editMode ? (
            <p>📐 Vista dall'alto | Click sinistro + Trascina: Sposta scaffali | Click destro: Sposta visuale | Rotella: Zoom</p>
          ) : (
            <p>🖱️ Click sinistro: Ruota | Click destro: Sposta visuale | Rotella: Zoom</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WarehouseView
