import React from 'react';
import { BookOpen, Heart, CheckCircle, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  favoriteCount: number;
  readCount: number;
  onLogout: () => void;
  onOpenAuth: () => void;
  activeFilter: 'all' | 'favorites' | 'read';
  onSelectFilter: (filter: 'all' | 'favorites' | 'read') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  favoriteCount,
  readCount,
  onLogout,
  onOpenAuth,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo" onClick={() => onSelectFilter('all')}>
          <div className="logo-icon">
            <BookOpen size={22} color="#6366f1" />
          </div>
          <div className="logo-text">
            <span className="brand-name">NOVELA</span>
            <span className="brand-sub">Bookstore</span>
          </div>
        </div>

        {user ? (
          <div className="header-actions">
            <div className="nav-badges">
              <button
                className={`badge-btn ${activeFilter === 'favorites' ? 'active-fav' : ''}`}
                onClick={() => onSelectFilter(activeFilter === 'favorites' ? 'all' : 'favorites')}
                title="View Favorites"
              >
                <Heart size={16} className="badge-icon-fav" fill={activeFilter === 'favorites' ? '#f43f5e' : 'none'} />
                <span>Favorites</span>
                <span className="counter-pill">{favoriteCount}</span>
              </button>

              <button
                className={`badge-btn ${activeFilter === 'read' ? 'active-read' : ''}`}
                onClick={() => onSelectFilter(activeFilter === 'read' ? 'all' : 'read')}
                title="View Finished Books"
              >
                <CheckCircle size={16} className="badge-icon-read" fill={activeFilter === 'read' ? '#10b981' : 'none'} />
                <span>Read</span>
                <span className="counter-pill">{readCount}</span>
              </button>
            </div>

            <div className="user-profile">
              <div className="user-avatar" title={user.email}>
                <UserIcon size={16} />
              </div>
              <span className="user-name">
                {user.full_name || user.email.split('@')[0]}
              </span>
              <button className="logout-btn" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button className="signin-btn" onClick={onOpenAuth}>
            <UserIcon size={16} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
