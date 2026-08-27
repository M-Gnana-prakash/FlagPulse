import React from 'react';
import { ToggleRight, CheckCircle2, Sliders, Gauge, Activity } from 'lucide-react';

export default function MetricsOverview({ flags, lastEvaluationTime }) {
  const totalFlags = flags.length;
  const activeFlags = flags.filter(f => f.enabled || f.isEnabled).length;
  const totalRules = flags.reduce((acc, f) => acc + (f.rules ? f.rules.length : 0), 0);
  const activePercentage = totalFlags > 0 ? Math.round((activeFlags / totalFlags) * 100) : 0;

  const metrics = [
    {
      title: 'Total Flags',
      value: totalFlags,
      subtext: 'Configured in system',
      icon: ToggleRight,
      color: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.15)'
    },
    {
      title: 'Active Flags',
      value: activeFlags,
      subtext: `${activePercentage}% currently enabled`,
      icon: CheckCircle2,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Targeting Rules',
      value: totalRules,
      subtext: 'Active evaluation rules',
      icon: Sliders,
      color: '#a855f7',
      bgGlow: 'rgba(168, 85, 247, 0.15)'
    },
    {
      title: 'Avg Eval Latency',
      value: lastEvaluationTime !== null ? `${lastEvaluationTime.toFixed(2)} ms` : '< 0.5 ms',
      subtext: 'Caffeine cache benchmark',
      icon: Gauge,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {metrics.map((m, idx) => {
        const IconComp = m.icon;
        return (
          <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {m.title}
              </span>
              <div style={{
                background: m.bgGlow,
                padding: '0.5rem',
                borderRadius: '8px',
                color: m.color
              }}>
                <IconComp size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {m.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
