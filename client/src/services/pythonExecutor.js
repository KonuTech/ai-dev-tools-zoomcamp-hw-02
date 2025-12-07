/**
 * Python Code Executor using Pyodide
 * Runs Python code in the browser via WebAssembly
 */

let pyodideInstance = null;
let isLoading = false;
let loadPromise = null;

/**
 * Load Pyodide instance (singleton)
 */
async function loadPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      const { loadPyodide: load } = await import('pyodide');
      pyodideInstance = await load({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/'
      });
      return pyodideInstance;
    } catch (error) {
      isLoading = false;
      throw new Error(`Failed to load Pyodide: ${error.message}`);
    }
  })();

  return loadPromise;
}

/**
 * Execute Python code
 * @param {string} code - Python code to execute
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executePython(code) {
  try {
    const pyodide = await loadPyodide();

    // Capture stdout
    const captureCode = `
import sys
from io import StringIO

# Capture stdout
sys.stdout = StringIO()
sys.stderr = StringIO()

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)

# Get output
stdout_value = sys.stdout.getvalue()
stderr_value = sys.stderr.getvalue()
`;

    // Run the code
    await pyodide.runPythonAsync(captureCode);

    // Get captured output
    const stdout = pyodide.runPython('stdout_value');
    const stderr = pyodide.runPython('stderr_value');

    if (stderr) {
      return {
        output: stdout || '',
        error: stderr
      };
    }

    return {
      output: stdout || '(No output)',
      error: null
    };
  } catch (error) {
    return {
      output: '',
      error: error.message
    };
  }
}

/**
 * Check if Pyodide is loaded
 */
export function isPyodideLoaded() {
  return pyodideInstance !== null;
}

/**
 * Get loading status
 */
export function isPyodideLoading() {
  return isLoading && !pyodideInstance;
}
