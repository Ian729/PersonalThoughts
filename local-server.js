#!/usr/bin/env node
/**
 * Simple local HTTP server for testing the PDF viewer locally.
 * Run: node local-server.js
 * Then visit: http://localhost:8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.pdf': 'application/pdf',
    '.json': 'application/json'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function getPDFFiles() {
    try {
        const files = fs.readdirSync('.');
        return files
            .filter(file => file.endsWith('.pdf'))
            .map(file => {
                const stats = fs.statSync(file);
                return {
                    name: file,
                    path: file,
                    size: stats.size,
                    download_url: `http://localhost:${PORT}/${file}`,
                    type: 'file'
                };
            });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle GitHub API simulation
    if (pathname.startsWith('/api/github/repos/')) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(getPDFFiles()));
        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? './index.html' : `.${pathname}`;
    
    // Security check - prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            }
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('🚀 Local development server started!');
    console.log(`📄 PDF Viewer: http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${process.cwd()}`);
    console.log(`🔧 GitHub API simulation: http://localhost:${PORT}/api/github/repos/Ian729/PersonalThoughts/contents`);
    console.log('\nPress Ctrl+C to stop the server');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try a different port or stop the existing server.`);
    } else {
        console.error('❌ Server error:', err);
    }
});
