import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Cpu } from 'lucide-react';

const API_EVALUATE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api/v1/flags'}/evaluate`;

export default function SdkCodeGenerator({ selectedFlag }) {
  const flagKey = selectedFlag ? selectedFlag.flagKey : 'new-checkout-flow';
  const [activeTab, setActiveTab] = useState('react');
  const [copied, setCopied] = useState(false);

  const snippets = {
    react: `import { useState, useEffect } from 'react';

export function useFeatureFlag(flagKey, context = {}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch('${API_EVALUATE_URL}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagKey: '${flagKey}', context })
    })
      .then(res => res.json())
      .then(data => setEnabled(data.enabled))
      .catch(() => setEnabled(false));
  }, [flagKey, JSON.stringify(context)]);

  return enabled;
}

// Usage in Component:
// const isCheckoutEnabled = useFeatureFlag('${flagKey}', { userId: '123', country: 'US' });`,

    javascript: `async function isFeatureEnabled(flagKey, context = {}) {
  const response = await fetch('${API_EVALUATE_URL}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flagKey, context })
  });
  
  const data = await response.json();
  return data.enabled; // returns boolean
}

// Example usage:
const isEnabled = await isFeatureEnabled('${flagKey}', { country: 'US', userAge: 24 });
console.log('Flag Pulse status:', isEnabled);`,

    curl: `curl -X POST ${API_EVALUATE_URL} \\
  -H "Content-Type: application/json" \\
  -d '{
    "flagKey": "${flagKey}",
    "context": {
      "userId": "usr_9482",
      "country": "US",
      "userAge": "24"
    }
  }'`,

    java: `RestTemplate restTemplate = new RestTemplate();
String url = "${API_EVALUATE_URL}";

Map<String, Object> request = Map.of(
    "flagKey", "${flagKey}",
    "context", Map.of("userId", "123", "country", "US")
);

ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
boolean isEnabled = (Boolean) response.getBody().get("enabled");
System.out.println("${flagKey} is enabled: " + isEnabled);`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.5rem', borderRadius: '8px', color: '#818cf8' }}>
            <Code2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>SDK & API Code Snippets</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Integrating <span className="input-mono" style={{ color: '#34d399' }}>{flagKey}</span> into your microservices & frontend apps
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'react', label: 'React Hook' },
            { id: 'javascript', label: 'JavaScript' },
            { id: 'curl', label: 'cURL' },
            { id: 'java', label: 'Java Spring' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === t.id ? '#818cf8' : 'var(--text-muted)',
                border: activeTab === t.id ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Block Container */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', zIndex: 2 }}
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>

        <pre style={{
          background: '#070b14',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          color: '#e2e8f0',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          overflowX: 'auto'
        }}>
          <code>{snippets[activeTab]}</code>
        </pre>
      </div>

    </div>
  );
}
