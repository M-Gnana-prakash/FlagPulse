import React, { useState, useEffect } from 'react';
import { Play, Zap, Clock, ShieldAlert, CheckCircle, XCircle, Code, Plus, Trash2 } from 'lucide-react';
import { evaluateFlagApi } from '../services/api';

export default function EvaluationSimulator({ flags, selectedFlagKey, isMockMode, onEvaluationComplete }) {
  const [currentFlagKey, setCurrentFlagKey] = useState(selectedFlagKey || (flags[0] ? flags[0].flagKey : ''));
  const [contextAttributes, setContextAttributes] = useState([
    { key: 'userId', value: 'usr_9482' },
    { key: 'country', value: 'US' },
    { key: 'userAge', value: '24' }
  ]);
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFlagKey) {
      setCurrentFlagKey(selectedFlagKey);
    } else if (!currentFlagKey && flags.length > 0) {
      setCurrentFlagKey(flags[0].flagKey);
    }
  }, [selectedFlagKey, flags]);

  const activeFlagObj = flags.find(f => f.flagKey === currentFlagKey);

  const handleAddAttribute = () => {
    setContextAttributes([...contextAttributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (idx) => {
    setContextAttributes(contextAttributes.filter((_, i) => i !== idx));
  };

  const handleAttributeChange = (idx, field, val) => {
    const updated = [...contextAttributes];
    updated[idx][field] = val;
    setContextAttributes(updated);
  };

  const handleRunEvaluation = async () => {
    if (!currentFlagKey) return;
    setLoading(true);

    const contextMap = {};
    contextAttributes.forEach(attr => {
      if (attr.key.trim()) {
        contextMap[attr.key.trim()] = attr.value;
      }
    });

    try {
      const res = await evaluateFlagApi(currentFlagKey, contextMap, isMockMode);
      setEvalResult(res);
      if (onEvaluationComplete && res.executionTimeMs !== undefined) {
        onEvaluationComplete(res);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '8px', color: '#10b981' }}>
          <Zap size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Live Flag Evaluation Playground</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Simulate real-time flag evaluation rules against custom user contexts
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Form Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Target Flag Selector */}
          <div className="form-group">
            <label className="form-label">Select Feature Flag</label>
            <select
              className="input input-mono"
              value={currentFlagKey}
              onChange={(e) => {
                setCurrentFlagKey(e.target.value);
                setEvalResult(null);
              }}
            >
              {flags.map(f => (
                <option key={f.flagKey} value={f.flagKey}>
                  {f.flagKey} ({(f.enabled || f.isEnabled) ? 'Enabled' : 'Disabled'})
                </option>
              ))}
            </select>
          </div>

          {/* Active Flag Details */}
          {activeFlagObj && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                {activeFlagObj.description || 'No description available'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Targeting Rules Defined: <strong>{(activeFlagObj.rules || []).length}</strong>
              </div>
            </div>
          )}

          {/* User Context Attributes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <label className="form-label">Evaluation Context Attributes</label>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                <Plus size={12} /> Add Key
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {contextAttributes.map((attr, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input input-mono"
                    placeholder="Key (e.g. country)"
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(idx, 'key', e.target.value)}
                    style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                  />
                  <input
                    type="text"
                    className="input input-mono"
                    placeholder="Value (e.g. US)"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(idx, 'value', e.target.value)}
                    style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="btn-icon"
                    style={{ color: '#fb7185' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunEvaluation}
            disabled={loading || !currentFlagKey}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            <Play size={18} />
            {loading ? 'Evaluating...' : 'Evaluate Flag Now'}
          </button>

        </div>

        {/* Right Evaluation Result Display */}
        <div style={{
          background: 'rgba(13, 20, 36, 0.8)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {evalResult ? (
            <div className="animate-fade-in" style={{ width: '100%' }}>
              
              {/* Result Icon */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: evalResult.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `2px solid ${evalResult.enabled ? '#10b981' : '#f43f5e'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                boxShadow: evalResult.enabled ? '0 0 30px rgba(16, 185, 129, 0.3)' : '0 0 30px rgba(244, 63, 94, 0.3)'
              }}>
                {evalResult.enabled ? (
                  <CheckCircle size={36} color="#10b981" />
                ) : (
                  <XCircle size={36} color="#f43f5e" />
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Evaluation Result for <strong className="input-mono">{evalResult.flagKey}</strong>
              </div>

              <div style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: evalResult.enabled ? '#34d399' : '#fb7185',
                letterSpacing: '-0.02em',
                marginBottom: '1rem'
              }}>
                {evalResult.enabled ? 'TRUE (ENABLED)' : 'FALSE (DISABLED)'}
              </div>

              {/* Execution Latency Stat */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                color: 'var(--text-main)'
              }}>
                <Clock size={14} color="#06b6d4" />
                <span>Execution Time: <strong>{evalResult.executionTimeMs} ms</strong></span>
              </div>

            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)' }}>
              <Code size={48} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>Ready for Evaluation</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Click "Evaluate Flag Now" to execute targeting rules against backend
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
