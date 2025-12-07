/**
 * JavaScript Code Executor using Sandboxed Iframe
 * Runs JavaScript code safely in an isolated iframe
 */

/**
 * Execute JavaScript code in a sandboxed iframe
 * @param {string} code - JavaScript code to execute
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executeJavaScript(code) {
  return new Promise((resolve) => {
    const output = [];
    const errors = [];

    // Create sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-same-origin'; // Minimal permissions
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;

    // Timeout for execution (5 seconds)
    const timeout = setTimeout(() => {
      cleanup();
      resolve({
        output: output.join('\n') || '(No output)',
        error: 'Execution timeout (5 seconds)'
      });
    }, 5000);

    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
    };

    try {
      // Override console methods to capture output
      iframeWindow.console = {
        log: (...args) => {
          output.push(args.map(arg => String(arg)).join(' '));
        },
        error: (...args) => {
          errors.push(args.map(arg => String(arg)).join(' '));
        },
        warn: (...args) => {
          output.push('Warning: ' + args.map(arg => String(arg)).join(' '));
        },
        info: (...args) => {
          output.push(args.map(arg => String(arg)).join(' '));
        }
      };

      // Wrap code to catch errors and handle return values
      const wrappedCode = `
        try {
          const result = (function() {
            ${code}
          })();
          if (result !== undefined) {
            console.log(result);
          }
        } catch (error) {
          console.error(error.message);
        }
      `;

      // Execute code in iframe
      iframeWindow.eval(wrappedCode);

      // Small delay to ensure async operations complete
      setTimeout(() => {
        cleanup();

        if (errors.length > 0) {
          resolve({
            output: output.join('\n') || '',
            error: errors.join('\n')
          });
        } else {
          resolve({
            output: output.join('\n') || '(No output)',
            error: null
          });
        }
      }, 100);

    } catch (error) {
      cleanup();
      resolve({
        output: output.join('\n') || '',
        error: error.message
      });
    }
  });
}
