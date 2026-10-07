import React from 'react';
import { Search, LayoutGrid, List, X, Layers } from 'lucide-react';
import type { Category } from '../types';

interface FilterBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  viewLayout: 'tiles' | 'list';
  onToggleLayout: (layout: 'tiles' | 'list') => void;
  activeFilter: 'all' | 'favorites' | 'read';
  onSelectFilter: (filter: 'all' | 'favorites' | 'read') => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  viewLayout,
  onToggleLayout,
  activeFilter,
  onSelectFilter,
  totalResults,
}) => {
  return (
    <div className="filter-section">
      {/* Top Filter Bar: Search, View Mode Tabs, and Layout Switch */}
      <div className="filter-controls-row">
        {/* Search Input */}
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by book title or author..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Mode Switcher (All / Favorites / Read) */}
        <div className="view-mode-tabs">
          <button
            className={`view-mode-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onSelectFilter('all')}
          >
            All Books
          </button>
          <button
            className={`view-mode-btn ${activeFilter === 'favorites' ? 'active' : ''}`}
            onClick={() => onSelectFilter('favorites')}
          >
            Favorites
          </button>
          <button
            className={`view-mode-btn ${activeFilter === 'read' ? 'active' : ''}`}
            onClick={() => onSelectFilter('read')}
          >
            Read
          </button>
        </div>

        {/* Tiles vs List Layout Toggle */}
        <div className="layout-toggle-group">
          <button
            className={`layout-btn ${viewLayout === 'tiles' ? 'active' : ''}`}
            onClick={() => onToggleLayout('tiles')}
            title="Tile / Grid View"
            aria-label="Tile View"
          >
            <LayoutGrid size={18} />
            <span className="layout-label">Tiles</span>
          </button>
          <button
            className={`layout-btn ${viewLayout === 'list' ? 'active' : ''}`}
            onClick={() => onToggleLayout('list')}
            title="List View"
            aria-label="List View"
          >
            <List size={18} />
            <span className="layout-label">List</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      {activeFilter === 'all' && (
        <div className="categories-filter-bar">
          <div className="categories-label">
            <Layers size={14} />
            <span>Categories:</span>
          </div>
          <div className="category-chips">
            <button
              className={`category-chip ${selectedCategoryId === null ? 'active' : ''}`}
              onClick={() => onSelectCategory(null)}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-chip ${selectedCategoryId === cat.id ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header summary */}
      <div className="results-summary">
        <span className="results-count">
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'book' : 'books'}
          {selectedCategoryId && categories.find((c) => c.id === selectedCategoryId) && (
            <> in <em>{categories.find((c) => c.id === selectedCategoryId)?.name}</em></>
          )}
          {activeFilter === 'favorites' && ' (Favorites)'}
          {activeFilter === 'read' && ' (Finished Reading)'}
        </span>
      </div>
    </div>
  );
};
