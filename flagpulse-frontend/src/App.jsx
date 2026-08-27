import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsOverview from './components/MetricsOverview';
import FlagList from './components/FlagList';
import CreateFlagModal from './components/CreateFlagModal';
import EvaluationSimulator from './components/EvaluationSimulator';
import SdkCodeGenerator from './components/SdkCodeGenerator';
import ActivityLog from './components/ActivityLog';

import { checkBackendConnection, fetchFlags, createFlagApi, toggleFlagApi } from './services/api';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';
import { Sliders, Zap, Code2, Radio } from 'lucide-react';

export default function App() {
  const [flags, setFlags] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');
  
  const [selectedFlagKeyForEval, setSelectedFlagKeyForEval] = useState('');
  const [selectedFlagForSdk, setSelectedFlagForSdk] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [lastEvaluationTime, setLastEvaluationTime] = useState(null);

  const addEvent = (title, details, type = 'INFO') => {
    const timeStr = new Date().toLocaleTimeString();
    setEvents(prev => [{ title, details, type, timestamp: timeStr }, ...prev.slice(0, 49)]);
  };

  const loadFlagsData = async (forceMock = isMockMode) => {
    const isBackendAvailable = await checkBackendConnection();
    setIsLive(isBackendAvailable && !forceMock);
    
    // If backend isn't available, default to mock mode
    const useMock = forceMock || !isBackendAvailable;
    setIsMockMode(useMock);

    try {
      const data = await fetchFlags(useMock);
      setFlags(data);
    } catch (err) {
      console.error('Error fetching flags:', err);
    }
  };

  useEffect(() => {
    loadFlagsData();

    // Setup real-time WebSocket listener if Spring Boot backend is connected
    connectWebSocket(
      (websocketMsg) => {
        if (websocketMsg.action === 'TOGGLE') {
          addEvent('STOMP Broadcast Received', `Flag '${websocketMsg.flagKey}' set to ${websocketMsg.enabled ? 'ENABLED' : 'DISABLED'}`, 'TOGGLE');
          // Update local state
          setFlags(prevFlags => prevFlags.map(f => {
            if (f.flagKey === websocketMsg.flagKey) {
              return { ...f, enabled: websocketMsg.enabled, isEnabled: websocketMsg.enabled };
            }
            return f;
          }));
        }
      },
      (connected) => {
        setIsLive(connected);
      }
    );

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleToggleFlag = async (flagKey, enabled) => {
    try {
      await toggleFlagApi(flagKey, enabled, isMockMode);
      
      // Update state locally
      setFlags(prevFlags => prevFlags.map(f => {
        if (f.flagKey === flagKey) {
          return { ...f, enabled, isEnabled: enabled };
        }
        return f;
      }));

      addEvent('Flag Status Toggled', `'${flagKey}' is now ${enabled ? 'ENABLED' : 'DISABLED'}`, 'TOGGLE');
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  const handleCreateFlag = async (newFlagObj) => {
    try {
      const created = await createFlagApi(newFlagObj, isMockMode);
      setFlags(prev => [created, ...prev]);
      addEvent('New Flag Created', `Key: '${created.flagKey}' with ${newFlagObj.rules ? newFlagObj.rules.length : 0} rules`, 'CREATE');
    } catch (err) {
      console.error('Failed to create flag:', err);
    }
  };

  const handleSelectForEval = (key) => {
    setSelectedFlagKeyForEval(key);
    setActiveTab('simulator');
  };

  const handleSelectForSdk = (flagObj) => {
    setSelectedFlagForSdk(flagObj);
    setActiveTab('sdk');
  };

  const handleEvaluationComplete = (result) => {
    if (result.executionTimeMs !== undefined) {
      setLastEvaluationTime(result.executionTimeMs);
    }
    addEvent('Flag Evaluated', `'${result.flagKey}' evaluated to ${result.enabled ? 'TRUE' : 'FALSE'} in ${result.executionTimeMs}ms`, 'EVALUATE');
  };

  return (
    <div className="app-container min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      
      {/* Navbar Header */}
      <Header
        isLive={isLive}
        isMockMode={isMockMode}
        onToggleMockMode={() => {
          const nextMode = !isMockMode;
          setIsMockMode(nextMode);
          loadFlagsData(nextMode);
          addEvent('System Mode Changed', nextMode ? 'Switched to Demo Standalone Mode' : 'Switched to Live Backend API', 'INFO');
        }}
        onRefresh={() => loadFlagsData()}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Stats Deck Overview */}
      <MetricsOverview
        flags={flags}
        lastEvaluationTime={lastEvaluationTime}
      />

      {/* Main Tab Navigation */}
      <div className="tab-list" role="tablist" aria-label="FlagPulse workspace views">
        <button
          className={`tab-button ${activeTab === 'directory' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'directory'}
          onClick={() => setActiveTab('directory')}
        >
          <Sliders size={18} />
          Flags Directory ({flags.length})
        </button>

        <button
          className={`tab-button ${activeTab === 'simulator' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'simulator'}
          onClick={() => setActiveTab('simulator')}
        >
          <Zap size={18} />
          Rule Evaluator Playground
        </button>

        <button
          className={`tab-button ${activeTab === 'sdk' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'sdk'}
          onClick={() => setActiveTab('sdk')}
        >
          <Code2 size={18} />
          SDK & Integration
        </button>

        <button
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
        >
          <Radio size={18} />
          Live Pulse Feed ({events.length})
        </button>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'directory' && (
        <FlagList
          flags={flags}
          onToggleFlag={handleToggleFlag}
          onSelectForEvaluation={handleSelectForEval}
          onSelectForSdk={handleSelectForSdk}
        />
      )}

      {activeTab === 'simulator' && (
        <EvaluationSimulator
          flags={flags}
          selectedFlagKey={selectedFlagKeyForEval}
          isMockMode={isMockMode}
          onEvaluationComplete={handleEvaluationComplete}
        />
      )}

      {activeTab === 'sdk' && (
        <SdkCodeGenerator
          selectedFlag={selectedFlagForSdk}
        />
      )}

      {activeTab === 'activity' && (
        <ActivityLog
          events={events}
          onClearEvents={() => setEvents([])}
        />
      )}

      {/* Create Flag Modal */}
      <CreateFlagModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateFlag={handleCreateFlag}
      />

    </div>
  );
}
