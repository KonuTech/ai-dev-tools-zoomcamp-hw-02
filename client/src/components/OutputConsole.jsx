import './OutputConsole.css';

/**
 * Output Console Component
 * Displays code execution results, output, and errors
 */
export function OutputConsole({ output, error, isRunning, onClear }) {
  return (
    <div className="output-console">
      <div className="console-header">
        <h3>Output</h3>
        <div className="console-controls">
          {isRunning && (
            <span className="status-running">⏳ Running...</span>
          )}
          <button onClick={onClear} className="clear-button" title="Clear output">
            Clear
          </button>
        </div>
      </div>

      <div className="console-content">
        {!output && !error && !isRunning && (
          <div className="console-empty">
            Click "Run Code" to execute your code
          </div>
        )}

        {output && (
          <div className="console-output">
            <pre>{output}</pre>
          </div>
        )}

        {error && (
          <div className="console-error">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
