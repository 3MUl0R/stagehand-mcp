// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PAGE_PATH = path.join(__dirname, '..', 'test-page.html');

test.describe('Stagehand MCP Build Verification', () => {
  test('dist directory should exist with required files', async () => {
    const distDir = path.join(__dirname, '..', 'dist');
    const indexJsPath = path.join(distDir, 'index.js');
    const utilsJsPath = path.join(distDir, 'utils.js');
    
    expect(fs.existsSync(distDir)).toBeTruthy();
    expect(fs.existsSync(indexJsPath)).toBeTruthy();
    expect(fs.existsSync(utilsJsPath)).toBeTruthy();
    
    // Check if index.js has executable permissions (not applicable on Windows CI, but helps on Unix systems)
    try {
      const stats = fs.statSync(indexJsPath);
      const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
      console.log(`index.js executable: ${isExecutable}`);
    } catch (error) {
      console.error('Error checking file stats:', error);
    }
  });
  
  test('test-page.html exists and is valid', async ({ page }) => {
    // This ensures the test page exists and can be loaded in a browser
    expect(fs.existsSync(TEST_PAGE_PATH)).toBeTruthy();
    
    // Load the page directly from the file system
    await page.goto(`file://${TEST_PAGE_PATH}`);
    
    // Verify basic elements are present
    await expect(page.locator('h1')).toHaveText('Stagehand MCP Test Page');
    await expect(page.locator('#searchInput')).toBeVisible();
    await expect(page.locator('#searchButton')).toBeVisible();
    
    // Test basic functionality - search
    await page.locator('#searchInput').fill('test query');
    await page.locator('#searchButton').click();
    await expect(page.locator('#searchResult')).toBeVisible();
    await expect(page.locator('#searchResult')).toContainText('Showing results for: "test query"');
    
    // Test form functionality
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#message').fill('This is a test message');
    await page.locator('#testForm button[type="submit"]').click();
    
    await expect(page.locator('#formResult')).toBeVisible();
    await expect(page.locator('#formResult')).toContainText('Form Submitted');
    await expect(page.locator('#formResult')).toContainText('Name: Test User');
  });
});