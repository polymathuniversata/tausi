# 🦋 Tausi

LLM-friendly minimal scaffolding tool for full-stack web applications. Tausi generates clean, production-ready projects with your exact tech stack: Vite + Tailwind + Express + Firebase.

## ✨ Features

- 🚀 **Minimal & Fast**: Only essential dependencies, no bloat
- � **Opinionated Stack**: Vite + Tailwind + Express + Firebase
- � **LLM-Optimized**: Clear structure, predictable patterns
- � **Deploy Ready**: Railway & Render configurations included
- � **Security First**: CORS and Firebase Auth built-in
- 📖 **Rich Documentation**: Architecture docs for humans and LLMs

## 🏗️ Generated Project Structure

```
your-project/
├── frontend/           # Vite + Tailwind + Vanilla JS
├── backend/            # Express.js + CORS
├── docs/               # Architecture + LLM context
└── deployment/         # Railway & Render configs
```

## 🚀 Installation

```bash
# Install globally
bun install -g tausi

# Or run directly with bunx
bunx tausi
```

## 📖 Usage

### CLI Usage (For Developers)

```bash
# Create a new project
tausi create my-app

# Create project without authentication
tausi create my-app --no-auth

# Deploy to specific platform
tausi create my-app --deploy railway

# Custom author and directory
tausi create my-app --author "Your Name" --directory ./custom-path

# Validate existing project structure
tausi validate ./my-project

# Clean/fix project structure
tausi clean ./my-project
```

### GUI Usage (For Non-Coders)

```bash
# Start the visual interface
bun run gui

# Then open http://localhost:3001 in your browser
```

The GUI provides a step-by-step wizard to create projects without any command-line knowledge.

## 🛠️ Tech Stack

**Frontend:**
- Vite (build tool)
- Tailwind CSS (styling)
- Vanilla JavaScript (no framework bloat)

**Backend:**
- Express.js (web framework)
- CORS (security)
- Firebase Admin (authentication)

**Deployment:**
- Railway (preferred)
- Render (alternative)
- Docker (containerization)

## 🚀 Generated Project Features

- **🎨 Enhanced UI** - ELabs logo and tech stack showcase
- **🔒 Security First** - Helmet, rate limiting, input validation
- **⚡ Zero-config setup** - Works out of the box
- **🔥 Hot reload** - Frontend and backend development servers
- **📝 Type safety** - JSDoc comments for better IntelliSense
- **🛡️ Runtime validation** - Enforces clean project structure
- **📚 Documentation** - Architecture and deployment guides
- **🤖 LLM Context** - Optimized for AI-assisted development

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build the project
bun run build

# Run tests
bun test

# Lint code
bun run lint

# Format code
bun run format
```

## 📁 Project Structure

```
tausi/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── types.ts            # TypeScript types
│   ├── commands/           # CLI commands
│   │   └── create.ts       # Create project command
│   └── generators/         # Project generators
│       └── project-generator.ts
├── test/                   # Test files
└── dist/                   # Built files
```

## 🎯 Design Philosophy

- **Minimal dependencies** - Only what you actually need
- **LLM-friendly** - Clear, predictable structure for AI assistance
- **Production-ready** - Security, performance, and deployment built-in
- **No framework lock-in** - Vanilla JS keeps things simple
- **Documentation-first** - Every project includes comprehensive docs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh/)
- CLI powered by [Commander.js](https://github.com/tj/commander.js)
- Beautiful prompts with [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
- Colorful output with [Chalk](https://github.com/chalk/chalk)
