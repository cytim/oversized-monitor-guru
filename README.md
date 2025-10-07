# OMG - Oversized Monitor Guru

When you have a massive display, sharing your entire screen can make content appear tiny and unreadable for meeting participants. Many conferencing apps, like Google Meet and Microsoft Teams, lack the option to share only a specific screen area. This Chrome Extension solves this by allowing users to mirror a selected portion of their screen in a separate window, simplifying the sharing of targeted content in virtual meetings.

Watch the demo below to see OMG in action.

[![OMG Oversized Monitor Guru](https://img.youtube.com/vi/X63sz9alOC8/maxresdefault.jpg)](https://www.youtube.com/watch?v=X63sz9alOC8)

## How to Use

**Get Started**

Install the extension or visit the web version:

- [Chrome Extension](https://chromewebstore.google.com/detail/oversized-monitor-guru-om/dhghddapjaemcpdfnfgpmgcjojfmhbak)
- [Web Version](https://oversized-monitor-guru.web.app/)

**Create Your Mirror Window**

1. Launch OMG by clicking the extension icon or visiting the web version
2. Configure the mirror area with the size and offset controls
3. Click "Start Mirroring" to open the mirror window
4. Grant screen capture permissions when prompted (select _entire screen_ or specific _window_)
5. Move the mirror window to a convenient location on your screen

**Share in Your Meeting**

1. Open your video conferencing app and start screen sharing
2. Choose the `OMG` mirror _window_ as your share source (not your entire display)

## Limitations

- 🛠️ If the mirrored content appears too large or too small, open `Advanced Config` and adjust the `Device Pixel Ratio` setting.
- ‼️ **Keep the mirror window at least partially visible** – If the mirror window is completely hidden behind other applications, Google Meet may freeze the content, since it stops updating "inactive" windows.


## Development

### Chrome Extension

#### Installation

1. Clone this repository to your machine.
2. Load the `chrome-extension/` folder as [Unpacked Extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

#### Publish

```sh
make package
```

### Web Version

Follow the instructions in `web/README.md`.
