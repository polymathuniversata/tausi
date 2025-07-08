import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.GUI_PORT || 3001;

// Security middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 project generations per 15 minutes
    message: 'Too many project generation requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the GUI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to generate project
app.post('/api/generate-project', apiLimiter, async (req, res) => {
    try {
        const { name, description, author, includeAuth, deployTarget } = req.body;
        
        // Validate input
        if (!name || !/^[a-zA-Z0-9-_]+$/.test(name)) {
            return res.status(400).json({ error: 'Invalid project name' });
        }
        
        // Build command arguments
        const args = ['create', name];
        
        if (author) args.push('--author', author);
        if (!includeAuth) args.push('--no-auth');
        if (deployTarget && deployTarget !== 'both') args.push('--deploy', deployTarget);
        
        // Execute tausi CLI command
        const tausiliBinary = path.join(__dirname, '..', 'dist', 'cli.js');
        const child = spawn('bun', [tausiliBinary, ...args], {
            cwd: process.cwd(),
            stdio: 'pipe'
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                res.json({ 
                    success: true, 
                    message: 'Project generated successfully',
                    projectPath: path.resolve(name),
                    output: stdout
                });
            } else {
                res.status(500).json({ 
                    error: 'Failed to generate project',
                    details: stderr || stdout
                });
            }
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
            child.kill();
            res.status(500).json({ error: 'Project generation timed out' });
        }, 30000);
        
    } catch (error) {
        console.error('Error generating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌐 Tausi GUI Server running on http://localhost:${PORT}`);
    console.log(`🎨 Open your browser and start creating projects!`);
});
