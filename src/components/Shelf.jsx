import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function Shelf({ shelf, allShelves, isSelected, isHighlighted, onClick, onDoubleClick, editMode, onUpdate, onDelete, showLabels }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { gl, camera } = useThree()

  // Global pointer move handler for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalPointerMove = (e) => {
      if (!isDragging) return

      // Calculate position from screen coordinates
      const canvas = gl.domElement
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      // Raycast to find intersection with ground plane
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
      
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(groundPlane, intersection)

      if (intersection) {
        let newX = intersection.x
        let newZ = intersection.z
        const currentY = shelf.position[1]

        // Snapping logic: check for nearby shelves with matching dimensions
        const SNAP_DISTANCE = 0.5 // Distance threshold for snapping
        const [currentWidth, currentHeight, currentDepth] = shelf.size

        // Find other shelves (exclude current shelf)
        const otherShelves = allShelves?.filter(s => s.id !== shelf.id) || []

        for (const otherShelf of otherShelves) {
          const [otherWidth, otherHeight, otherDepth] = otherShelf.size

          // Check if dimensions match (width and depth)
          if (Math.abs(currentWidth - otherWidth) < 0.01 && 
              Math.abs(currentDepth - otherDepth) < 0.01) {
            
            const [otherX, otherY, otherZ] = otherShelf.position
            const distanceX = Math.abs(newX - otherX)
            const distanceZ = Math.abs(newZ - otherZ)

            // Snap to X position if close enough
            if (distanceX < SNAP_DISTANCE) {
              newX = otherX
            }

            // Snap to Z position if close enough
            if (distanceZ < SNAP_DISTANCE) {
              newZ = otherZ
            }
          }
        }

        const newPosition = [newX, currentY, newZ]
        onUpdate(shelf.id, { position: newPosition })
      }
    }

    const handleGlobalPointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handleGlobalPointerMove)
    window.addEventListener('pointerup', handleGlobalPointerUp)

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      window.removeEventListener('pointerup', handleGlobalPointerUp)
    }
  }, [isDragging, shelf.id, shelf.position, shelf.size, allShelves, onUpdate, gl, camera])

  // Animate highlighted shelves
  useFrame((state) => {
    if (isHighlighted && meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2
    }
  })

  const handlePointerDown = (e) => {
    if (!editMode) {
      // In view mode, don't stop propagation to allow camera controls
      return
    }

    // In edit mode, capture the event for dragging
    e.stopPropagation()
    setIsDragging(true)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e) => {
    if (!editMode) {
      e.stopPropagation()
      onClick()
    }
  }

  const handleDoubleClick = (e) => {
    if (editMode) {
      e.stopPropagation()
      onDoubleClick()
    }
  }

  const getColor = () => {
    if (isHighlighted) return '#FFD700' // Gold for search results
    if (isSelected) return '#4CAF50' // Green for selected
    if (hovered) return '#D2691E' // Lighter brown for hover
    return shelf.color || '#8B4513' // Default brown
  }

  const itemCount = shelf.items?.length || 0

  return (
    <group position={shelf.position}>
      {/* Main shelf box */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={shelf.size} />
        <meshStandardMaterial
          color={getColor()}
          emissive={isHighlighted ? '#FFD700' : (isSelected ? '#4CAF50' : '#000000')}
          emissiveIntensity={isHighlighted ? 0.5 : (isSelected ? 0.3 : 0)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Shelf label */}
      {showLabels && (
        <>
          <Text
            position={[0, shelf.size[1] / 2 + 0.3, shelf.size[2] / 2 + 0.01]}
            fontSize={0.2}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {`Scaffale ${shelf.name || shelf.id}`}
          </Text>

          {/* Item count badge */}
          {itemCount > 0 && (
            <Text
              position={[0, -shelf.size[1] / 2 - 0.2, shelf.size[2] / 2 + 0.01]}
              fontSize={0.15}
              color="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {`${itemCount} articol${itemCount !== 1 ? 'i' : 'o'}`}
            </Text>
          )}
        </>
      )}
    </group>
  )
}

export default Shelf
