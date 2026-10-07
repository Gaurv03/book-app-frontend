import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthFormProps {
  onSuccess: (user: User) => void;
  onClose?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        onSuccess(res.user);
      } else {
        const res = await api.register({ email, password, full_name: fullName });
        setSuccessMsg('Account registered successfully! Logging you in...');
        setTimeout(() => {
          onSuccess(res.user);
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {onClose && (
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      )}

      <div className="auth-header">
        <div className="auth-icon-badge">
          {isLogin ? <LogIn size={24} color="#6366f1" /> : <UserPlus size={24} color="#6366f1" />}
        </div>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Sign in to access your saved favorites and reading history'
            : 'Join our online bookstore to curate your reading journey'}
        </p>
      </div>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${isLogin ? 'active' : ''}`}
          onClick={() => {
            setIsLogin(true);
            setError(null);
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
          onClick={() => {
            setIsLogin(false);
            setError(null);
          }}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="auth-alert error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-alert success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-fields">
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Isaac Asimov"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={!isLogin}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="reader@bookstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : isLogin ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
            >
              Sign up now
            </button>
          </p>
        ) : (
          <p>
            Already registered?{' '}
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
