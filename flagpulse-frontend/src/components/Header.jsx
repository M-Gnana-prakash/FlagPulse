import React from 'react';
import { Activity, Plus, RefreshCw, Zap, Server, ShieldCheck } from 'lucide-react';

export default function Header({ isLive, isMockMode, onToggleMockMode, onRefresh, onOpenCreateModal }) {
  return (
    <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Zap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FlagPulse
              </h1>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-Time Feature Flagging & Rules Evaluation Engine
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Connection Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <span className={`pulse-dot ${isLive ? 'online' : 'mock'}`} />
            <span style={{ color: isLive ? '#34d399' : '#fbbf24', fontWeight: 500 }}>
              {isLive ? 'Spring Boot Connected' : 'Demo / Standalone Mode'}
            </span>
          </div>

          {/* Mode Switch Toggle Button */}
          <button 
            onClick={onToggleMockMode}
            className="btn btn-secondary"
            title="Toggle between real backend API and interactive browser demo state"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <Server size={14} />
            {isMockMode ? 'Switch to Live API' : 'Use Demo Mode'}
          </button>

          {/* Refresh Button */}
          <button onClick={onRefresh} className="btn-icon" title="Refresh Flag List">
            <RefreshCw size={18} />
          </button>

          {/* New Flag Button */}
          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <Plus size={18} />
            New Feature Flag
          </button>

        </div>

      </div>
    </header>
  );
}
