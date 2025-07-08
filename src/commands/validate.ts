import path from 'path';
import { ProjectValidator } from '../utils/validator.ts';

export async function validateProject(directory: string) {
  const validator = new ProjectValidator();
  const projectPath = path.resolve(directory);
  
  console.log(`🔍 Validating project at: ${projectPath}`);
  console.log();
  
  const results = validator.validateStructure(projectPath);
  const nonNegotiableResults = validator.validateNonNegotiableRules(projectPath);
  
  validator.displayValidationResults(results);
  validator.displayNonNegotiableResults(nonNegotiableResults);
}

export async function cleanProject(directory: string, applyFixes: boolean = false) {
  const validator = new ProjectValidator();
  const projectPath = path.resolve(directory);
  
  console.log(`🧹 Cleaning project at: ${projectPath}`);
  console.log();
  
  await validator.cleanProject(projectPath, applyFixes);
}
