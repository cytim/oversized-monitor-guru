# OMG - Oversized Monitor Guru

## Background

Large monitors can make screen sharing challenging, as viewers may find it difficult to follow content spread across a wide display. Many conferencing platforms do not offer the ability to share only a selected portion of the screen. This project aims to provide a solution by enabling users to stream a configurable region of their screen in a separate window, making it easier to share focused content during virtual meetings.

## Functional Requirements

- **`FR01`**: Upon clicking the extension icon, display a popup menu (via `popup.html`) containing:
  - A "Start Stream" button.
  - A form with four numeric input fields (in pixels): width (default: 1920), height (default: 1080), offset_x (default: 0), offset_y (default: 0).

- **`FR02`**: When the "Start Stream" button is clicked:
  - Show a confirmation dialog (e.g., via `window.confirm()`).
  - On confirmation, create a new popup window (using `chrome.windows.create` with `type: 'popup'`, sized to match width/height).
  - Initiate screen capture using `navigator.mediaDevices.getDisplayMedia()` (prompt user to select entire screen).
  - In the popup window, render the cropped stream in a `<canvas>` element by drawing the video with the specified offsets and dimensions.
  - Change the menu button to "Stop Stream".

- **`FR03`**: When the "Stop Stream" button is clicked:
  - Immediately stop the media stream (via `stream.getTracks().forEach(track => track.stop())`).
  - Close the popup window (via `chrome.windows.remove`).

- **`FR04`**: Allow real-time configuration changes: Updates to the form fields during streaming dynamically adjust the canvas drawing parameters without restarting the capture.

- **`FR05`**: Handle capture errors: If `getDisplayMedia` fails (e.g., user cancels), show an alert in the menu and reset the button to "Start Stream".

- **`FR06`**: Provide a preview mode: Include a button in the menu to temporarily preview the configured portion in a small `<canvas>` within the menu before starting the full stream.

## Non-Functional Requirements

- **`NFR01`**: Implement as a Chrome extension using Manifest V3.

- **`NFR02`**: Use only vanilla JavaScript and Chrome APIs; no external libraries or dependencies.

- **`NFR03`**: Support arbitrary screen sizes by validating input fields against actual screen dimensions (queried via `window.screen` or `chrome.system.display`).

- **`NFR04`**: Include required permissions in `manifest.json`: `"activeTab"`, `"storage"`, and `"system.display"`.

- **`NFR05`**: Save form values using `chrome.storage.local` to persist configuration across sessions.

- **`NFR06`**: Mitigate mirror effect: Automatically position the popup window outside the configured portion (e.g., at `screen.width - width - 10`, `screen.height - height - 10`) to avoid feedback loops; include a warning tooltip in the menu about potential overlap.

- **`NFR07`**: Ensure streaming performance of at least 30fps by optimizing canvas redraws (e.g., using `requestAnimationFrame`).

- **`NFR08`**: Enhance accessibility: Add labels to form fields and support keyboard navigation for menu buttons.

- **`NFR09`**: Ensure security: No data is sent externally; all operations are local to the extension.
