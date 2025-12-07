import { useState, useEffect } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { OutputConsole } from '../components/OutputConsole';
import { executePython } from '../services/pythonExecutor';
import { executeJavaScript } from '../services/javascriptExecutor';
import './Room.css';

/**
 * Room component for collaborative code editing
 * Phase 3: Monaco Editor with real-time synchronization
 */
export function Room({
  roomId,
  userId,
  username,
  onLeave,
  // Socket data passed from App
  connected,
  roomState,
  users,
  sendCodeChange,
  changeLanguage
}) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Sync with room state
  useEffect(() => {
    if (roomState) {
      setCode(roomState.code);
      setLanguage(roomState.language);
    }
  }, [roomState]);

  // Handle code changes from Monaco Editor
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    sendCodeChange(roomId, newCode);
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    changeLanguage(roomId, newLanguage);
  };

  // Handle code execution
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError(null);

    try {
      let result;
      if (language === 'python') {
        result = await executePython(code);
      } else {
        result = await executeJavaScript(code);
      }

      setOutput(result.output);
      setError(result.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Clear output
  const handleClearOutput = () => {
    setOutput('');
    setError(null);
  };

  return (
    <div className="room">
      {/* Header */}
      <div className="room-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        <div className="room-controls">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-selector"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>

          <button
            onClick={handleRunCode}
            className="run-button"
            disabled={isRunning}
          >
            {isRunning ? '⏳ Running...' : '▶ Run Code'}
          </button>

          <button onClick={onLeave} className="leave-button">
            ← Leave Room
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="room-content">
        {/* Code editor and output */}
        <div className="editor-section">
          <div className="editor-area">
            <div className="editor-header">
              <h3>Code Editor</h3>
              <span className="editor-note">
                Monaco Editor (VS Code)
              </span>
            </div>

            <div className="monaco-container">
              <CodeEditor
                code={code}
                language={language}
                onChange={handleCodeChange}
              />
            </div>
          </div>

          <div className="output-area">
            <OutputConsole
              output={output}
              error={error}
              isRunning={isRunning}
              onClear={handleClearOutput}
            />
          </div>
        </div>

        {/* Sidebar with users and info */}
        <div className="sidebar">
          <div className="user-info">
            <h3>You</h3>
            <p className="username">{username}</p>
            <p className="user-id">ID: {userId}</p>
          </div>

          <div className="users-list">
            <h3>Connected Users ({users.length})</h3>
            {users.length === 0 ? (
              <p className="no-users">No other users in this room</p>
            ) : (
              <ul>
                {users.map((user) => (
                  <li key={user.userId} className="user-item">
                    <span className="user-indicator">👤</span>
                    <span className="user-name">{user.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="phase-status">
            <h3>Development Status</h3>
            <ul className="phase-list">
              <li className="completed">✅ Phase 1: Scaffold & Docker Setup</li>
              <li className="completed">✅ Phase 2: Real-time Collaboration</li>
              <li className="completed">✅ Phase 3: Code Editor Integration</li>
              <li className="completed">✅ Phase 4: Code Execution</li>
              <li className="completed">✅ Phase 5: Testing & Quality Assurance</li>
              <li className="completed">✅ Phase 6: Production & CI/CD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
