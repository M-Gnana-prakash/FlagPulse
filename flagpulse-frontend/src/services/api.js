export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api/v1/flags';

// Initial Mock Flags for Demo / Offline Mode
let mockFlags = [
  {
    id: 1,
    flagKey: 'new-checkout-flow',
    description: 'Enables the modern 3-step checkout experience for users',
    enabled: true,
    rules: [
      { id: 101, attributeName: 'country', operator: 'EQUALS', targetValue: 'US' },
      { id: 102, attributeName: 'userAge', operator: 'GREATER_THAN', targetValue: '18' }
    ]
  },
  {
    id: 2,
    flagKey: 'beta-dark-theme',
    description: 'Unlocks experimental ultra dark OLED theme in settings',
    enabled: true,
    rules: [
      { id: 103, attributeName: 'userId', operator: 'PERCENTAGE', targetValue: '50' }
    ]
  },
  {
    id: 3,
    flagKey: 'ai-recommendations',
    description: 'Powers homepage product feeds using deep neural recommendation engine',
    enabled: false,
    rules: []
  },
  {
    id: 4,
    flagKey: 'discount-banner-2026',
    description: 'Displays seasonal promotion banner on dashboard top area',
    enabled: true,
    rules: [
      { id: 104, attributeName: 'tier', operator: 'EQUALS', targetValue: 'VIP' }
    ]
  }
];

export async function checkBackendConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(API_BASE_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchFlags(useMock = false) {
  if (useMock) return [...mockFlags];
  try {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend unavailable, falling back to mock mode:', err);
    return [...mockFlags];
  }
}

export async function createFlagApi(flagObj, useMock = false) {
  if (useMock) {
    const newFlag = {
      id: Date.now(),
      flagKey: flagObj.flagKey,
      description: flagObj.description || '',
      enabled: flagObj.isEnabled !== undefined ? flagObj.isEnabled : flagObj.enabled,
      rules: flagObj.rules ? flagObj.rules.map((r, i) => ({ ...r, id: Date.now() + i })) : []
    };
    mockFlags.unshift(newFlag);
    return newFlag;
  }

  const payload = {
    flagKey: flagObj.flagKey,
    description: flagObj.description,
    isEnabled: flagObj.enabled !== undefined ? flagObj.enabled : flagObj.isEnabled,
    rules: flagObj.rules || []
  };

  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to create flag');
  return await res.json();
}

export async function toggleFlagApi(flagKey, enabled, useMock = false) {
  if (useMock) {
    const target = mockFlags.find(f => f.flagKey === flagKey);
    if (target) {
      target.enabled = enabled;
      target.isEnabled = enabled;
    }
    return target || { flagKey, enabled };
  }

  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(flagKey)}/toggle?enabled=${enabled}`, {
    method: 'POST'
  });

  if (!res.ok) throw new Error('Failed to toggle flag');
  return await res.json();
}

export async function evaluateFlagApi(flagKey, context = {}, useMock = false) {
  const startTime = performance.now();
  
  if (useMock) {
    const flag = mockFlags.find(f => f.flagKey === flagKey);
    let result = false;

    if (flag && (flag.enabled || flag.isEnabled)) {
      if (!flag.rules || flag.rules.length === 0) {
        result = true;
      } else {
        result = flag.rules.every(rule => {
          const val = context[rule.attributeName];
          if (rule.operator === 'EQUALS') {
            return val !== undefined && String(val).toLowerCase() === String(rule.targetValue).toLowerCase();
          } else if (rule.operator === 'GREATER_THAN') {
            return val !== undefined && Number(val) > Number(rule.targetValue);
          } else if (rule.operator === 'PERCENTAGE') {
            const userId = context.userId || '';
            if (!userId) return false;
            let hash = 0;
            const str = String(userId) + flagKey;
            for (let i = 0; i < str.length; i++) {
              hash = (hash << 5) - hash + str.charCodeAt(i);
              hash |= 0;
            }
            return Math.abs(hash) % 100 < Number(rule.targetValue);
          }
          return false;
        });
      }
    }

    const execTime = (performance.now() - startTime).toFixed(3);
    return {
      flagKey,
      enabled: result,
      executionTimeMs: parseFloat(execTime)
    };
  }

  const res = await fetch(`${API_BASE_URL}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flagKey, context })
  });

  if (!res.ok) throw new Error('Failed to evaluate flag');
  return await res.json();
}
