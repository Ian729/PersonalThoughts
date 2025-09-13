# Personal Thoughts - Information Hub

This is my personal information hub where I store and organize my thoughts in PDF format. The repository features a GitHub Pages site with an embedded PDF viewer that allows me to browse and read my documents from any device.

## Features

- 📄 **PDF Gallery**: View all your PDF files in a beautiful grid layout
- 🔍 **Embedded Viewer**: Click any PDF to view it directly in the browser
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Auto-Deploy**: GitHub Actions automatically updates the site when you add new PDFs
- 🎨 **Modern UI**: Clean, professional interface with smooth animations

## How to Use

1. **Add PDFs**: Simply commit PDF files to the repository root
2. **Automatic Updates**: The GitHub Pages site will automatically update within minutes
3. **View Documents**: Visit your GitHub Pages URL to browse and read your PDFs
4. **Cross-Device Access**: Access your thoughts from any device with internet connection

## Repository Structure

```
PersonalThoughts/
├── index.html          # Main page with PDF viewer
├── styles.css          # Styling for the interface
├── script.js           # PDF viewer functionality
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment
├── README.md           # This file
└── *.pdf              # Your PDF documents
```

## GitHub Pages Setup

1. Go to your repository Settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. The site will be available at: `https://Ian729.github.io/PersonalThoughts`

## Local Development

You can test your PDF viewer locally before deploying to GitHub Pages:

### Option 1: Using Python (Recommended)
```bash
python local-server.py
```

### Option 2: Using Node.js
```bash
node local-server.js
```

### Option 3: Using the provided scripts
- **Windows**: Double-click `start-local-server.bat`
- **Mac/Linux**: Run `./start-local-server.sh`

Then visit: `http://localhost:8000`

The local server will:
- Serve your HTML, CSS, and JavaScript files
- Simulate the GitHub API to list your PDF files
- Allow you to test the PDF viewer functionality

## Adding New PDFs

Simply add your PDF files to the repository root and push the changes. The GitHub Action will automatically:
- Detect the new files
- Update the site
- Make them available in the PDF viewer

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses PDF.js for client-side PDF rendering
- GitHub API integration for dynamic file listing
- Responsive design with CSS Grid and Flexbox
- Modern UI with gradients and smooth animations

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

This project is for personal use. Feel free to fork and adapt for your own needs.
