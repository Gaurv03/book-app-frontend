import React from 'react';
import { Star, Heart, CheckCircle, Calendar } from 'lucide-react';
import type { Book } from '../types';

interface BookListItemProps {
  book: Book;
  isFavorite: boolean;
  isRead: boolean;
  onToggleFavorite: (bookId: number) => void;
  onToggleRead: (bookId: number) => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
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
    <div className={`book-list-row ${isRead ? 'book-row-read' : ''}`}>
      {/* Category Pill */}
      <div className="list-col-cat">
        <span className="category-pill">
          {book.category?.name || 'Fiction'}
        </span>
      </div>

      {/* Title & Author */}
      <div className="list-col-info">
        <h4 className="list-book-title">{book.title}</h4>
        <span className="list-book-author">by {book.author}</span>
      </div>

      {/* Year */}
      <div className="list-col-year">
        {book.published_year ? (
          <span className="year-tag">
            <Calendar size={13} /> {book.published_year}
          </span>
        ) : (
          <span className="year-tag">—</span>
        )}
      </div>

      {/* Rating */}
      <div className="list-col-rating">
        <div className="rating-badge" title={`Rating: ${book.rating} / 5`}>
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{book.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="list-col-actions">
        <button
          className={`action-btn fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label="Toggle Favorite"
        >
          <Heart size={16} fill={isFavorite ? '#f43f5e' : 'none'} />
          <span className="action-text">{isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>

        <button
          className={`action-btn read-btn ${isRead ? 'active' : ''}`}
          onClick={handleReadClick}
          title={isRead ? 'Mark as unread' : 'Mark as read'}
          aria-label="Toggle Read"
        >
          <CheckCircle size={16} fill={isRead ? '#10b981' : 'none'} />
          <span className="action-text">{isRead ? 'Read' : 'Mark Read'}</span>
        </button>
      </div>
    </div>
  );
};
