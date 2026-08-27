import React, { useState } from 'react';
import { Search, Filter, Copy, Check, Sliders, ChevronDown, ChevronUp, Play, Trash2, ArrowUpRight } from 'lucide-react';

export default function FlagList({ flags, onToggleFlag, onSelectForEvaluation, onSelectForSdk }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedKeys, setExpandedKeys] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const toggleExpand = (key) => {
    setExpandedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredFlags = flags.filter(flag => {
    const isEnabled = flag.enabled || flag.isEnabled;
    const matchesSearch = flag.flagKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flag.description && flag.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'ENABLED') return matchesSearch && isEnabled;
    if (filterStatus === 'DISABLED') return matchesSearch && !isEnabled;
    return matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      {/* List Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search feature flags by key or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>

        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {['ALL', 'ENABLED', 'DISABLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: filterStatus === st ? '#818cf8' : 'var(--text-muted)',
                border: filterStatus === st ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Flag Directory Cards */}
      {filteredFlags.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Sliders size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Feature Flags Found</h3>
          <p style={{ fontSize: '0.85rem' }}>Try adjusting your search criteria or create a new flag.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredFlags.map((flag) => {
            const isEnabled = flag.enabled || flag.isEnabled;
            const isExpanded = expandedKeys[flag.flagKey];
            const rules = flag.rules || [];

            return (
              <div
                key={flag.id || flag.flagKey}
                style={{
                  background: 'rgba(13, 20, 36, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1.25rem',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  {/* Left Info */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span className={`badge ${isEnabled ? 'badge-active' : 'badge-disabled'}`}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <h3 className="input-mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {flag.flagKey}
                      </h3>
                      <button
                        onClick={() => handleCopy(flag.flagKey)}
                        className="btn-icon"
                        title="Copy Flag Key"
                        style={{ padding: '0.2rem' }}
                      >
                        {copiedKey === flag.flagKey ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {flag.description || 'No description provided.'}
                    </p>

                    {/* Rules Pill Summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Targeting Rules: <strong>{rules.length}</strong>
                      </span>
                      {rules.length > 0 && (
                        <button
                          onClick={() => toggleExpand(flag.flagKey)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          {isExpanded ? 'Hide rules' : 'View rules'}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    
                    {/* Test Simulator Button */}
                    <button
                      onClick={() => onSelectForEvaluation(flag.flagKey)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      title="Test in Simulator"
                    >
                      <Play size={14} color="#10b981" />
                      Test
                    </button>

                    {/* SDK Snippet Button */}
                    <button
                      onClick={() => onSelectForSdk(flag)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      title="Generate Code Snippet"
                    >
                      <ArrowUpRight size={14} color="#818cf8" />
                      SDK
                    </button>

                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => onToggleFlag(flag.flagKey, e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                  </div>

                </div>

                {/* Expanded Rules Section */}
                {isExpanded && rules.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px dashed var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rule Set (ALL rules must match for evaluation TRUE)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                      {rules.map((rule, idx) => (
                        <div
                          key={rule.id || idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span className="input-mono" style={{ color: '#f8fafc', fontWeight: 500 }}>
                            {rule.attributeName}
                          </span>
                          <span className="badge badge-operator">
                            {rule.operator}
                          </span>
                          <span className="input-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                            "{rule.targetValue}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
