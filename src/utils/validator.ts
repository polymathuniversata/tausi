import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface ValidationRule {
  pattern: RegExp;
  allowedDirectories: string[];
  description: string;
}

interface NonNegotiableRule {
  check: (filePath: string, content?: string) => boolean;
  fix?: (filePath: string) => boolean;
  description: string;
  severity: 'error' | 'warning';
}

export class ProjectValidator {
  private rules: ValidationRule[] = [
    {
      pattern: /\.md$/,
      allowedDirectories: ['docs', 'root', 'frontend/public/assets', 'backend/database'],
      description: 'Markdown files should be in docs/ directory, project root, assets folder, or database folder'
    },
    {
      pattern: /\.(sql|db|sqlite)$/,
      allowedDirectories: ['backend', 'backend/src', 'backend/src/database', 'backend/database'],
      description: 'Database files should be in backend directories'
    },
    {
      pattern: /\.(js|ts|jsx|tsx)$/,
      allowedDirectories: ['frontend/src', 'backend/src', 'frontend', 'backend'],
      description: 'JavaScript/TypeScript files should be in src directories'
    },
    {
      pattern: /\.(css|scss|sass|less)$/,
      allowedDirectories: ['frontend/src/styles', 'frontend/src', 'frontend/public'],
      description: 'Style files should be in frontend/src/styles'
    },
    {
      pattern: /\.(png|jpg|jpeg|gif|svg|ico)$/,
      allowedDirectories: ['frontend/public', 'frontend/public/assets', 'frontend/src/assets'],
      description: 'Image files should be in frontend/public/assets'
    },
    {
      pattern: /\.(html|htm)$/,
      allowedDirectories: ['frontend', 'frontend/public'],
      description: 'HTML files should be in frontend directory'
    },
    {
      pattern: /^package\.json$/,
      allowedDirectories: ['root', 'frontend', 'backend'],
      description: 'package.json files should be in project root or frontend/backend directories'
    },
    {
      pattern: /\.(toml|yaml|yml|dockerfile)$/i,
      allowedDirectories: ['deployment', 'root'],
      description: 'Deployment configs should be in deployment/ directory'
    }
  ];

  // Non-negotiable rules for clean code and structure
  private nonNegotiableRules: NonNegotiableRule[] = [
    // File naming conventions
    {
      check: (filePath: string) => {
        const fileName = path.basename(filePath);
        // Enforce kebab-case for directories, camelCase/PascalCase for files
        const dirName = path.dirname(filePath).split('/').pop();
        if (dirName && /[A-Z]/.test(dirName) && !['README', 'LICENSE'].includes(dirName)) {
          return false;
        }
        return true;
      },
      description: 'Directory names must use kebab-case (lowercase with hyphens)',
      severity: 'error'
    },
    
    // No nested node_modules
    {
      check: (filePath: string) => {
        const parts = filePath.split('/');
        const nodeModulesCount = parts.filter(part => part === 'node_modules').length;
        return nodeModulesCount <= 1;
      },
      description: 'No nested node_modules directories allowed',
      severity: 'error'
    },
    
    // No empty directories (except for specific allowed ones)
    {
      check: (filePath: string) => {
        if (!fs.existsSync(filePath)) return true;
        if (!fs.statSync(filePath).isDirectory()) return true;
        
        const allowedEmptyDirs = ['.git', 'node_modules', 'dist', 'build'];
        if (allowedEmptyDirs.some(dir => filePath.endsWith(dir))) return true;
        
        const contents = fs.readdirSync(filePath);
        return contents.length > 0;
      },
      description: 'Directories must not be empty (except build/dist/git)',
      severity: 'warning'
    },
    
    // File size limits
    {
      check: (filePath: string) => {
        if (!fs.existsSync(filePath)) return true;
        if (fs.statSync(filePath).isDirectory()) return true;
        
        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath);
        
        // Different size limits for different file types
        const limits: { [key: string]: number } = {
          '.js': 500 * 1024,    // 500KB for JS files
          '.ts': 500 * 1024,    // 500KB for TS files
          '.css': 200 * 1024,   // 200KB for CSS files
          '.md': 100 * 1024,    // 100KB for markdown
          '.json': 50 * 1024,   // 50KB for JSON
          '.sql': 100 * 1024    // 100KB for SQL
        };
        
        const limit = limits[ext] || 1024 * 1024; // 1MB default
        return stats.size <= limit;
      },
      description: 'Files must not exceed reasonable size limits (JS/TS: 500KB, CSS: 200KB, etc.)',
      severity: 'warning'
    },
    
    // No duplicate files (same name in different directories)
    {
      check: (filePath: string, content?: string) => {
        // This will be checked at project level, not per file
        return true;
      },
      description: 'No duplicate filenames across the project',
      severity: 'warning'
    },
    
    // Clean imports - no relative path hell
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts'].includes(path.extname(filePath))) return true;
        
        // Check for excessive relative imports (more than 2 levels up)
        const excessiveRelative = /import.*from\s+['"](\.\.\/){3,}/.test(content);
        return !excessiveRelative;
      },
      description: 'No excessive relative imports (max 2 levels up: ../..)',
      severity: 'error'
    },
    
    // No console.log in production files
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts'].includes(path.extname(filePath))) return true;
        if (filePath.includes('dev') || filePath.includes('test') || filePath.includes('debug')) return true;
        
        return !content.includes('console.log');
      },
      fix: (filePath: string) => {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const cleaned = content.replace(/console\.log\([^)]*\);?\s*/g, '');
          fs.writeFileSync(filePath, cleaned);
          return true;
        } catch {
          return false;
        }
      },
      description: 'No console.log statements in production code',
      severity: 'error'
    },
    
    // No TODO/FIXME comments in production
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(filePath))) return true;
        
        const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX)/i;
        return !todoPattern.test(content);
      },
      fix: (filePath: string) => {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const cleaned = content.replace(/\/\/\s*(TODO|FIXME|HACK|XXX)[^\n]*/gi, '');
          fs.writeFileSync(filePath, cleaned);
          return true;
        } catch {
          return false;
        }
      },
      description: 'No TODO/FIXME/HACK comments in production code',
      severity: 'warning'
    },
    
    // No unused imports
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(filePath))) return true;
        
        // Simple check for unused imports
        const importRegex = /import\s+({[^}]+}|\w+)\s+from\s+['"][^'"]+['"]/g;
        const imports = content.match(importRegex) || [];
        
        for (const importStatement of imports) {
          const importName = importStatement.match(/import\s+({[^}]+}|\w+)/)?.[1];
          if (importName && !importName.includes('{')) {
            // Check if the imported name is used in the file
            const nameRegex = new RegExp(`\\b${importName}\\b`, 'g');
            const occurrences = (content.match(nameRegex) || []).length;
            if (occurrences <= 1) { // Only the import itself
              return false;
            }
          }
        }
        return true;
      },
      description: 'No unused imports allowed',
      severity: 'warning'
    },
    
    // No large single-line code
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts', '.jsx', '.tsx', '.css'].includes(path.extname(filePath))) return true;
        
        const lines = content.split('\n');
        return !lines.some(line => line.length > 150);
      },
      description: 'Code lines should not exceed 150 characters',
      severity: 'warning'
    },
    
    // No deeply nested directories (max 5 levels)
    {
      check: (filePath: string) => {
        const depth = filePath.split('/').length;
        return depth <= 8; // Adjusted for project structure
      },
      description: 'Directory nesting should not exceed 5 levels deep',
      severity: 'warning'
    },
    
    // Bundle-friendly: No dynamic imports with variables
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(filePath))) return true;
        
        // Check for dynamic imports with variables that can't be statically analyzed
        const dynamicImportWithVar = /import\([^'"]*\$\{[^}]+\}[^'"]*\)/;
        return !dynamicImportWithVar.test(content);
      },
      description: 'Dynamic imports must use static strings for bundle optimization',
      severity: 'error'
    },
    
    // No inline styles in JS/TS
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(filePath))) return true;
        
        // Check for style objects that should be in CSS files
        const inlineStyles = /style\s*=\s*\{\{[^}]+\}\}/;
        const styleObjects = /const\s+\w+\s*=\s*\{\s*[a-zA-Z]+\s*:\s*['"][^'"]*['"]/;
        
        return !inlineStyles.test(content) && !styleObjects.test(content);
      },
      description: 'Use CSS files instead of inline styles for better bundling',
      severity: 'warning'
    },
    
    // No mixed quote styles
    {
      check: (filePath: string, content?: string) => {
        if (!content || !['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(filePath))) return true;
        
        const singleQuotes = (content.match(/'/g) || []).length;
        const doubleQuotes = (content.match(/"/g) || []).length;
        
        // Allow mixed quotes if one is significantly more prevalent
        if (singleQuotes === 0 || doubleQuotes === 0) return true;
        
        const ratio = Math.max(singleQuotes, doubleQuotes) / Math.min(singleQuotes, doubleQuotes);
        return ratio >= 3; // 3:1 ratio tolerance
      },
      fix: (filePath: string) => {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Convert to single quotes (more common in modern JS)
          const fixed = content.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, "'$1'");
          fs.writeFileSync(filePath, fixed);
          return true;
        } catch {
          return false;
        }
      },
      description: 'Consistent quote style throughout the project',
      severity: 'warning'
    }
  ];

  validateStructure(projectPath: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Detect project type and set appropriate rules
    const projectType = this.detectProjectType(projectPath);
    this.rules = this.getValidationRules(projectType);
    
    const walkDir = (dir: string, baseDir: string = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(baseDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            walkDir(fullPath, relativePath);
          }
        } else {
          this.validateFile(relativePath, projectPath, errors);
        }
      }
    };
    
    walkDir(projectPath);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateNonNegotiableRules(projectPath: string): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[]; 
    fixable: Array<{ filePath: string; rule: NonNegotiableRule }> 
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixable: Array<{ filePath: string; rule: NonNegotiableRule }> = [];
    
    // Detect project type and set appropriate non-negotiable rules
    const projectType = this.detectProjectType(projectPath);
    const nonNegotiableRules = this.getNonNegotiableRules(projectType);
    
    const walkDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            walkDir(fullPath);
          }
        } else {
          this.checkNonNegotiableRules(fullPath, projectPath, errors, warnings, fixable, nonNegotiableRules);
        }
      }
    };
    
    walkDir(projectPath);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fixable
    };
  }

  private checkNonNegotiableRules(
    filePath: string, 
    projectPath: string, 
    errors: string[], 
    warnings: string[], 
    fixable: Array<{ filePath: string; rule: NonNegotiableRule }>,
    nonNegotiableRules: NonNegotiableRule[]
  ) {
    const relativePath = path.relative(projectPath, filePath);
    let content: string | undefined;
    
    try {
      if (!['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'].includes(path.extname(filePath))) {
        content = fs.readFileSync(filePath, 'utf-8');
      }
    } catch {
      // Binary file or read error, skip content checks
    }
    
    for (const rule of nonNegotiableRules) {
      const isValid = rule.check(relativePath, content);
      
      if (!isValid) {
        const message = `${relativePath}: ${rule.description}`;
        
        if (rule.severity === 'error') {
          errors.push(message);
        } else {
          warnings.push(message);
        }
        
        if (rule.fix) {
          fixable.push({ filePath, rule });
        }
      }
    }
  }

  async fixNonNegotiableRules(projectPath: string): Promise<{ fixed: number; failed: number }> {
    const validation = this.validateNonNegotiableRules(projectPath);
    let fixed = 0;
    let failed = 0;
    
    console.log(chalk.blue('🔧 Fixing non-negotiable rule violations...'));
    
    for (const { filePath, rule } of validation.fixable) {
      if (rule.fix) {
        try {
          const success = rule.fix(filePath);
          if (success) {
            fixed++;
            console.log(chalk.green(`  ✅ Fixed: ${path.relative(projectPath, filePath)}`));
          } else {
            failed++;
            console.log(chalk.red(`  ❌ Failed to fix: ${path.relative(projectPath, filePath)}`));
          }
        } catch (error) {
          failed++;
          console.log(chalk.red(`  ❌ Error fixing: ${path.relative(projectPath, filePath)}`));
        }
      }
    }
    
    return { fixed, failed };
  }

  private validateFile(filePath: string, projectPath: string, errors: string[]) {
    const fullPath = path.join(projectPath, filePath);
    const fileName = path.basename(filePath);
    
    for (const rule of this.rules) {
      if (rule.pattern.test(fileName)) {
        const fileDir = path.dirname(filePath);
        const isValidLocation = rule.allowedDirectories.some(allowedDir => {
          if (allowedDir === 'root') {
            return fileDir === '.';
          }
          return fileDir === allowedDir || fileDir.startsWith(allowedDir + '/');
        });
        
        if (!isValidLocation) {
          errors.push(`${filePath}: ${rule.description}`);
        }
      }
    }
  }

  displayValidationResults(results: { isValid: boolean; errors: string[] }) {
    if (results.isValid) {
      console.log(chalk.green('✅ Project structure is valid!'));
    } else {
      console.log(chalk.red('❌ Project structure validation failed:'));
      console.log();
      
      for (const error of results.errors) {
        console.log(chalk.red(`  • ${error}`));
      }
      
      console.log();
      console.log(chalk.yellow('💡 Run "tausi clean" to fix common structure issues'));
    }
  }

  displayNonNegotiableResults(results: { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[]; 
    fixable: Array<{ filePath: string; rule: NonNegotiableRule }> 
  }) {
    if (results.isValid && results.warnings.length === 0) {
      console.log(chalk.green('✅ All non-negotiable rules passed!'));
      return;
    }
    
    if (results.errors.length > 0) {
      console.log(chalk.red('❌ Non-negotiable rule violations (ERRORS):'));
      for (const error of results.errors) {
        console.log(chalk.red(`  • ${error}`));
      }
      console.log();
    }
    
    if (results.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Non-negotiable rule violations (WARNINGS):'));
      for (const warning of results.warnings) {
        console.log(chalk.yellow(`  • ${warning}`));
      }
      console.log();
    }
    
    if (results.fixable.length > 0) {
      console.log(chalk.blue(`💡 ${results.fixable.length} issues can be auto-fixed. Run "tausi clean --fix" to apply fixes.`));
    }
  }

  async cleanProject(projectPath: string, applyFixes: boolean = false): Promise<void> {
    console.log(chalk.blue('🧹 Cleaning project structure...'));
    
    // First, check and fix non-negotiable rules if requested
    if (applyFixes) {
      const fixResults = await this.fixNonNegotiableRules(projectPath);
      console.log();
      console.log(chalk.blue(`Fixed ${fixResults.fixed} issues, ${fixResults.failed} failed`));
      console.log();
    }
    
    const suggestions = [
      'Move .md files to docs/ directory',
      'Move database files to backend/src/database/',
      'Move CSS files to frontend/src/styles/',
      'Move images to frontend/public/assets/',
      'Create missing required directories'
    ];
    
    console.log(chalk.gray('Suggested actions:'));
    for (const suggestion of suggestions) {
      console.log(chalk.gray(`  • ${suggestion}`));
    }
    
    // Auto-create missing directories
    const requiredDirs = [
      'frontend',
      'backend', 
      'docs',
      'deployment',
      'frontend/src',
      'frontend/src/components',
      'frontend/src/styles',
      'frontend/src/utils',
      'frontend/public',
      'frontend/public/assets',
      'backend/src',
      'backend/src/routes',
      'backend/src/middleware',
      'backend/src/utils',
      'backend/src/database'
    ];
    
    let created = 0;
    for (const dir of requiredDirs) {
      const dirPath = path.join(projectPath, dir);
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
        console.log(chalk.green(`  ✅ Created directory: ${dir}/`));
        created++;
      }
    }
    
    if (created === 0) {
      console.log(chalk.gray('  All required directories already exist'));
    }
    
    console.log(chalk.green('✨ Project structure cleaned!'));
    
    // Run validation again to show current status
    const validation = this.validateStructure(projectPath);
    const nonNegotiableValidation = this.validateNonNegotiableRules(projectPath);
    
    console.log();
    this.displayValidationResults(validation);
    this.displayNonNegotiableResults(nonNegotiableValidation);
  }

  private detectProjectType(projectPath: string): 'cli-tool' | 'generated-project' {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        
        // Check if this is the Tausi CLI tool itself
        if (packageJson.name === 'tausi' && packageJson.bin) {
          return 'cli-tool';
        }
        
        // Check if this is a generated project (has concurrently script for dev)
        if (packageJson.scripts?.dev?.includes('concurrently')) {
          return 'generated-project';
        }
      } catch (error) {
        // If we can't read package.json, assume it's a generated project
      }
    }
    
    // Default to generated project validation
    return 'generated-project';
  }

  private getValidationRules(projectType: 'cli-tool' | 'generated-project'): ValidationRule[] {
    if (projectType === 'cli-tool') {
      return [
        {
          pattern: /\.md$/,
          allowedDirectories: ['docs', 'root', 'assets'],
          description: 'Markdown files should be in docs/ directory, project root, or assets folder'
        },
        {
          pattern: /\.(js|ts|jsx|tsx)$/,
          allowedDirectories: ['src', 'test', 'gui', 'scripts', 'test-projects'],
          description: 'JavaScript/TypeScript files should be in src/, test/, gui/, scripts/, or test-projects/ directories'
        },
        {
          pattern: /\.(css|scss|sass|less)$/,
          allowedDirectories: ['gui', 'test-projects'],
          description: 'Style files should be in gui/ or test-projects/ directories'
        },
        {
          pattern: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          allowedDirectories: ['assets', 'gui', 'test-projects'],
          description: 'Image files should be in assets/, gui/, or test-projects/ directories'
        },
        {
          pattern: /\.(html|htm)$/,
          allowedDirectories: ['gui', 'test-projects'],
          description: 'HTML files should be in gui/ or test-projects/ directories'
        },
        {
          pattern: /package\.json$/,
          allowedDirectories: ['root', 'test-projects'],
          description: 'Package.json files should be in project root or test-projects directories'
        }
      ];
    }
    
    // Original rules for generated projects
    return [
      {
        pattern: /\.md$/,
        allowedDirectories: ['docs', 'root', 'frontend/public/assets', 'backend/database'],
        description: 'Markdown files should be in docs/ directory, project root, assets folder, or database folder'
      },
      {
        pattern: /\.(sql|db|sqlite)$/,
        allowedDirectories: ['backend', 'backend/src', 'backend/src/database', 'backend/database'],
        description: 'Database files should be in backend directories'
      },
      {
        pattern: /\.(js|ts|jsx|tsx)$/,
        allowedDirectories: ['frontend/src', 'backend/src', 'frontend', 'backend'],
        description: 'JavaScript/TypeScript files should be in src directories'
      },
      {
        pattern: /\.(css|scss|sass|less)$/,
        allowedDirectories: ['frontend/src/styles', 'frontend/src', 'frontend/public'],
        description: 'Style files should be in frontend/src/styles'
      },
      {
        pattern: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        allowedDirectories: ['frontend/public', 'frontend/public/assets', 'frontend/src/assets'],
        description: 'Image files should be in frontend/public/assets'
      },
      {
        pattern: /\.(html|htm)$/,
        allowedDirectories: ['frontend', 'frontend/public'],
        description: 'HTML files should be in frontend directory'
      },
      {
        pattern: /package\.json$/,
        allowedDirectories: ['root', 'frontend', 'backend'],
        description: 'Package.json files should be in project root or frontend/backend directories'
      }
    ];
  }

  private getNonNegotiableRules(projectType: 'cli-tool' | 'generated-project'): NonNegotiableRule[] {
    if (projectType === 'cli-tool') {
      return [
        // Allow console.log in CLI tools and dev files
        {
          check: (filePath: string, content?: string) => {
            if (!content || filePath.includes('test') || filePath.includes('gui') || filePath.includes('dev')) return true;
            return !content.includes('console.log');
          },
          fix: (filePath: string) => {
            try {
              let content = fs.readFileSync(filePath, 'utf-8');
              const hasChanges = content.includes('console.log');
              if (hasChanges && !filePath.includes('test') && !filePath.includes('gui') && !filePath.includes('dev')) {
                content = content.replace(/console\.log\([^)]*\);?\n?/g, '');
                fs.writeFileSync(filePath, content);
              }
              return hasChanges;
            } catch {
              return false;
            }
          },
          description: 'No console.log statements in production code (except test/gui/dev files)',
          severity: 'warning'
        },
        // File size limits (more lenient for CLI)
        {
          check: (filePath: string) => {
            try {
              const stats = fs.statSync(filePath);
              return stats.size < 200 * 1024; // 200KB limit for CLI tools
            } catch {
              return true;
            }
          },
          description: 'Files should not exceed 200KB',
          severity: 'warning'
        },
        // Line length (more lenient for CLI)
        {
          check: (filePath: string, content?: string) => {
            if (!content || !filePath.match(/\.(js|ts|jsx|tsx)$/)) return true;
            const lines = content.split('\n');
            return !lines.some(line => line.length > 200); // 200 chars for CLI
          },
          description: 'Code lines should not exceed 200 characters',
          severity: 'warning'
        }
      ];
    }
    
    // Original strict rules for generated projects
    return [
      // File naming conventions
      {
        check: (filePath: string) => {
          const fileName = path.basename(filePath);
          const dirName = path.dirname(filePath).split('/').pop();
          if (dirName && /[A-Z]/.test(dirName) && !['README', 'LICENSE'].includes(dirName)) {
            return /^[a-z0-9-]+$/.test(dirName);
          }
          return true;
        },
        description: 'Directory names should use kebab-case',
        severity: 'warning'
      },
      // No console.log in production
      {
        check: (filePath: string, content?: string) => {
          if (!content || filePath.includes('test')) return true;
          return !content.includes('console.log');
        },
        fix: (filePath: string) => {
          try {
            let content = fs.readFileSync(filePath, 'utf-8');
            const hasChanges = content.includes('console.log');
            if (hasChanges) {
              content = content.replace(/console\.log\([^)]*\);?\n?/g, '');
              fs.writeFileSync(filePath, content);
            }
            return hasChanges;
          } catch {
            return false;
          }
        },
        description: 'No console.log statements in production code',
        severity: 'error'
      },
      // No TODO/FIXME comments
      {
        check: (filePath: string, content?: string) => {
          if (!content) return true;
          return !/\b(TODO|FIXME|XXX|HACK)\b/i.test(content);
        },
        description: 'No TODO, FIXME, XXX, or HACK comments allowed',
        severity: 'warning'
      },
      // File size limits
      {
        check: (filePath: string) => {
          try {
            const stats = fs.statSync(filePath);
            return stats.size < 100 * 1024; // 100KB limit
          } catch {
            return true;
          }
        },
        description: 'Files should not exceed 100KB',
        severity: 'warning'
      },
      // No unused imports (basic check)
      {
        check: (filePath: string, content?: string) => {
          if (!content || !filePath.match(/\.(js|ts|jsx|tsx)$/)) return true;
          const imports = content.match(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm) || [];
          return imports.length === 0 || !imports.some(imp => {
            const match = imp.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
            if (!match) return false;
            const imported = match[1] || match[2] || match[3];
            if (!imported) return false;
            const names = imported.includes(',') ? imported.split(',').map(n => n.trim()) : [imported.trim()];
            return names.some(name => !content.includes(name.replace(/\s*as\s+\w+/, '').trim()));
          });
        },
        description: 'No unused imports allowed',
        severity: 'warning'
      },
      // Line length limits
      {
        check: (filePath: string, content?: string) => {
          if (!content || !filePath.match(/\.(js|ts|jsx|tsx)$/)) return true;
          const lines = content.split('\n');
          return !lines.some(line => line.length > 150);
        },
        description: 'Code lines should not exceed 150 characters',
        severity: 'warning'
      },
      // No deep nesting
      {
        check: (filePath: string, content?: string) => {
          if (!content || !filePath.match(/\.(js|ts|jsx|tsx)$/)) return true;
          const lines = content.split('\n');
          let maxIndent = 0;
          for (const line of lines) {
            const indent = line.search(/\S/);
            if (indent > 0) {
              maxIndent = Math.max(maxIndent, Math.floor(indent / 2));
            }
          }
          return maxIndent <= 6; // Max 6 levels of indentation
        },
        description: 'Avoid deep nesting (max 6 levels)',
        severity: 'warning'
      },
      // Bundle-friendly imports
      {
        check: (filePath: string, content?: string) => {
          if (!content || !filePath.match(/\.(js|ts|jsx|tsx)$/)) return true;
          // Check for potential issues with bundlers
          return !content.includes('require(') || content.includes('import(');
        },
        description: 'Use ES6 imports for better bundling',
        severity: 'warning'
      },
      // Consistent quote style
      {
        check: (filePath: string, content?: string) => {
          if (!content || !filePath.match(/\.(js|ts|jsx|tsx)$/)) return true;
          const singleQuotes = (content.match(/'/g) || []).length;
          const doubleQuotes = (content.match(/"/g) || []).length;
          if (singleQuotes === 0 && doubleQuotes === 0) return true;
          return Math.abs(singleQuotes - doubleQuotes) / Math.max(singleQuotes, doubleQuotes) < 0.3;
        },
        fix: (filePath: string) => {
          try {
            let content = fs.readFileSync(filePath, 'utf-8');
            const singleQuotes = (content.match(/'/g) || []).length;
            const doubleQuotes = (content.match(/"/g) || []).length;
            
            if (singleQuotes > doubleQuotes) {
              content = content.replace(/"/g, "'");
            } else {
              content = content.replace(/'/g, '"');
            }
            
            fs.writeFileSync(filePath, content);
            return true;
          } catch {
            return false;
          }
        },
        description: 'Consistent quote style throughout the project',
        severity: 'warning'
      }
    ];
  }
}
