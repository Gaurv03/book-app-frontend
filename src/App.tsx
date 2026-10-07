import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { BookCard } from './components/BookCard';
import { BookListItem } from './components/BookListItem';
import { Pagination } from './components/Pagination';
import { AuthForm } from './components/AuthForm';
import { api } from './services/api';
import type { Book, Category, User } from './types';
import { BookX } from 'lucide-react';
import './App.css';

export function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- Category & Books State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // --- View Mode & Layout ---
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'read'>('all');
  const [viewLayout, setViewLayout] = useState<'tiles' | 'list'>('tiles');

  // --- User Favorite & Read Tracking Sets for fast O(1) checks ---
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<number>>(new Set());
  const [readBookIds, setReadBookIds] = useState<Set<number>>(new Set());

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch {
        // Not authenticated
        setUser(null);
      }
    };
    initAuth();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch user favorites and read list when user logs in
  const refreshUserInteractions = useCallback(async () => {
    if (!user) {
      setFavoriteBookIds(new Set());
      setReadBookIds(new Set());
      return;
    }
    try {
      const [favs, reads] = await Promise.all([
        api.getFavorites(0, 500),
        api.getReadBooks(0, 500),
      ]);
      setFavoriteBookIds(new Set(favs.map((f) => f.book_id)));
      setReadBookIds(new Set(reads.map((r) => r.book_id)));
    } catch (err) {
      console.error('Failed to load user interactions:', err);
    }
  }, [user]);

  useEffect(() => {
    refreshUserInteractions();
  }, [refreshUserInteractions]);

  // Main book fetching logic
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      if (activeFilter === 'favorites') {
        if (!user) {
          setBooks([]);
          setTotalBooks(0);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        const favs = await api.getFavorites((currentPage - 1) * 20, 20);
        let items = favs.map((f) => ({
          ...f.book,
          is_favorite: true,
          is_read: readBookIds.has(f.book_id),
        }));
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter(
            (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
          );
        }
        setBooks(items);
        setTotalBooks(items.length);
        setTotalPages(1);
      } else if (activeFilter === 'read') {
        if (!user) {
          setBooks([]);
          setTotalBooks(0);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        const reads = await api.getReadBooks((currentPage - 1) * 20, 20);
        let items = reads.map((r) => ({
          ...r.book,
          is_favorite: favoriteBookIds.has(r.book_id),
          is_read: true,
        }));
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter(
            (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
          );
        }
        setBooks(items);
        setTotalBooks(items.length);
        setTotalPages(1);
      } else {
        // 'all' catalog view
        let res;
        if (selectedCategoryId) {
          res = await api.getBooksByCategory(selectedCategoryId, currentPage, 20);
        } else {
          res = await api.getBooks(currentPage, 20, searchQuery);
        }
        setBooks(res.items);
        setTotalBooks(res.total);
        setTotalPages(res.total_pages);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      setBooks([]);
      setTotalBooks(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedCategoryId, currentPage, searchQuery, user, favoriteBookIds, readBookIds]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Reset page to 1 when changing filters or search
  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSelectFilter = (filter: 'all' | 'favorites' | 'read') => {
    setActiveFilter(filter);
    setCurrentPage(1);
    if ((filter === 'favorites' || filter === 'read') && !user) {
      setShowAuthModal(true);
    }
  };

  // Toggle Favorite Handler
  const handleToggleFavorite = async (bookId: number) => {
    const isCurrentlyFav = favoriteBookIds.has(bookId);
    // Optimistic state update
    const updated = new Set(favoriteBookIds);
    if (isCurrentlyFav) {
      updated.delete(bookId);
    } else {
      updated.add(bookId);
    }
    setFavoriteBookIds(updated);

    try {
      if (isCurrentlyFav) {
        await api.removeFavorite(bookId);
      } else {
        await api.addFavorite(bookId);
      }
    } catch (err) {
      console.error('Failed to update favorite:', err);
      // Rollback on error
      setFavoriteBookIds(favoriteBookIds);
    }
  };

  // Toggle Read Handler
  const handleToggleRead = async (bookId: number) => {
    const isCurrentlyRead = readBookIds.has(bookId);
    // Optimistic state update
    const updated = new Set(readBookIds);
    if (isCurrentlyRead) {
      updated.delete(bookId);
    } else {
      updated.add(bookId);
    }
    setReadBookIds(updated);

    try {
      if (isCurrentlyRead) {
        await api.unmarkAsRead(bookId);
      } else {
        await api.markAsRead(bookId);
      }
    } catch (err) {
      console.error('Failed to update read status:', err);
      // Rollback on error
      setReadBookIds(readBookIds);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setFavoriteBookIds(new Set());
    setReadBookIds(new Set());
    if (activeFilter !== 'all') {
      setActiveFilter('all');
    }
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <Header
        user={user}
        favoriteCount={favoriteBookIds.size}
        readCount={readBookIds.size}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        activeFilter={activeFilter}
        onSelectFilter={handleSelectFilter}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="container">
          {/* Filtering, Search & Layout Controls */}
          <FilterBar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            viewLayout={viewLayout}
            onToggleLayout={setViewLayout}
            activeFilter={activeFilter}
            onSelectFilter={handleSelectFilter}
            totalResults={totalBooks}
          />

          {/* Book Catalog Render */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Fetching curated literature...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <BookX size={28} />
              </div>
              <h3>No books found</h3>
              <p>
                {activeFilter === 'favorites'
                  ? 'You haven’t added any books to your favorites yet. Explore the catalog and click the heart icon!'
                  : activeFilter === 'read'
                  ? 'You haven’t marked any books as read yet. Mark books as finished as you complete them!'
                  : 'No titles match your current search or category filter. Try clearing your filters.'}
              </p>
            </div>
          ) : viewLayout === 'tiles' ? (
            <div className="books-grid">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={favoriteBookIds.has(book.id)}
                  isRead={readBookIds.has(book.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleRead={handleToggleRead}
                  isLoggedIn={!!user}
                  onRequireLogin={() => setShowAuthModal(true)}
                />
              ))}
            </div>
          ) : (
            <div className="books-list">
              {books.map((book) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  isFavorite={favoriteBookIds.has(book.id)}
                  isRead={readBookIds.has(book.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleRead={handleToggleRead}
                  isLoggedIn={!!user}
                  onRequireLogin={() => setShowAuthModal(true)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {activeFilter === 'all' && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </div>
      </main>

      {/* Auth Modal Backdrop */}
      {showAuthModal && (
        <div className="auth-backdrop" onClick={() => setShowAuthModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AuthForm
              onSuccess={(newUser) => {
                setUser(newUser);
                setShowAuthModal(false);
              }}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
