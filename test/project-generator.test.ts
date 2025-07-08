import { test, expect } from 'bun:test';
import { ProjectGenerator } from '../src/generators/project-generator';
import { ProjectConfig } from '../src/types';
import fs from 'fs';
import path from 'path';

test('ProjectGenerator creates project structure', async () => {
  const testDir = path.join(__dirname, 'test-output');
  
  // Clean up before test
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  
  const config: ProjectConfig = {
    name: 'test-project',
    description: 'A test project',
    directory: testDir,
    author: 'Test Author',
    includeAuth: false,
    deployTarget: 'railway'
  };
  
  const generator = new ProjectGenerator(config);
  await generator.generate();
  
  // Check that main directories were created
  expect(fs.existsSync(path.join(testDir, 'frontend'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'backend'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'docs'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'deployment'))).toBe(true);
  
  // Check that key files were created
  expect(fs.existsSync(path.join(testDir, 'frontend', 'package.json'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'backend', 'package.json'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'README.md'))).toBe(true);
  
  // Clean up after test
  fs.rmSync(testDir, { recursive: true });
});

test('ProjectGenerator includes Firebase when auth is enabled', async () => {
  const testDir = path.join(__dirname, 'test-output-auth');
  
  // Clean up before test
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  
  const config: ProjectConfig = {
    name: 'test-auth-project',
    description: 'A test project with auth',
    directory: testDir,
    author: 'Test Author',
    includeAuth: true,
    deployTarget: 'both'
  };
  
  const generator = new ProjectGenerator(config);
  await generator.generate();
  
  // Check that Firebase files were created
  expect(fs.existsSync(path.join(testDir, 'frontend', 'src', 'utils', 'auth.js'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'backend', 'src', 'utils', 'firebase.js'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'backend', 'src', 'routes', 'auth.js'))).toBe(true);
  
  // Check that Firebase dependencies are in package.json
  const frontendPackage = JSON.parse(fs.readFileSync(path.join(testDir, 'frontend', 'package.json'), 'utf-8'));
  const backendPackage = JSON.parse(fs.readFileSync(path.join(testDir, 'backend', 'package.json'), 'utf-8'));
  
  expect(frontendPackage.dependencies.firebase).toBeDefined();
  expect(backendPackage.dependencies['firebase-admin']).toBeDefined();
  
  // Clean up after test
  fs.rmSync(testDir, { recursive: true });
});
