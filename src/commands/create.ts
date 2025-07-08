import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { ProjectConfig } from '../types.ts';
import { ProjectGenerator } from '../generators/project-generator.ts';

export async function createProject(name?: string, options?: any) {
  try {
    // Validate project name
    if (!name) {
      console.log(chalk.red('❌ Project name is required'));
      console.log(chalk.gray('Usage: tausi create <project-name>'));
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      console.log(chalk.red('❌ Project name can only contain letters, numbers, hyphens, and underscores'));
      return;
    }

    const projectConfig: ProjectConfig = {
      name,
      description: `${name} - Full-stack application built with Tausi`,
      directory: path.resolve(options?.directory || `./${name}`),
      author: options?.author,
      includeAuth: options?.auth !== false,
      deployTarget: options?.deploy || 'both'
    };

    // Check if directory exists
    if (fs.existsSync(projectConfig.directory)) {
      const isEmpty = (await fs.promises.readdir(projectConfig.directory)).length === 0;
      if (!isEmpty) {
        console.log(chalk.red(`❌ Directory ${projectConfig.directory} is not empty`));
        return;
      }
    }

    // Generate project
    console.log(chalk.blue('🚀 Creating your full-stack project...'));
    console.log(chalk.gray(`📁 Location: ${projectConfig.directory}`));
    console.log(chalk.gray(`🎨 Stack: Vite + Tailwind + Express + ${projectConfig.includeAuth ? 'Firebase' : 'No Auth'}`));
    console.log(chalk.gray(`🚀 Deploy: ${projectConfig.deployTarget}`));
    console.log();

    const generator = new ProjectGenerator(projectConfig);
    await generator.generate();

    // Success message
    console.log(chalk.green('✨ Project created successfully!'));
    console.log();
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.gray(`  cd ${path.relative(process.cwd(), projectConfig.directory)}`));
    console.log(chalk.gray('  bun install'));
    console.log(chalk.gray('  bun run dev'));
    console.log();
    console.log(chalk.gray('📚 Check the docs/ folder for architecture and deployment guides'));

  } catch (error) {
    console.error(chalk.red('❌ Failed to create project:'), error);
  }
}
