#!/usr/bin/env bun

import { program } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create.ts';
import { validateProject, cleanProject } from './commands/validate.ts';

const version = '1.0.0';

program
  .name('tausi')
  .description('LLM-friendly minimal scaffolding tool for Vite + Tailwind + Express + Firebase stack')
  .version(version);

program
  .command('create')
  .description('Create a new full-stack project')
  .argument('[name]', 'project name')
  .option('-d, --directory <directory>', 'target directory')
  .option('-a, --author <author>', 'project author')
  .option('--no-auth', 'skip Firebase authentication setup')
  .option('--deploy <target>', 'deployment target (railway, render, both)', 'both')
  .action(createProject);

program
  .command('validate')
  .description('Validate project structure and file locations')
  .argument('[directory]', 'project directory to validate', '.')
  .action(validateProject);

program
  .command('clean')
  .description('Clean and fix project structure issues')
  .argument('[directory]', 'project directory to clean', '.')
  .option('--fix', 'automatically fix common issues', false)
  .action((directory, options) => cleanProject(directory, options.fix));

program
  .command('info')
  .description('Show information about the generated project structure')
  .action(() => {
    console.log(chalk.blue('🏗️  Tausi Project Structure'));
    console.log(chalk.gray('├── frontend/    (Vite + Tailwind + Vanilla JS)'));
    console.log(chalk.gray('├── backend/     (Express.js + CORS)'));
    console.log(chalk.gray('├── docs/        (Architecture + LLM-friendly docs)'));
    console.log(chalk.gray('└── deployment/  (Railway & Render configs)'));
    console.log();
    console.log(chalk.green('Tech Stack:'));
    console.log(chalk.gray('• Frontend: Vite, Tailwind CSS, Vanilla JS'));
    console.log(chalk.gray('• Backend: Express.js, CORS'));
    console.log(chalk.gray('• Auth: Firebase (optional)'));
    console.log(chalk.gray('• Deploy: Railway, Render'));
    console.log(chalk.gray('• Docs: LLM-optimized architecture docs'));
  });

program.parse();
