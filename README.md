# Dev Service Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/ominexusx/dev-service-manager)](https://github.com/ominexusx/dev-service-manager/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/ominexusx/dev-service-manager)](https://github.com/ominexusx/dev-service-manager/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A powerful Electron + React application for managing multiple development services from a single interface. Perfect for developers working on microservices, monorepos, or multiple concurrent projects.

![Dev Service Manager](screenshot.png)

## Features

### Core Features

- 🚀 **Unlimited Services**: Add and manage as many development services as you need
- ▶️ **Process Control**: Start, stop, and restart services with a click
- 📊 **Live Terminal Output**: Real-time stdout/stderr streaming with color-coding
- 💾 **Persistent Configuration**: Services are saved to localStorage
- 🎯 **Working Directory Support**: Each service runs in its own directory
- 🌍 **Environment Variables**: Configure custom environment variables per service
- 🎨 **Modern Dark Theme**: Beautiful, easy-on-the-eyes interface

### Advanced Features

- ✅ **Auto-scroll Terminal**: Automatically follows new log output

- 🔴 **Color-coded Logs**: 
  - White: stdout
  - Red: stderr
  - Blue: info messages
  - Dark red: errors
- ⌨️ **Keyboard Shortcuts**: `Ctrl+Shift+R` to restart active service
- 🔄 **Batch Operations**: Start/stop all services at once
- 📈 **Status Indicators**: Visual indicators showing which services are running
- 🧹 **Clear Logs**: Clean console output with one click

## Installation

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Setup

1. Clone or navigate to the project directory:

```bash
cd /home/tsm/dev-service-manager
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

## Usage

### Development Mode

Run both Electron and React in development mode with hot-reload:

```bash
npm run dev
# or
pnpm dev
```

This will:

- Start Vite dev server on http://localhost:5173
- Watch and compile Electron TypeScript files
- Launch Electron with DevTools open

### Production Build

Build and run the production version:

```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

### Package Application

Create distributable packages:

```bash
npm run package
# or
pnpm package
```

## Project Structure

```text
dev-service-manager/
├── electron/               # Electron main process
│   ├── main.ts            # Main Electron entry point
│   ├── preload.ts         # Preload script for IPC
│   └── serviceManager.ts  # Service process management
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── Header.tsx
│   │   ├── ServiceList.tsx
│   │   ├── ServicePanel.tsx
│   │   ├── ServiceConsole.tsx
│   │   └── AddServiceModal.tsx
│   ├── App.tsx           # Main React app
│   ├── main.tsx          # React entry point
│   ├── types.ts          # TypeScript types
│   ├── storage.ts        # localStorage utilities
│   └── index.css         # Global styles
├── dist/                 # Build output
├── package.json
└── README.md
```

## How It Works

### Electron Backend

The Electron main process manages child processes using Node.js's `child_process.spawn`:

- **ServiceManager**: Handles spawning, monitoring, and terminating processes
- **IPC Handlers**: Communicate between React UI and Electron backend
- **Stream Capture**: Captures stdout/stderr and forwards to React via IPC

### React Frontend

The React app provides a modern UI for service management:

- **ServiceList**: Sidebar showing all configured services
- **ServicePanel**: Main panel with service details and controls
- **ServiceConsole**: Terminal-like output viewer with auto-scroll
- **AddServiceModal**: Form for creating new services

### Data Flow

1. User adds a service via the UI
2. Service config saved to localStorage
3. User clicks "Start" → IPC message sent to Electron
4. ServiceManager spawns child process
5. Process output streamed back to React via IPC
6. Console component displays output in real-time

## Usage Tips

### Adding a Service

1. Click "Add Service" in the sidebar
2. Fill in:
   - **Service Name**: Display name (e.g., "API Server")
   - **Command**: Command to run (e.g., "npm start", "pnpm dev")
   - **Working Directory**: Project directory path
   - **Environment Variables** (optional): One per line (KEY=value)
3. Click "Add Service"

### Common Commands

- **Node.js**: `npm start`, `npm run dev`, `node index.js`
- **pnpm**: `pnpm dev`, `pnpm start`
- **Python**: `python app.py`, `python -m flask run`
- **Go**: `go run main.go`
- **Docker**: `docker-compose up`

### Keyboard Shortcuts

- `Ctrl+Shift+R`: Restart the currently selected service

## Configuration

Services are stored in browser localStorage with the following structure:

```json
{
  "id": "1234567890",
  "name": "My API",
  "command": "npm run dev",
  "workingDirectory": "/path/to/project",
  "env": {
    "NODE_ENV": "development",
    "PORT": "3000"
  }
}
```

## Troubleshooting

### Service won't start

- Verify the command works in a regular terminal
- Check the working directory path is correct
- Ensure required dependencies are installed in that directory

### No output in console

- Some applications buffer output - try running with unbuffered mode
- Check if the application writes to stdout/stderr

### Permission errors

- Ensure the working directory has proper read/write permissions
- On Linux/Mac, some commands may need sudo (not recommended in this app)

## Technology Stack

- **Electron**: Desktop app framework
- **React**: UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **Node.js child_process**: Process management

## Contributing

Feel free to open issues or submit pull requests for improvements!

## License

MIT

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

If you find this project helpful, please give it a ⭐️ on [GitHub](https://github.com/ominexusx/dev-service-manager)!

## Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/ominexusx/dev-service-manager/issues).

## Future Enhancements

- [ ] Service groups/categories
- [ ] Log filtering and search
- [ ] Export logs to file
- [ ] Service dependencies (start order)
- [ ] CPU/Memory usage monitoring
- [ ] Custom themes
- [ ] Service templates/presets
- [ ] Multi-window support
- [ ] Service health checks
- [ ] Notification on service crashes
