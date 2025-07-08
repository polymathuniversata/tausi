# Tausi Examples

## Basic Usage

### Create a minimal project
```bash
tausi create my-app
```

### Create project without authentication
```bash
tausi create simple-app --no-auth
```

### Deploy to Railway only
```bash
tausi create railway-app --deploy railway
```

### Deploy to Render only
```bash
tausi create render-app --deploy render
```

### Custom author and directory
```bash
tausi create custom-app --author "John Doe" --directory ./projects/my-app
```

## Generated Project Structure

After running `tausi create my-app`, you'll get:

```
my-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── App.js          # Main app component
│   │   ├── styles/
│   │   │   └── main.css        # Tailwind CSS
│   │   ├── utils/
│   │   │   ├── api.js          # API utilities
│   │   │   └── auth.js         # Firebase auth (if enabled)
│   │   └── main.js             # Entry point
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind configuration
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.js        # Main routes
│   │   │   └── auth.js         # Auth routes (if enabled)
│   │   ├── middleware/
│   │   │   └── cors.js         # CORS configuration
│   │   ├── utils/
│   │   │   └── firebase.js     # Firebase admin (if enabled)
│   │   └── server.js           # Express server
│   └── package.json            # Backend dependencies
├── docs/
│   ├── ARCHITECTURE.md         # System architecture
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── DEVELOPMENT.md          # Development guide
│   └── LLM_CONTEXT.md          # LLM-friendly context
├── deployment/
│   ├── railway.toml            # Railway configuration
│   ├── render.yaml             # Render configuration
│   ├── docker-compose.yml      # Docker setup
│   ├── Dockerfile.frontend     # Frontend Docker
│   └── Dockerfile.backend      # Backend Docker
├── package.json                # Root package.json
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

## Quick Start Workflow

1. **Create project:**
   ```bash
   tausi create my-app
   ```

2. **Navigate and install:**
   ```bash
   cd my-app
   bun install
   ```

3. **Start development:**
   ```bash
   bun
   ```

4. **Open in browser:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## Tech Stack Details

### Frontend
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No framework bloat, just clean JS
- **Firebase SDK**: Client-side authentication (optional)

### Backend
- **Express.js**: Minimal web framework
- **SQLite**: File-based database with better-sqlite3
- **CORS**: Cross-origin resource sharing
- **Firebase Admin**: Server-side authentication (optional)
- **dotenv**: Environment variable management

### Deployment
- **Railway**: Preferred deployment platform
- **Render**: Alternative deployment platform
- **Docker**: Containerization for any platform

## Environment Configuration

Each generated project includes `.env.example` files with all required variables:

### Frontend (.env.example)
```bash
# API Base URL
VITE_API_URL=http://localhost:8000

# Firebase Configuration (if auth enabled)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... other Firebase config

# Development settings
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

### Backend (.env.example)
```bash
# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Firebase Admin (if auth enabled)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...}

# Security & External Services
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Setup Environment
```bash
# Copy example files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit with your actual values
nano frontend/.env
nano backend/.env
```

## Database Features

### SQLite Integration
The generated projects include SQLite database with:
- User model and CRUD operations
- Database utilities and helpers
- SQL schema initialization
- API endpoints for data operations

### Example API Usage
```bash
# Get all users
GET /api/users

# Create a new user
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com"
}

# Get user by ID  
GET /api/users/1
```

### Database Files
- `backend/database/init.sql` - Database schema
- `backend/src/utils/database.js` - Database utilities  
- `backend/src/models/User.js` - User model
- `backend/database/README.md` - Database documentation

## LLM-Friendly Features

- **Predictable structure**: Always the same organization
- **Clear naming**: Descriptive file and folder names
- **Comprehensive docs**: Architecture and context documentation
- **Minimal dependencies**: Easy to understand and modify
- **Vanilla JavaScript**: No complex framework patterns

## Security Features

- **CORS configured**: Prevents unauthorized cross-origin requests
- **Firebase Auth**: Industry-standard authentication
- **Environment variables**: Secure configuration management
- **Input validation**: Basic validation patterns included

## Deployment Examples

### Railway
```bash
# Create project
tausi create my-railway-app --deploy railway

# Connect to Railway
railway login
railway init
railway deploy
```

### Render
```bash
# Create project
tausi create my-render-app --deploy render

# Connect to Render (via dashboard)
# Upload render.yaml configuration
# Deploy via Render dashboard
```

### Docker
```bash
# Create project
tausi create my-docker-app

# Build and run with Docker
docker-compose up --build
```
