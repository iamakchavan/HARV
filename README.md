# ![alt text](<extension_icon (4).png>)HARV - AI Browser Assistant

HARV is a powerful browser extension that brings AI-powered assistance directly into your browsing experience. With support for multiple AI models (Gemini, Perplexity, xAI), it offers intelligent page analysis, smart search, and context-aware conversations.


> ⚠️ **Warning: Development Status**
> 
> This project is currently under active development and in beta stage. Some features might:
> - Be incomplete or change without notice
> - Have bugs or unexpected behavior
> - Require additional optimization
> - Need better error handling
>
> Feel free to report issues and contribute to the development!



## Features

### 🔍 Smart Search & Context-Aware Conversations
- Floating search interface accessible anywhere on the page
- Context-aware conversations with memory of previous interactions
- Multiple search scopes: Page, Domain, or Global knowledge
- Support for image analysis and screenshots

### 🤖 Multiple AI Models
- **Gemini**: Google's latest AI model with vision capabilities
- **Perplexity**: Advanced language model for precise responses
- **xAI**: Cutting-edge AI for sophisticated analysis
- Seamless model switching during conversations

### 📑 Page Analysis & Interaction
- Automatic page summarization
- YouTube video content analysis
- Text selection tools (Define, Explain, Search)
- Dark mode support
- Text-to-speech capabilities

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Chrome/Edge/Firefox browser

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/iamakchavan/harv.git
   cd harv
   ```

2. Install dependencies:
   ```bash
   cd project
   npm install
   ```

3. Configure API Keys:
   - Open `src/utils/ai-config.ts`
   - Add your API keys:
     ```typescript
     export const AI_CONFIG: AIConfig = {
       xai: {
         apiKey: 'YOUR_XAI_API_KEY',
         endpoint: 'https://api.x.ai/v1'
       },
       gemini: {
         apiKey: 'YOUR_GEMINI_API_KEY',
         model: 'gemini-1.5-flash'
       },
       perplexity: {
         apiKey: 'YOUR_PERPLEXITY_API_KEY',
         model: 'llama-3.1-sonar-small-128k-online'
       }
     };
     ```

4. Build the extension:
   ```bash
   npm run build
   ```

5. Load the extension in your browser:
   - Chrome/Edge:
     1. Go to `chrome://extensions/`
     2. Enable "Developer mode"
     3. Click "Load unpacked"
     4. Select the `dist` folder from the project directory

## Usage

### Quick Access
- Use `Alt+X` (Windows/Linux) or `Command+X` (Mac) to open the extension
- Click the floating search icon for quick access

### Search Modes
1. **Page Mode**: Search within current page content
2. **Domain Mode**: Search across the current website
3. **All Mode**: Use AI's comprehensive knowledge

### Text Selection Features
1. Select any text on a webpage
2. Use the popup menu to:
   - Summarize the selection
   - Get detailed explanations
   - Copy text
   - Search for more information

### Image Analysis
1. Click the camera icon to capture screenshots
2. Upload images for AI analysis
3. Ask questions about the visual content

## Development

### Project Structure
```
project/
├── src/
│   ├── components/    # React components
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application
│   └── background.ts  # Extension background script
├── public/           # Static assets
└── dist/            # Build output
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.