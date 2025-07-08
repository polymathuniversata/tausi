import fs from 'fs';
import path from 'path';
import { ProjectConfig } from '../types.ts';

export class ProjectGenerator {
  private config: ProjectConfig;

  constructor(config: ProjectConfig) {
    this.config = config;
  }

  async generate() {
    // Create root directory
    await this.createDirectory(this.config.directory);

    // Create main project structure
    await this.createProjectStructure();
    
    // Generate frontend
    await this.generateFrontend();
    
    // Generate backend
    await this.generateBackend();
    
    // Generate documentation
    await this.generateDocs();
    
    // Generate deployment configs
    await this.generateDeployment();
    
    // Generate root files
    await this.generateRootFiles();
  }

  private async createDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  private async createProjectStructure() {
    const dirs = [
      'frontend',
      'backend',
      'docs',
      'deployment'
    ];

    for (const dir of dirs) {
      await this.createDirectory(path.join(this.config.directory, dir));
    }
  }

  private async generateFrontend() {
    const frontendDir = path.join(this.config.directory, 'frontend');
    
    // Create frontend subdirectories
    await this.createDirectory(path.join(frontendDir, 'src'));
    await this.createDirectory(path.join(frontendDir, 'src', 'styles'));
    await this.createDirectory(path.join(frontendDir, 'src', 'components'));
    await this.createDirectory(path.join(frontendDir, 'src', 'utils'));
    await this.createDirectory(path.join(frontendDir, 'public'));
    await this.createDirectory(path.join(frontendDir, 'public', 'assets'));
    await this.createDirectory(path.join(frontendDir, 'public', 'assets', 'logos'));
    
    // Package.json
    await this.writeFile(path.join(frontendDir, 'package.json'), this.getFrontendPackageJson());
    
    // Environment example
    await this.writeFile(path.join(frontendDir, '.env.example'), this.getFrontendEnvExample());
    
    // Vite config
    await this.writeFile(path.join(frontendDir, 'vite.config.js'), this.getViteConfig());
    
    // Tailwind config
    await this.writeFile(path.join(frontendDir, 'tailwind.config.js'), this.getTailwindConfig());
    
    // PostCSS config
    await this.writeFile(path.join(frontendDir, 'postcss.config.js'), this.getPostcssConfig());
    
    // HTML entry point
    await this.writeFile(path.join(frontendDir, 'index.html'), this.getIndexHtml());
    
    // Main JS file
    await this.writeFile(path.join(frontendDir, 'src', 'main.js'), this.getMainJs());
    
    // Tailwind CSS
    await this.writeFile(path.join(frontendDir, 'src', 'styles', 'main.css'), this.getTailwindCss());
    
    // Sample component
    await this.writeFile(path.join(frontendDir, 'src', 'components', 'App.js'), this.getAppComponent());
    
    // Utils - temporarily disabled
    if (this.config.includeAuth) {
      // await this.writeFile(path.join(frontendDir, 'src', 'utils', 'auth.js'), this.getAuthUtils());
    }
    // await this.writeFile(path.join(frontendDir, 'src', 'utils', 'api.js'), this.getApiUtils());
    
    // Copy ELabs logo
    await this.copyELabsLogo(path.join(frontendDir, 'public', 'assets', 'logos', 'elabs-logo-transparent.png'));
    await this.writeFile(path.join(frontendDir, 'public', 'assets', 'README.md'), this.getAssetsReadme());
  }

  private async generateBackend() {
    const backendDir = path.join(this.config.directory, 'backend');
    
    // Create backend subdirectories
    await this.createDirectory(path.join(backendDir, 'src'));
    await this.createDirectory(path.join(backendDir, 'src', 'routes'));
    await this.createDirectory(path.join(backendDir, 'src', 'middleware'));
    await this.createDirectory(path.join(backendDir, 'src', 'utils'));
    await this.createDirectory(path.join(backendDir, 'src', 'models'));
    await this.createDirectory(path.join(backendDir, 'database'));
    
    // Package.json
    await this.writeFile(path.join(backendDir, 'package.json'), this.getBackendPackageJson());
    
    // Environment example
    await this.writeFile(path.join(backendDir, '.env.example'), this.getBackendEnvExample());
    
    // Main server file
    await this.writeFile(path.join(backendDir, 'src', 'server.js'), this.getServerJs());
    
    // Routes
    await this.writeFile(path.join(backendDir, 'src', 'routes', 'index.js'), this.getIndexRoutes());
    if (this.config.includeAuth) {
      await this.writeFile(path.join(backendDir, 'src', 'routes', 'auth.js'), this.getAuthRoutes());
    }
    
    // Middleware
    await this.writeFile(path.join(backendDir, 'src', 'middleware', 'cors.js'), this.getCorsMiddleware());
    await this.writeFile(path.join(backendDir, 'src', 'middleware', 'security.js'), this.getSecurityMiddleware());
    
    // Utils
    if (this.config.includeAuth) {
      await this.writeFile(path.join(backendDir, 'src', 'utils', 'firebase.js'), this.getFirebaseUtils());
    }
    await this.writeFile(path.join(backendDir, 'src', 'utils', 'database.js'), this.getDatabaseUtils());
    
    // Models
    await this.writeFile(path.join(backendDir, 'src', 'models', 'User.js'), this.getUserModel());
    
    // Database setup
    await this.writeFile(path.join(backendDir, 'database', 'init.sql'), this.getDatabaseInit());
    await this.writeFile(path.join(backendDir, 'database', 'README.md'), this.getDatabaseReadme());
  }

  private async generateDocs() {
    const docsDir = path.join(this.config.directory, 'docs');
    
    await this.writeFile(path.join(docsDir, 'ARCHITECTURE.md'), this.getArchitectureDoc());
    await this.writeFile(path.join(docsDir, 'DEPLOYMENT.md'), this.getDeploymentDoc());
    await this.writeFile(path.join(docsDir, 'DEVELOPMENT.md'), this.getDevelopmentDoc());
    await this.writeFile(path.join(docsDir, 'LLM_CONTEXT.md'), this.getLlmContextDoc());
  }

  private async generateDeployment() {
    const deploymentDir = path.join(this.config.directory, 'deployment');
    
    if (this.config.deployTarget === 'railway' || this.config.deployTarget === 'both') {
      await this.writeFile(path.join(deploymentDir, 'railway.toml'), this.getRailwayConfig());
    }
    
    if (this.config.deployTarget === 'render' || this.config.deployTarget === 'both') {
      await this.writeFile(path.join(deploymentDir, 'render.yaml'), this.getRenderConfig());
    }
    
    await this.writeFile(path.join(deploymentDir, 'docker-compose.yml'), this.getDockerCompose());
    await this.writeFile(path.join(deploymentDir, 'Dockerfile.frontend'), this.getFrontendDockerfile());
    await this.writeFile(path.join(deploymentDir, 'Dockerfile.backend'), this.getBackendDockerfile());
  }

  private async generateRootFiles() {
    await this.writeFile(path.join(this.config.directory, 'README.md'), this.getReadme());
    await this.writeFile(path.join(this.config.directory, '.gitignore'), this.getGitignore());
    await this.writeFile(path.join(this.config.directory, 'package.json'), this.getRootPackageJson());
  }

  private async writeFile(filePath: string, content: string) {
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  private async copyELabsLogo(targetPath: string) {
    const sourcePath = path.join(__dirname, '../../assets/ELabs Logo Transparent.png');
    try {
      await fs.promises.copyFile(sourcePath, targetPath);
    } catch (error) {
      // If the source logo doesn't exist, create a placeholder
      console.warn('ELabs logo not found, creating placeholder');
      await this.writeFile(targetPath, '');
    }
  }

  // Template methods for different files
  private getFrontendPackageJson() {
    return JSON.stringify({
      name: `${this.config.name}-frontend`,
      version: '1.0.0',
      description: `Frontend for ${this.config.name}`,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: this.config.includeAuth ? {
        firebase: '^10.0.0'
      } : {},
      devDependencies: {
        vite: '^5.0.0',
        tailwindcss: '^3.4.0',
        autoprefixer: '^10.4.0',
        postcss: '^8.4.0'
      }
    }, null, 2);
  }

  private getBackendPackageJson() {
    const deps: any = {
      express: '^4.18.0',
      cors: '^2.8.5',
      dotenv: '^16.0.0',
      helmet: '^7.0.0',
      'express-rate-limit': '^7.0.0',
      'express-validator': '^7.0.0',
      sqlite3: '^5.1.0',
      'better-sqlite3': '^9.0.0'
    };

    if (this.config.includeAuth) {
      deps['firebase-admin'] = '^12.0.0';
    }

    return JSON.stringify({
      name: `${this.config.name}-backend`,
      version: '1.0.0',
      description: `Backend for ${this.config.name}`,
      type: 'module',
      main: 'src/server.js',
      scripts: {
        start: 'node src/server.js',
        dev: 'node --watch src/server.js'
      },
      dependencies: deps
    }, null, 2);
  }

  private getViteConfig() {
    return `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`;
  }

  private getTailwindConfig() {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  }

  private getPostcssConfig() {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

  private getIndexHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.name}</title>
    <link rel="stylesheet" href="/src/styles/main.css">
    <link rel="icon" type="image/png" href="/public/assets/logos/elabs-logo-transparent.png">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>`;
  }

  private getMainJs() {
    return `import './styles/main.css';
import { App } from './components/App.js';
${this.config.includeAuth ? "import { initAuth } from './utils/auth.js';" : ''}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    const app = new App(appElement);
    app.render();
    
    ${this.config.includeAuth ? 'initAuth();' : ''}
});`;
  }

  private getTailwindCss() {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans antialiased;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-gray-500;
  }
  
  .card {
    @apply bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1;
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .tech-icon {
    @apply w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.bg-mesh {
  background-color: #f8fafc;
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(99, 102, 241, 0.05) 2px, transparent 0),
    radial-gradient(circle at 75px 75px, rgba(168, 85, 247, 0.05) 2px, transparent 0);
  background-size: 100px 100px;
}`;
  }

  private getAppComponent() {
    return `export class App {
    constructor(element) {
        this.element = element;
    }
    
    render() {
        this.element.innerHTML = \`
            <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                <!-- Header -->
                <header class="relative overflow-hidden">
                    <div class="gradient-bg">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div class="flex justify-between items-center py-8">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                            <span class="text-white font-bold text-sm">E</span>
                                        </div>
                                    </div>
                                    <h1 class="ml-4 text-3xl font-bold text-white">${this.config.name}</h1>
                                </div>
                                <div class="text-white/80 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    Built with Tausi
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                </header>

                <!-- Hero Section -->
                <section class="relative py-20">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div class="animate-float">
                            <h2 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                Welcome to <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${this.config.name}</span>
                            </h2>
                        </div>
                        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                            A modern full-stack application built with the latest technologies and best practices.
                        </p>
                        
                        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button class="btn btn-primary" onclick="this.handleGetStarted()">
                                🚀 Get Started
                            </button>
                            <button class="btn btn-secondary" onclick="this.handleViewDocs()">
                                📚 View Documentation
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Tech Stack Section -->
                <section class="py-20">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="text-center mb-16">
                            <h3 class="text-3xl font-bold text-gray-900 mb-4">Modern Tech Stack</h3>
                            <p class="text-lg text-gray-600">Built with cutting-edge technologies for optimal performance</p>
                        </div>
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div class="card p-8 text-center group">
                                <div class="tech-icon bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 256 257" class="w-8 h-8 text-white">
                                        <path fill="currentColor" d="m255.569 84.452-.024.255V85c.198 1.37.353 2.76.353 4.17 0 23.564-19.133 42.938-42.346 42.938-23.213 0-42.346-19.374-42.346-42.938 0-23.564 19.133-42.938 42.346-42.938.927 0 1.835.04 2.729.103.467.033.92.078 1.372.122V84.452Zm-124.64-27.012c30.906 0 56.024 25.356 56.024 56.56s-25.118 56.56-56.024 56.56c-30.906 0-56.024-25.356-56.024-56.56s25.118-56.56 56.024-56.56ZM40.014 58.621c16.503 0 29.878 13.494 29.878 30.157S56.517 118.935 40.014 118.935 10.136 105.441 10.136 88.778s13.375-30.157 29.878-30.157Z"/>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Vite</h4>
                                <p class="text-sm text-gray-600">Lightning fast build tool</p>
                            </div>

                            <div class="card p-8 text-center group">
                                <div class="tech-icon bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 256 154" class="w-8 h-8 text-white">
                                        <path fill="currentColor" d="M227.4 96.8c-4-1.4-8.2-2.4-12.6-3.1 4.6-10.6 8.2-21.9 10.6-33.7H195c-3.6 20.2-10.4 39.6-20.1 57.1 1.4.8 2.8 1.6 4.1 2.5 11.5 7.5 19.8 18.1 23.5 30 0 .1.1.2.1.3.1.3.1.5.2.8v.1c.1.5.2 1 .2 1.5 0 .3 0 .5.1.8v.2c0 .6.1 1.2.1 1.9 0 7.8-2.7 15.4-7.7 21.8-5 6.4-12 11.4-20.1 14.4-8.1 3-17 4.1-25.8 3.2-8.8-.9-17.3-3.8-24.6-8.4-7.3-4.6-13.3-10.8-17.3-18.2-4-7.4-5.9-15.7-5.5-24.1.4-8.4 3.1-16.6 7.8-23.7 4.7-7.1 11.3-12.9 19-16.8 7.7-3.9 16.3-5.8 24.9-5.5h.2c8.6.3 17 2.8 24.4 7.2l7.9-13.6c-9.3-5.6-19.7-8.8-30.4-9.4h-.3c-10.7-.6-21.5 1.3-31.4 5.5-9.9 4.2-18.6 10.5-25.3 18.3-6.7 7.8-11.2 17-13.1 26.8-1.9 9.8-1.3 20 1.7 29.4 3 9.4 8.1 18.1 14.8 25.4 6.7 7.3 14.9 13 24 16.6 9.1 3.6 19 5 28.9 4.1 9.9-.9 19.5-4.1 27.9-9.3 8.4-5.2 15.4-12.3 20.4-20.7 5-8.4 7.8-17.8 8.1-27.4.3-9.6-1.8-19.2-6.1-27.8-4.3-8.6-10.7-16-18.4-21.6z"/>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Tailwind CSS</h4>
                                <p class="text-sm text-gray-600">Utility-first CSS framework</p>
                            </div>

                            <div class="card p-8 text-center group">
                                <div class="tech-icon bg-gradient-to-br from-green-500 to-emerald-500 group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 256 256" class="w-8 h-8 text-white">
                                        <path fill="currentColor" d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm0 233.7c-58.2 0-105.7-47.5-105.7-105.7S69.8 22.3 128 22.3s105.7 47.5 105.7 105.7-47.5 105.7-105.7 105.7z"/>
                                        <path fill="currentColor" d="M93.4 126.5h38.9v-17.8H93.4v17.8zm0 26.7h38.9v-17.8H93.4v17.8zm0 26.7h38.9v-17.8H93.4v17.8z"/>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Express.js</h4>
                                <p class="text-sm text-gray-600">Fast Node.js framework</p>
                            </div>

                            <div class="card p-8 text-center group">
                                <div class="tech-icon bg-gradient-to-br from-blue-600 to-blue-800 group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 256 256" class="w-8 h-8 text-white">
                                        <path fill="currentColor" d="M128 0L0 73.143v109.714L128 256l128-73.143V73.143L128 0zm0 232.727L23.273 164.571V91.429L128 23.273l104.727 68.156v73.142L128 232.727z"/>
                                        <path fill="currentColor" d="M176 112h-32v32h32v-32zm-64 0H80v32h32v-32z"/>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">SQLite</h4>
                                <p class="text-sm text-gray-600">Lightweight database</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="text-center mb-16">
                            <h3 class="text-3xl font-bold text-gray-900 mb-4">Key Features</h3>
                            <p class="text-lg text-gray-600">Everything you need to build modern applications</p>
                        </div>
                        
                        <div class="grid md:grid-cols-3 gap-8">
                            <div class="card p-8">
                                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <h4 class="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h4>
                                <p class="text-gray-600">Built with Vite for instant hot module replacement and optimized builds.</p>
                            </div>

                            <div class="card p-8">
                                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h4 class="text-xl font-semibold text-gray-900 mb-3">Secure by Default</h4>
                                <p class="text-gray-600">Enterprise-grade security with Helmet.js, CORS, and rate limiting.</p>
                            </div>

                            <div class="card p-8">
                                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                                    </svg>
                                </div>
                                <h4 class="text-xl font-semibold text-gray-900 mb-3">Production Ready</h4>
                                <p class="text-gray-600">Docker support, environment configuration, and deployment guides included.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Footer -->
                <footer class="bg-gray-900 text-white py-16">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            <div class="mb-8 lg:mb-0">
                                <div class="flex items-center mb-4">
                                    <svg width="40" height="40" viewBox="0 0 100 100" class="mr-3">
                                        <defs>
                                            <linearGradient id="emertech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stop-color="#3B82F6"/>
                                                <stop offset="50%" stop-color="#8B5CF6"/>
                                                <stop offset="100%" stop-color="#F59E0B"/>
                                            </linearGradient>
                                        </defs>
                                        <rect width="100" height="100" rx="20" fill="url(#emertech-gradient)"/>
                                        <text x="50" y="65" text-anchor="middle" fill="white" font-family="Arial Black, sans-serif" font-size="48" font-weight="900">E</text>
                                    </svg>
                                    <div>
                                        <h3 class="text-lg font-bold">Emertech Labs</h3>
                                        <p class="text-gray-400 text-sm">Building the future, today</p>
                                    </div>
                                </div>
                                <p class="text-gray-400 max-w-md">
                                    Powered by Tausi - A modern full-stack generator for building production-ready applications.
                                </p>
                            </div>
                            
                            ${this.config.includeAuth || this.config.deployTarget ? `
                            <div class="flex flex-col space-y-3">
                                <div class="text-sm text-gray-300 font-medium mb-2">Project Status</div>
                                <div class="flex flex-col space-y-2">
                                    ${this.config.includeAuth ? `
                                    <div class="flex items-center text-gray-400">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                        </svg>
                                        Firebase Auth Enabled
                                    </div>
                                    ` : ''}
                                    ${this.config.deployTarget === 'railway' || this.config.deployTarget === 'both' ? `
                                    <div class="flex items-center text-gray-400">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13.5 3L4 22h7l9.5-19h-7z"/>
                                        </svg>
                                        Railway Ready
                                    </div>
                                    ` : ''}
                                    ${this.config.deployTarget === 'render' || this.config.deployTarget === 'both' ? `
                                    <div class="flex items-center text-gray-400">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M8 12h8M12 8v8"/>
                                        </svg>
                                        Render Ready
                                    </div>
                                    ` : ''}
                                    <div class="flex items-center text-gray-400">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13.5 22.1c1.9-2.3 2.3-6.1 2.3-9.6 0-3.5-.4-7.3-2.3-9.6C11.6.6 9.8 0 8 0S4.4.6 2.5 2.9C.6 5.2.2 9 .2 12.5c0 3.5.4 7.3 2.3 9.6C4.4 24.4 6.2 25 8 25s3.6-.6 5.5-2.9zM8 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                                        </svg>
                                        Docker Ready
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </footer>
            </div>
        \`;
        
        this.attachEventListeners();
    }

    attachEventListeners() {
        const buttons = this.element.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent.includes('Get Started')) {
                button.onclick = () => this.handleGetStarted();
            } else if (button.textContent.includes('Documentation')) {
                button.onclick = () => this.handleViewDocs();
            }
        });
    }

    handleGetStarted() {
        alert('🚀 Welcome! Your application is ready to customize:\\\\n\\\\n• Explore the API at /api\\\\n• Read documentation in /docs\\\\n• Customize components in /frontend/src\\\\n• Modify styles in /frontend/src/styles\\\\n\\\\nHappy coding!');
    }
    
    handleViewDocs() {
        alert('📚 Check the /docs folder for comprehensive documentation including:\\\\n\\\\n• ARCHITECTURE.md - System overview\\\\n• DEVELOPMENT.md - Development guide\\\\n• DEPLOYMENT.md - Deployment instructions\\\\n• LLM_CONTEXT.md - AI-friendly context');
    }
}`;
  }

  private getServerJs() {
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { securityMiddleware } from './middleware/security.js';
import indexRoutes from './routes/index.js';
import dbManager from './utils/database.js';
${this.config.includeAuth ? "import authRoutes from './routes/auth.js';" : ''}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(securityMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', indexRoutes);
${this.config.includeAuth ? "app.use('/api/auth', authRoutes);" : ''}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.status(500).json({ 
            error: 'Something went wrong!',
            message: err.message,
            stack: err.stack
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
    console.log(\`🔒 Security features enabled\`);
    console.log(\`📊 Rate limiting: 100 requests per 15 minutes\`);
});`;
  }

  private getIndexRoutes() {
    return `import express from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to ${this.config.name} API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api',
            users: '/api/users'
        }
    });
});

router.get('/status', (req, res) => {
    res.json({
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// User routes for demonstration
router.get('/users', async (req, res) => {
    try {
        const users = User.findAll();
        res.json({ users: users.map(user => user.toJSON()) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = User.findById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/users', [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, name } = req.body;
        
        // Check if user already exists
        const existingUser = User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const user = User.create({ email, name });
        if (user) {
            res.status(201).json({ user: user.toJSON() });
        } else {
            res.status(500).json({ error: 'Failed to create user' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

export default router;`;
  }

  private getSecurityMiddleware() {
    return `import { body, validationResult } from 'express-validator';

// Input validation middleware
export const validateInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Security headers middleware
export const securityMiddleware = (req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
};

// Common validation rules
export const commonValidations = {
    email: body('email').isEmail().normalizeEmail(),
    password: body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    name: body('name').isLength({ min: 2, max: 50 }).trim().escape(),
    id: body('id').isUUID(),
};

// Sanitize input middleware
export const sanitizeInput = (req, res, next) => {
    // Remove potentially dangerous characters
    const sanitize = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/<script[^>]*>.*?<\\/script>/gi, '');
                obj[key] = obj[key].replace(/<[^>]*>?/gm, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    
    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);
    
    next();
};`;
  }

  private getAuthRoutes() {
    return `import express from 'express';
import { verifyToken } from '../utils/firebase.js';

const router = express.Router();

router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const decodedToken = await verifyToken(token);
        res.json({ 
            success: true, 
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;`;
  }

  private getCorsMiddleware() {
    return `import cors from 'cors';

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);`;
  }

  private getFirebaseUtils() {
    return `import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export async function verifyToken(token) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export const adminAuth = admin.auth();`;
  }

  private getArchitectureDoc() {
    return `# ${this.config.name} - Architecture

## Overview
${this.config.description}

## Tech Stack
- **Frontend**: Vite + Tailwind CSS + Vanilla JavaScript
- **Backend**: Express.js + CORS
- **Database**: SQLite with better-sqlite3
- **Authentication**: ${this.config.includeAuth ? 'Firebase Auth' : 'None'}
- **Deployment**: ${this.config.deployTarget}

## Project Structure
\`\`\`
${this.config.name}/
├── frontend/           # Vite-based frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── styles/     # Tailwind CSS
│   │   └── utils/      # Utility functions
│   ├── index.html      # Entry point
│   └── package.json
├── backend/            # Express.js API
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Express middleware
│   │   ├── models/     # Database models
│   │   └── utils/      # Backend utilities
│   ├── database/       # SQLite database and schema
│   └── package.json
├── docs/               # Documentation
└── deployment/         # Deployment configs
\`\`\`

## Key Design Principles
1. **Minimal Dependencies**: Only essential packages
2. **LLM-Friendly**: Clear, predictable structure
3. **Deployment Ready**: Pre-configured for Railway/Render
4. **Security First**: CORS and authentication built-in

## API Endpoints
- \`GET /health\` - Health check
- \`GET /api/\` - API info
- \`GET /api/status\` - API status
- \`GET /api/users\` - List users
- \`POST /api/users\` - Create user
${this.config.includeAuth ? '- `POST /api/auth/verify` - Verify Firebase token' : ''}

## Environment Variables
\`\`\`
PORT=8000
FRONTEND_URL=http://localhost:3000
${this.config.includeAuth ? 'FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>' : ''}
\`\`\``;
  }

  private getDeploymentDoc() {
    return `# Deployment Guide

## ${this.config.deployTarget === 'railway' ? 'Railway' : this.config.deployTarget === 'render' ? 'Render' : 'Railway & Render'} Deployment

### Prerequisites
- Git repository
- ${this.config.includeAuth ? 'Firebase project setup' : 'No additional setup needed'}

### Railway Deployment
${this.config.deployTarget === 'railway' || this.config.deployTarget === 'both' ? `
1. Connect your repository to Railway
2. Create two services:
   - Frontend: \`cd frontend && npm run build\`
   - Backend: \`cd backend && npm start\`
3. Set environment variables in Railway dashboard
4. Deploy!
` : 'Not configured for Railway'}

### Render Deployment
${this.config.deployTarget === 'render' || this.config.deployTarget === 'both' ? `
1. Connect your repository to Render
2. Create services according to render.yaml
3. Set environment variables in Render dashboard
4. Deploy!
` : 'Not configured for Render'}

### Local Development
\`\`\`bash
# Install dependencies
bun install

# Start development servers
bun run dev
\`\`\`

### Environment Variables
Create \`.env\` files in both frontend and backend directories:

**Backend (.env):**
\`\`\`
PORT=8000
FRONTEND_URL=http://localhost:3000
${this.config.includeAuth ? 'FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>' : ''}
\`\`\`

**Frontend (.env):**
\`\`\`
VITE_API_URL=http://localhost:8000
${this.config.includeAuth ? 'VITE_FIREBASE_CONFIG=<your-firebase-config-json>' : ''}
\`\`\``;
  }

  private getDevelopmentDoc() {
    return `# Development Guide

## Getting Started

### Prerequisites
- Bun (recommended) or Node.js
- Git

### Installation
\`\`\`bash
# Clone and install
git clone <your-repo>
cd ${this.config.name}
bun install

# Start development
bun run dev
\`\`\`

## Development Scripts
- \`bun run dev\` - Start both frontend and backend
- \`bun run build\` - Build for production
- \`bun run frontend\` - Start only frontend
- \`bun run backend\` - Start only backend

## Project Structure
- Keep components small and focused
- Use Tailwind utility classes
- Follow naming conventions
- Write clear commit messages

## Adding Features
1. Create feature branch
2. Implement changes
3. Test locally
4. Submit PR

## Security Notes
- CORS is configured for localhost:3000
- ${this.config.includeAuth ? 'Firebase tokens are verified server-side' : 'No authentication configured'}
- Environment variables are gitignored

## Troubleshooting
- Check console for errors
- Verify API endpoints are correct
- Ensure CORS settings match your setup
- Check environment variables`;
  }

  private getLlmContextDoc() {
    return `# LLM Context for ${this.config.name}

## Quick Context
This is a full-stack web application built with:
- **Frontend**: Vite + Tailwind CSS + Vanilla JavaScript
- **Backend**: Express.js
- **Auth**: ${this.config.includeAuth ? 'Firebase' : 'None'}
- **Deploy**: ${this.config.deployTarget}

## File Structure Context
\`\`\`
frontend/src/main.js        # Frontend entry point
frontend/src/components/    # UI components
backend/src/server.js       # Backend entry point
backend/src/routes/         # API routes
\`\`\`

## Key Files to Understand
1. \`frontend/src/main.js\` - App initialization
2. \`backend/src/server.js\` - Express server setup
3. \`frontend/vite.config.js\` - Build configuration
4. \`backend/src/middleware/cors.js\` - Security configuration

## Common Tasks
- **Add new route**: Create in \`backend/src/routes/\`
- **Add new component**: Create in \`frontend/src/components/\`
- **Style changes**: Use Tailwind classes in \`frontend/src/styles/\`
- **API calls**: Use utilities in \`frontend/src/utils/api.js\`

## Environment Setup
- Frontend runs on port 3000
- Backend runs on port 8000
- API proxy configured in Vite

## Deployment Context
- Uses Railway/Render for hosting
- Docker configs available in \`deployment/\`
- Environment variables defined in docs

## LLM Instructions
When working with this codebase:
1. Always check the current file structure
2. Use established patterns from existing code
3. Keep dependencies minimal
4. Follow Tailwind utility-first approach
5. Maintain clear separation between frontend/backend
6. Use vanilla JavaScript - no frameworks`;
  }

  private getRailwayConfig() {
    return `[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "frontend"
source = "frontend"
domains = ["your-app.railway.app"]

[services.build]
buildCommand = "npm run build"

[services.deploy]
startCommand = "npm run preview"

[[services]]
name = "backend"
source = "backend"

[services.deploy]
startCommand = "npm start"`;
  }

  private getRenderConfig() {
    return `services:
  - type: web
    name: ${this.config.name}-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    
  - type: web
    name: ${this.config.name}-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: PORT
        value: 10000
      - key: FRONTEND_URL
        value: https://${this.config.name}-frontend.onrender.com`;
  }

  private getDockerCompose() {
    return `version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: deployment/Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    
  backend:
    build:
      context: .
      dockerfile: deployment/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - FRONTEND_URL=http://localhost:3000
    ${this.config.includeAuth ? '    env_file:\n      - backend/.env' : ''}`;
  }

  private getFrontendDockerfile() {
    return `FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
  }

  private getBackendDockerfile() {
    return `FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

EXPOSE 8000

CMD ["npm", "start"]`;
  }

  private getReadme() {
    return `# ${this.config.name}

${this.config.description}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
bun install

# Start development servers
bun run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🏗️ Project Structure

\`\`\`
├── frontend/           # Vite + Tailwind + Vanilla JS
├── backend/            # Express.js API
├── docs/               # Architecture & deployment docs
└── deployment/         # Railway & Render configs
\`\`\`

## 🛠️ Tech Stack

- **Frontend**: Vite, Tailwind CSS, Vanilla JavaScript
- **Backend**: Express.js, CORS
- **Authentication**: ${this.config.includeAuth ? 'Firebase' : 'None'}
- **Deployment**: ${this.config.deployTarget}

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [LLM Context](docs/LLM_CONTEXT.md)

## 🚀 Deployment

This project is ready to deploy to:
${this.config.deployTarget === 'railway' || this.config.deployTarget === 'both' ? '- Railway' : ''}
${this.config.deployTarget === 'render' || this.config.deployTarget === 'both' ? '- Render' : ''}

See [deployment docs](docs/DEPLOYMENT.md) for detailed instructions.

## 🔧 Development

\`\`\`bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Build for production
npm run build
\`\`\`

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using [Tausi](https://github.com/emertech-labs/tausi)`;
  }

  private getGitignore() {
    return `# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*/.env
*/env.local

# Database files
database/*.db
database/*.sqlite
database/*.sqlite3
*/database/*.db
*/database/*.sqlite
*/database/*.sqlite3

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Deployment
.vercel
.netlify

# Firebase
firebase-debug.log
.firebase/`;
  }

  private getFrontendEnvExample() {
    return `# Frontend Environment Variables
# Vite will expose variables prefixed with VITE_ to the browser

# API Base URL
VITE_API_URL=http://localhost:8000

# Firebase Configuration (if using auth)
${this.config.includeAuth ? `VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456` : '# No auth configuration needed'}

# Development settings
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
`;
  }

  private getBackendEnvExample() {
    return `# Backend Environment Variables

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_PATH=database/app.db
DATABASE_INIT_ON_START=true

# Firebase Admin (if using auth)
${this.config.includeAuth ? `FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project","private_key_id":"key-id","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-...@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40your-project.iam.gserviceaccount.com"}` : '# No auth configuration needed'}

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# External Services (add as needed)
# STRIPE_SECRET_KEY=sk_test_...
# SENDGRID_API_KEY=SG....
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_SECRET_ACCESS_KEY=...
`;
  }

  private getAssetsReadme() {
    return `# Assets

## Logos

Place your logo files in this directory:

- \`elabs-logo-transparent.png\` - ELabs logo (transparent background)
- Other logo files as needed

## Usage

The logos are referenced in the application components and can be updated by replacing the files in this directory.

## Recommended Sizes

- Logo: 128x128px (will be resized as needed)
- Favicon: 32x32px

## Supported Formats

- PNG (recommended for transparency)
- SVG (for scalable graphics)
- JPG (for photographs)
`;
  }

  private getRootPackageJson() {
    return JSON.stringify({
      name: this.config.name,
      version: '1.0.0',
      description: this.config.description,
      scripts: {
        dev: 'concurrently "cd frontend && npm run dev" "cd backend && npm run dev"',
        build: 'cd frontend && npm run build',
        start: 'cd backend && npm start',
        frontend: 'cd frontend && npm run dev',
        backend: 'cd backend && npm run dev',
        install: 'cd frontend && npm install && cd ../backend && npm install'
      },
      devDependencies: {
        concurrently: '^8.2.0'
      },
      author: this.config.author || 'Generated by Tausi',
      license: 'MIT'
    }, null, 2);
  }

  private getDatabaseUtils() {
    return `import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

class DatabaseManager {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        try {
            // Create database directory if it doesn't exist
            const dbDir = path.join(process.cwd(), 'database');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Initialize database
            const dbPath = path.join(dbDir, 'app.db');
            this.db = new Database(dbPath);
            
            // Enable foreign keys
            this.db.pragma('foreign_keys = ON');
            
            // Initialize tables
            this.initTables();
            
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    initTables() {
        // Read and execute init.sql
        const initSqlPath = path.join(process.cwd(), 'database', 'init.sql');
        if (fs.existsSync(initSqlPath)) {
            const initSql = fs.readFileSync(initSqlPath, 'utf-8');
            this.db.exec(initSql);
        }
    }

    getDb() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }

    // Helper methods for common operations
    findOne(table, where = {}) {
        const whereClause = Object.keys(where).length > 0 
            ? 'WHERE ' + Object.keys(where).map(key => \`\${key} = ?\`).join(' AND ')
            : '';
        const values = Object.values(where);
        
        const stmt = this.db.prepare(\`SELECT * FROM \${table} \${whereClause} LIMIT 1\`);
        return stmt.get(...values);
    }

    findMany(table, where = {}, limit = null) {
        const whereClause = Object.keys(where).length > 0 
            ? 'WHERE ' + Object.keys(where).map(key => \`\${key} = ?\`).join(' AND ')
            : '';
        const limitClause = limit ? \`LIMIT \${limit}\` : '';
        const values = Object.values(where);
        
        const stmt = this.db.prepare(\`SELECT * FROM \${table} \${whereClause} \${limitClause}\`);
        return stmt.all(...values);
    }

    insert(table, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        const stmt = this.db.prepare(\`INSERT INTO \${table} (\${columns}) VALUES (\${placeholders})\`);
        return stmt.run(...values);
    }

    update(table, data, where) {
        const setClause = Object.keys(data).map(key => \`\${key} = ?\`).join(', ');
        const whereClause = Object.keys(where).map(key => \`\${key} = ?\`).join(' AND ');
        const values = [...Object.values(data), ...Object.values(where)];
        
        const stmt = this.db.prepare(\`UPDATE \${table} SET \${setClause} WHERE \${whereClause}\`);
        return stmt.run(...values);
    }

    delete(table, where) {
        const whereClause = Object.keys(where).map(key => \`\${key} = ?\`).join(' AND ');
        const values = Object.values(where);
        
        const stmt = this.db.prepare(\`DELETE FROM \${table} WHERE \${whereClause}\`);
        return stmt.run(...values);
    }
}

// Create singleton instance
const dbManager = new DatabaseManager();

export default dbManager;
export { DatabaseManager };`;
  }

  private getUserModel() {
    return `import dbManager from '../utils/database.js';

export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.email = data.email || '';
        this.name = data.name || '';
        this.createdAt = data.created_at || null;
        this.updatedAt = data.updated_at || null;
    }

    // Static methods for database operations
    static findById(id) {
        const userData = dbManager.findOne('users', { id });
        return userData ? new User(userData) : null;
    }

    static findByEmail(email) {
        const userData = dbManager.findOne('users', { email });
        return userData ? new User(userData) : null;
    }

    static findAll(limit = 100) {
        const usersData = dbManager.findMany('users', {}, limit);
        return usersData.map(userData => new User(userData));
    }

    static create(userData) {
        const now = new Date().toISOString();
        const data = {
            email: userData.email,
            name: userData.name,
            created_at: now,
            updated_at: now
        };

        const result = dbManager.insert('users', data);
        if (result.lastInsertRowid) {
            return User.findById(result.lastInsertRowid);
        }
        return null;
    }

    // Instance methods
    save() {
        const now = new Date().toISOString();
        
        if (this.id) {
            // Update existing user
            const data = {
                email: this.email,
                name: this.name,
                updated_at: now
            };
            
            dbManager.update('users', data, { id: this.id });
            this.updatedAt = now;
        } else {
            // Create new user
            const data = {
                email: this.email,
                name: this.name,
                created_at: now,
                updated_at: now
            };
            
            const result = dbManager.insert('users', data);
            if (result.lastInsertRowid) {
                this.id = result.lastInsertRowid;
                this.createdAt = now;
                this.updatedAt = now;
            }
        }
        
        return this;
    }

    delete() {
        if (this.id) {
            return dbManager.delete('users', { id: this.id });
        }
        return false;
    }

    // Convert to JSON for API responses
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.email || !this.email.includes('@')) {
            errors.push('Valid email is required');
        }
        
        if (!this.name || this.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        return errors;
    }

    isValid() {
        return this.validate().length === 0;
    }
}

export default User;`;
  }

  private getDatabaseInit() {
    return `-- Database initialization script
-- SQLite database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Example table for future use (posts, todos, etc.)
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    user_id INTEGER,
    published BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- Insert sample data (optional)
INSERT OR IGNORE INTO users (email, name, created_at, updated_at) VALUES 
    ('admin@example.com', 'Admin User', datetime('now'), datetime('now')),
    ('user@example.com', 'Test User', datetime('now'), datetime('now'));

-- Add any additional tables or data here
-- This file is executed when the database is first initialized`;
  }

  private getDatabaseReadme() {
    return `# Database

This project uses SQLite as the database, which is perfect for development and small to medium applications.

## Features

- **File-based**: No server setup required
- **Zero configuration**: Works out of the box
- **Fast**: Excellent performance for most use cases
- **Portable**: Database file can be easily moved/backed up

## Files

- \`app.db\` - The SQLite database file (auto-generated)
- \`init.sql\` - Database schema and initial data
- \`../src/utils/database.js\` - Database utilities and helpers
- \`../src/models/User.js\` - Example user model

## Usage

### Database Manager

The database manager provides helper methods for common operations:

\`\`\`javascript
import dbManager from './src/utils/database.js';

// Find single record
const user = dbManager.findOne('users', { email: 'test@example.com' });

// Find multiple records
const users = dbManager.findMany('users', {}, 10); // limit 10

// Insert new record
const result = dbManager.insert('users', {
    email: 'new@example.com',
    name: 'New User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
});

// Update record
dbManager.update('users', 
    { name: 'Updated Name' }, 
    { id: 1 }
);

// Delete record
dbManager.delete('users', { id: 1 });
\`\`\`

### Using Models

Models provide a more object-oriented way to work with data:

\`\`\`javascript
import User from './src/models/User.js';

// Find users
const user = User.findById(1);
const userByEmail = User.findByEmail('test@example.com');
const allUsers = User.findAll();

// Create new user
const newUser = User.create({
    email: 'test@example.com',
    name: 'Test User'
});

// Update user
const user = User.findById(1);
user.name = 'Updated Name';
user.save();

// Delete user
user.delete();
\`\`\`

## Schema Modifications

To modify the database schema:

1. Edit \`init.sql\` with your changes
2. Delete the \`app.db\` file
3. Restart the server (it will recreate the database)

For production, you should implement proper migrations instead of deleting the database.

## Future Database Options

This project is designed to easily support other databases:

- **MongoDB**: Document-based NoSQL
- **PostgreSQL**: Advanced relational database
- **MySQL**: Popular relational database

The model pattern used here can be easily adapted to work with any database system.

## Backup

To backup your database, simply copy the \`app.db\` file to a safe location.

## Production Considerations

For production use, consider:

- Regular database backups
- Database migrations system
- Connection pooling (for other databases)
- Read replicas (for scaling)
- Proper indexing for your queries
`;
  }
}
