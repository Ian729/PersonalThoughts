// PDF.js configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFViewer {
    constructor() {
        this.currentPDF = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        
        this.init();
    }
    
    init() {
        this.loadPDFs();
        this.setupEventListeners();
    }
    
    getRepositoryInfo() {
        // Extract repository info from GitHub Pages URL
        // URL format: https://username.github.io/repository-name/
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        if (hostname.includes('github.io')) {
            // GitHub Pages URL
            const pathParts = pathname.split('/').filter(part => part);
            if (pathParts.length >= 1) {
                const repo = pathParts[0];
                // Extract username from hostname (username.github.io)
                const owner = hostname.split('.')[0];
                return { owner, repo };
            }
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Local development - use default values
            return { owner: 'Ian729', repo: 'PersonalThoughts', isLocal: true };
        }
        
        return null;
    }
    
    async loadPDFs() {
        try {
            // Get repository info from GitHub Pages URL
            const repoInfo = this.getRepositoryInfo();
            if (!repoInfo) {
                throw new Error('Could not determine repository information');
            }
            
            console.log('Repository info:', repoInfo);
            
            // Get list of PDF files from the repository
            const apiUrl = repoInfo.isLocal 
                ? `http://localhost:8000/api/github/repos/${repoInfo.owner}/${repoInfo.repo}/contents`
                : `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const files = await response.json();
            
            const pdfFiles = files.filter(file => file.name.endsWith('.pdf'));
            
            const pdfGrid = document.getElementById('pdfGrid');
            
            if (pdfFiles.length === 0) {
                pdfGrid.innerHTML = '<div class="loading">No PDF files found in the repository</div>';
                return;
            }
            
            pdfGrid.innerHTML = '';
            
            pdfFiles.forEach(file => {
                const pdfCard = this.createPDFCard(file);
                pdfGrid.appendChild(pdfCard);
            });
            
        } catch (error) {
            console.error('Error loading PDFs:', error);
            const errorMessage = error.message.includes('Could not determine repository') 
                ? 'Could not determine repository information from URL. Please ensure you are accessing this page via GitHub Pages.'
                : 'Error loading PDF files. Please check your repository access and ensure the repository is public.';
            document.getElementById('pdfGrid').innerHTML = 
                `<div class="loading">${errorMessage}</div>`;
        }
    }
    
    createPDFCard(file) {
        const card = document.createElement('div');
        card.className = 'pdf-card';
        card.onclick = () => this.openPDF(file);
        
        const icon = document.createElement('div');
        icon.className = 'pdf-icon';
        icon.innerHTML = '📄';
        
        const title = document.createElement('div');
        title.className = 'pdf-title';
        title.textContent = file.name.replace('.pdf', '');
        
        const meta = document.createElement('div');
        meta.className = 'pdf-meta';
        meta.textContent = this.formatFileSize(file.size);
        
        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(meta);
        
        return card;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async openPDF(file) {
        const modal = document.getElementById('pdfModal');
        const title = document.getElementById('pdfTitle');
        const canvas = document.getElementById('pdfCanvas');
        
        title.textContent = file.name.replace('.pdf', '');
        modal.style.display = 'block';
        
        try {
            // Show loading state
            canvas.parentElement.innerHTML = '<div class="loading">Loading PDF...</div>';
            
            // Load PDF from GitHub raw content
            const pdfUrl = file.download_url;
            console.log('Loading PDF from:', pdfUrl);
            
            // Configure PDF.js for better compatibility
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
                disableAutoFetch: false,
                disableStream: false,
                // Add CORS headers for local development
                httpHeaders: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
            
            // Add progress callback
            loadingTask.onProgress = (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    canvas.parentElement.innerHTML = `<div class="loading">Loading PDF... ${percent}%</div>`;
                }
            };
            
            this.currentPDF = await loadingTask.promise;
            this.totalPages = this.currentPDF.numPages;
            this.currentPage = 1;
            
            console.log('PDF loaded successfully:', this.totalPages, 'pages');
            
            // Restore canvas element for rendering
            canvas.parentElement.innerHTML = '<canvas id="pdfCanvas"></canvas>';
            await this.renderPage();
            this.updatePageInfo();
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            let errorMessage = 'Error loading PDF. ';
            
            if (error.name === 'InvalidPDFException') {
                errorMessage += 'The file may not be a valid PDF.';
            } else if (error.name === 'MissingPDFException') {
                errorMessage += 'The PDF file could not be found.';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'CORS error - try using the local server for development.';
            } else {
                errorMessage += `Error: ${error.message}`;
            }
            
            canvas.parentElement.innerHTML = `<div class="loading">${errorMessage}</div>`;
        }
    }
    
    async renderPage() {
        if (!this.currentPDF) return;
        
        const canvas = document.getElementById('pdfCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        const context = canvas.getContext('2d');
        
        const page = await this.currentPDF.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: this.scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        console.log('Page rendered successfully');
    }
    
    async nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.renderPage();
            this.updatePageInfo();
        }
    }
    
    async prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.renderPage();
            this.updatePageInfo();
        }
    }
    
    updatePageInfo() {
        const pageInfo = document.getElementById('pageInfo');
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
    }
    
    closePDF() {
        const modal = document.getElementById('pdfModal');
        modal.style.display = 'none';
        this.currentPDF = null;
    }
    
    setupEventListeners() {
        // Close modal
        document.getElementById('closeBtn').onclick = () => this.closePDF();
        document.getElementById('pdfModal').onclick = (e) => {
            if (e.target.id === 'pdfModal') {
                this.closePDF();
            }
        };
        
        // Navigation buttons
        document.getElementById('nextPage').onclick = () => this.nextPage();
        document.getElementById('prevPage').onclick = () => this.prevPage();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('pdfModal').style.display === 'block') {
                switch(e.key) {
                    case 'Escape':
                        this.closePDF();
                        break;
                    case 'ArrowLeft':
                        this.prevPage();
                        break;
                    case 'ArrowRight':
                        this.nextPage();
                        break;
                }
            }
        });
    }
}

// Initialize the PDF viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PDFViewer();
});
