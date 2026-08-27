import React, { useState } from 'react';
import { X, Plus, Trash2, Sliders, CheckCircle2 } from 'lucide-react';

export default function CreateFlagModal({ isOpen, onClose, onCreateFlag }) {
  const [flagKey, setFlagKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules([...rules, { attributeName: '', operator: 'EQUALS', targetValue: '' }]);
  };

  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;
    setRules(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!flagKey.trim()) {
      setError('Flag key is required.');
      return;
    }

    // Validate key format (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(flagKey.trim())) {
      setError('Flag key must only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    // Validate rules
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (!r.attributeName.trim()) {
        setError(`Rule #${i + 1} is missing attribute name.`);
        return;
      }
      if (!r.targetValue.trim()) {
        setError(`Rule #${i + 1} is missing target value.`);
        return;
      }
    }

    onCreateFlag({
      flagKey: flagKey.trim(),
      description: description.trim(),
      enabled,
      isEnabled: enabled,
      rules: rules.map(r => ({
        attributeName: r.attributeName.trim(),
        operator: r.operator,
        targetValue: r.targetValue.trim()
      }))
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ padding: '1.75rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.5rem', borderRadius: '8px', color: '#818cf8' }}>
              <Sliders size={20} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create Feature Flag</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Flag Key */}
          <div className="form-group">
            <label className="form-label">Flag Key *</label>
            <input
              type="text"
              className="input input-mono"
              placeholder="e.g. new-checkout-flow"
              value={flagKey}
              onChange={(e) => setFlagKey(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Unique identifier used in application code to evaluate this flag.
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Describe the purpose and target rollout of this feature flag..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Initial Status Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Initial State</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {enabled ? 'Flag will evaluate as ACTIVE upon creation' : 'Flag will evaluate as DISABLED upon creation'}
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Dynamic Targeting Rules */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Targeting Rules</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Evaluate TRUE only when context matches all defined rules
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>

            {rules.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                No targeting rules configured. Flag will evaluate solely based on global toggle status.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rules.map((rule, idx) => (
                  <div key={idx} className="rule-row" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 1fr 36px',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <input
                      type="text"
                      className="input input-mono"
                      placeholder="Attribute (e.g. country)"
                      value={rule.attributeName}
                      onChange={(e) => handleRuleChange(idx, 'attributeName', e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    />

                    <select
                      className="input"
                      value={rule.operator}
                      onChange={(e) => handleRuleChange(idx, 'operator', e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    >
                      <option value="EQUALS">EQUALS</option>
                      <option value="GREATER_THAN">GREATER_THAN</option>
                      <option value="PERCENTAGE">PERCENTAGE</option>
                    </select>

                    <input
                      type="text"
                      className="input input-mono"
                      placeholder="Value (e.g. US, 18, 50)"
                      value={rule.targetValue}
                      onChange={(e) => handleRuleChange(idx, 'targetValue', e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="btn-icon"
                      style={{ color: '#fb7185' }}
                      title="Remove Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Create Flag
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
