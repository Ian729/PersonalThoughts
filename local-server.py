#!/usr/bin/env python3
"""
Simple local HTTP server for testing the PDF viewer locally.
Run this script to start a local server at http://localhost:8000
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # Handle GitHub API simulation for local development
        if self.path.startswith('/api/github/repos/'):
            self.handle_github_api()
        else:
            super().do_GET()
    
    def handle_github_api(self):
        """Simulate GitHub API response for local development"""
        try:
            # Get all PDF files in the current directory
            pdf_files = []
            for filename in os.listdir('.'):
                if filename.endswith('.pdf'):
                    file_path = os.path.join('.', filename)
                    if os.path.isfile(file_path):
                        file_size = os.path.getsize(file_path)
                        pdf_files.append({
                            "name": filename,
                            "path": filename,
                            "size": file_size,
                            "download_url": f"http://localhost:8000/{filename}",
                            "type": "file"
                        })
            
            # Send JSON response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(pdf_files).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())

def start_server(port=8000):
    """Start the local development server"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Local development server started!")
        print(f"📄 PDF Viewer: http://localhost:{port}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🔧 GitHub API simulation: http://localhost:{port}/api/github/repos/Ian729/PersonalThoughts/contents")
        print("\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    start_server()
