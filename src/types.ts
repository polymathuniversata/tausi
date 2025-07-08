export interface ProjectConfig {
  name: string;
  description: string;
  directory: string;
  author?: string;
  includeAuth?: boolean;
  deployTarget?: 'railway' | 'render' | 'both';
}

export interface TausiProjectStructure {
  frontend: {
    framework: 'vite';
    styling: 'tailwind';
    language: 'vanilla-js';
  };
  backend: {
    framework: 'express';
    language: 'javascript';
  };
  auth: {
    provider: 'firebase';
    enabled: boolean;
  };
  deployment: {
    targets: Array<'railway' | 'render'>;
  };
  docs: {
    architecture: boolean;
    llmFriendly: boolean;
  };
}
