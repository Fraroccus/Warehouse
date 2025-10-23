import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import './SearchBar.css'

function SearchBar({ onSearch, shelves }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  // Get all unique item names from all shelves
  const getAllItems = () => {
    const items = []
    shelves.forEach(shelf => {
      shelf.items?.forEach(item => {
        if (!items.find(i => i.name.toLowerCase() === item.name.toLowerCase())) {
          items.push(item)
        }
      })
    })
    return items
  }

  // Update suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const allItems = getAllItems()
      const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query, shelves])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  const handleSuggestionClick = (itemName) => {
    setQuery(itemName)
    onSearch(itemName)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Cerca articoli nel magazzino..."
          className="search-input"
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {query && (
          <button onClick={handleClear} className="clear-btn">
            <X size={18} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(item.name)}
            >
              <Search size={14} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
