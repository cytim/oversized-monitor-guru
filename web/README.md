# OMG - Oversized Monitor Guru (React SPA)

This is a React single page application version of the Oversized Monitor Guru Chrome extension.

## Features

- **Popup View**: Configure mirror area settings (width, height, offsets, frame rate, device pixel ratio)
- **Stream View**: Display the mirrored screen area in real-time
- **Seamless Navigation**: Start mirroring from the popup, stop to return to the entry point

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

The production files will be in the `build/` directory.

Preview the production build:
```bash
npm run preview
```

## Usage

1. Open the application
2. Configure the mirror area settings:
   - Width and Height (in pixels)
   - Offset from Left and Top (in pixels)
   - Advanced settings: Frame Rate and Device Pixel Ratio
3. Click "Start Mirroring"
4. Select the screen or window you want to mirror
5. The mirrored content will be displayed
6. When you stop sharing or close the stream, you'll return to the configuration screen

## Technology Stack

- React 18
- Vite 5
- Fast HMR (Hot Module Replacement)
- Optimized production builds
