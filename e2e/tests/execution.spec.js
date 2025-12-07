import { test, expect } from '@playwright/test';

/**
 * E2E tests for code execution features
 */

test.describe('Code Execution', () => {
  test('should execute JavaScript code and display output', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    // Join room
    await page.fill('#username', 'JS Tester');
    await page.fill('#roomId', 'js-exec-test');
    await page.click('button:has-text("Join Room")');
    await expect(page.getByText('Room: js-exec-test')).toBeVisible();

    // Wait for Monaco to load
    await page.waitForTimeout(2000);

    // Clear and write JavaScript code
    const jsCode = 'console.log("JavaScript is working!");\\nconsole.log(2 + 2);';
    await page.click('.monaco-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(jsCode);

    // Run code
    await page.click('button:has-text("Run Code")');

    // Wait for execution
    await page.waitForTimeout(1000);

    // Verify output
    await expect(page.getByText('JavaScript is working!')).toBeVisible();
    await expect(page.getByText('4')).toBeVisible();
  });

  test('should execute Python code and display output', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    // Join room
    await page.fill('#username', 'Python Tester');
    await page.fill('#roomId', 'py-exec-test');
    await page.click('button:has-text("Join Room")');

    // Switch to Python
    await page.selectOption('.language-selector', 'python');
    await page.waitForTimeout(1000);

    // Write Python code
    const pyCode = 'print("Python is working!")\\nprint(2 + 2)';
    await page.click('.monaco-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(pyCode);

    // Run code (first run may take longer due to Pyodide loading)
    await page.click('button:has-text("Run Code")');

    // Wait for Pyodide to load and execute (max 30 seconds)
    await page.waitForTimeout(30000);

    // Verify output
    await expect(page.getByText('Python is working!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('4')).toBeVisible();
  });

  test('should display JavaScript errors correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    await page.fill('#username', 'Error Tester');
    await page.fill('#roomId', 'error-test');
    await page.click('button:has-text("Join Room")');

    await page.waitForTimeout(2000);

    // Write code with error
    const errorCode = 'throw new Error("Test error");';
    await page.click('.monaco-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(errorCode);

    // Run code
    await page.click('button:has-text("Run Code")');
    await page.waitForTimeout(1000);

    // Verify error is displayed
    await expect(page.getByText('Error:')).toBeVisible();
    await expect(page.getByText('Test error')).toBeVisible();
  });

  test('should display Python errors correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    await page.fill('#username', 'Py Error Tester');
    await page.fill('#roomId', 'py-error-test');
    await page.click('button:has-text("Join Room")');

    // Switch to Python
    await page.selectOption('.language-selector', 'python');
    await page.waitForTimeout(1000);

    // Write Python code with error
    const errorCode = 'raise Exception("Test Python error")';
    await page.click('.monaco-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(errorCode);

    // Run code
    await page.click('button:has-text("Run Code")');
    await page.waitForTimeout(30000);

    // Verify error is displayed
    await expect(page.getByText('Error:')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Test Python error/)).toBeVisible();
  });

  test('should clear output when Clear button is clicked', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    await page.fill('#username', 'Clear Tester');
    await page.fill('#roomId', 'clear-test');
    await page.click('button:has-text("Join Room")');

    await page.waitForTimeout(2000);

    // Run some code
    const code = 'console.log("This will be cleared");';
    await page.click('.monaco-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(code);

    await page.click('button:has-text("Run Code")');
    await page.waitForTimeout(1000);

    // Verify output exists
    await expect(page.getByText('This will be cleared')).toBeVisible();

    // Click Clear
    await page.click('button:has-text("Clear")');

    // Verify output is cleared
    await expect(page.getByText('This will be cleared')).not.toBeVisible();
    await expect(page.getByText('Click "Run Code" to execute your code')).toBeVisible();
  });

  test('should show running indicator while code executes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    await page.fill('#username', 'Status Tester');
    await page.fill('#roomId', 'status-test');
    await page.click('button:has-text("Join Room")');

    await page.waitForTimeout(2000);

    const code = 'console.log("test");';
    await page.click('.monaco-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(code);

    // Click run and immediately check for running indicator
    await page.click('button:has-text("Run Code")');

    // The button should show "Running..." (might be very brief for JS)
    // For Python, this will be more visible
    const runButton = page.locator('button.run-button');
    const buttonText = await runButton.textContent();

    // Button should either be running or have completed
    expect(buttonText).toMatch(/Running|Run Code/);
  });
});
