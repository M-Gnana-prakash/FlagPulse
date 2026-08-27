import React from 'react';
import { Activity, Radio, ToggleLeft, PlusCircle, Zap, Trash2 } from 'lucide-react';

export default function ActivityLog({ events, onClearEvents }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.5rem', borderRadius: '8px', color: '#f59e0b' }}>
            <Radio size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Real-Time Pulse Stream</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live audit events & STOMP / WebSocket broadcast messages
            </p>
          </div>
        </div>

        {events.length > 0 && (
          <button onClick={onClearEvents} className="btn-icon" title="Clear Event Logs">
            <Trash2 size={16} color="#fb7185" />
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <Activity size={36} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
          <div>No activity events logged yet.</div>
          <div>Toggle a flag or perform an evaluation to see live pulse streams.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto' }}>
          {events.map((evt, idx) => {
            let icon = <Activity size={16} color="#6366f1" />;
            let badgeColor = 'rgba(99, 102, 241, 0.2)';

            if (evt.type === 'TOGGLE') {
              icon = <ToggleLeft size={16} color={evt.enabled ? '#10b981' : '#f43f5e'} />;
              badgeColor = evt.enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
            } else if (evt.type === 'CREATE') {
              icon = <PlusCircle size={16} color="#38bdf8" />;
              badgeColor = 'rgba(56, 189, 248, 0.2)';
            } else if (evt.type === 'EVALUATE') {
              icon = <Zap size={16} color="#a855f7" />;
              badgeColor = 'rgba(168, 85, 247, 0.2)';
            }

            return (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: badgeColor, padding: '0.4rem', borderRadius: '6px', display: 'flex' }}>
                    {icon}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{evt.title}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      {evt.details}
                    </span>
                  </div>
                </div>

                <div className="input-mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {evt.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
