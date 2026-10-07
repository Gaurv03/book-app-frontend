import React from 'react';
import { Star, Heart, CheckCircle, Calendar } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  isRead: boolean;
  onToggleFavorite: (bookId: number) => void;
  onToggleRead: (bookId: number) => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isFavorite,
  isRead,
  onToggleFavorite,
  onToggleRead,
  isLoggedIn,
  onRequireLogin,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    onToggleFavorite(book.id);
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    onToggleRead(book.id);
  };

  return (
    <div className={`book-card ${isRead ? 'book-card-read' : ''}`}>
      {/* Top Meta: Category & Rating */}
      <div className="card-top-row">
        <span className="category-pill">
          {book.category?.name || 'Fiction'}
        </span>
        <div className="rating-badge" title={`Rating: ${book.rating} / 5`}>
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{book.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Book Title & Author */}
      <div className="card-main">
        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-author">by {book.author}</p>
        
        {book.description && (
          <p className="book-desc" title={book.description}>
            {book.description}
          </p>
        )}
      </div>

      {/* Card Footer: Year & Interaction Buttons */}
      <div className="card-footer">
        <div className="book-year">
          {book.published_year ? (
            <>
              <Calendar size={13} />
              <span>{book.published_year}</span>
            </>
          ) : (
            <span />
          )}
        </div>

        <div className="card-action-btns">
          <button
            className={`action-btn fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle Favorite"
          >
            <Heart size={16} fill={isFavorite ? '#f43f5e' : 'none'} />
          </button>

          <button
            className={`action-btn read-btn ${isRead ? 'active' : ''}`}
            onClick={handleReadClick}
            title={isRead ? 'Mark as unread' : 'Mark as read'}
            aria-label="Toggle Read"
          >
            <CheckCircle size={16} fill={isRead ? '#10b981' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};
