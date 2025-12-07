import { test, expect } from '@playwright/test';

/**
 * E2E tests for real-time collaboration features
 */

test.describe('Real-time Collaboration', () => {
  test('should show connection status on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for connection
    await expect(page.getByText(/Connected|Disconnected/)).toBeVisible();
    await expect(page.getByText('🟢 Connected')).toBeVisible({ timeout: 5000 });
  });

  test('should join room successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for connection
    await expect(page.getByText('🟢 Connected')).toBeVisible();

    // Fill in form
    await page.fill('#username', 'Test User');
    await page.fill('#roomId', 'test-room-e2e');

    // Join room
    await page.click('button:has-text("Join Room")');

    // Verify we're in the room
    await expect(page.getByText('Room: test-room-e2e')).toBeVisible();
    await expect(page.getByText('Welcome, Test User!')).toBeVisible();
  });

  test('two users should see each other in the same room', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1 joins
    await page1.goto('/');
    await expect(page1.getByText('🟢 Connected')).toBeVisible();
    await page1.fill('#username', 'User One');
    await page1.fill('#roomId', 'multi-user-test');
    await page1.click('button:has-text("Join Room")');
    await expect(page1.getByText('Room: multi-user-test')).toBeVisible();

    // User 2 joins
    await page2.goto('/');
    await expect(page2.getByText('🟢 Connected')).toBeVisible();
    await page2.fill('#username', 'User Two');
    await page2.fill('#roomId', 'multi-user-test');
    await page2.click('button:has-text("Join Room")');
    await expect(page2.getByText('Room: multi-user-test')).toBeVisible();

    // Verify users see each other
    await expect(page1.getByText('Connected Users (1)')).toBeVisible();
    await expect(page1.getByText('User Two')).toBeVisible();

    await expect(page2.getByText('Connected Users (1)')).toBeVisible();
    await expect(page2.getByText('User One')).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('code changes should sync between users', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both users join the same room
    await page1.goto('/');
    await expect(page1.getByText('🟢 Connected')).toBeVisible();
    await page1.fill('#username', 'Coder One');
    await page1.fill('#roomId', 'code-sync-test');
    await page1.click('button:has-text("Join Room")');

    await page2.goto('/');
    await expect(page2.getByText('🟢 Connected')).toBeVisible();
    await page2.fill('#username', 'Coder Two');
    await page2.fill('#roomId', 'code-sync-test');
    await page2.click('button:has-text("Join Room")');

    // Wait for Monaco Editor to load
    await page1.waitForTimeout(2000);

    // User 1 types code - Monaco Editor interaction
    const testCode = 'console.log("Hello from E2E test");';
    await page1.click('.monaco-editor');
    await page1.keyboard.press('Control+A');
    await page1.keyboard.type(testCode);

    // Wait for sync
    await page2.waitForTimeout(500);

    // Verify code appears in User 2's editor
    const page2Code = await page2.evaluate(() => {
      const model = window.monaco?.editor?.getModels()?.[0];
      return model?.getValue();
    });

    expect(page2Code).toContain(testCode);

    await context1.close();
    await context2.close();
  });

  test('language changes should sync between users', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both users join
    await page1.goto('/');
    await expect(page1.getByText('🟢 Connected')).toBeVisible();
    await page1.fill('#username', 'Dev One');
    await page1.fill('#roomId', 'lang-test');
    await page1.click('button:has-text("Join Room")');

    await page2.goto('/');
    await expect(page2.getByText('🟢 Connected')).toBeVisible();
    await page2.fill('#username', 'Dev Two');
    await page2.fill('#roomId', 'lang-test');
    await page2.click('button:has-text("Join Room")');

    // User 1 changes language to Python
    await page1.selectOption('.language-selector', 'python');

    // Wait for sync
    await page2.waitForTimeout(500);

    // Verify User 2's language changed
    const page2Language = await page2.$eval('.language-selector', el => el.value);
    expect(page2Language).toBe('python');

    // Verify Python starter code appears
    const page2Code = await page2.evaluate(() => {
      const model = window.monaco?.editor?.getModels()?.[0];
      return model?.getValue();
    });
    expect(page2Code).toContain('# Welcome');
    expect(page2Code).toContain('def greet');

    await context1.close();
    await context2.close();
  });
});
