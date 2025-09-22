# OMG - Oversized Monitor Guru

When you have a massive display, sharing your entire screen can make content appear tiny and unreadable for meeting participants. Many conferencing apps, like Google Meet and Microsoft Teams, lack the option to share only a specific screen area. This Chrome Extension solves this by allowing users to mirror a selected portion of their screen in a separate window, simplifying the sharing of targeted content in virtual meetings.

Watch the demo below to see OMG in action.

[![OMG Oversized Monitor Guru](https://img.youtube.com/vi/X63sz9alOC8/maxresdefault.jpg)](https://www.youtube.com/watch?v=X63sz9alOC8)

## How to Use

**Setting Up the Mirror:**

1. Click the OMG extension icon
2. Adjust the mirror area using the size and offset controls
3. Hit "Start Mirroring" to create your mirror window
4. Choose to share your _entire screen_ or a specific _window_
5. Position the mirror window at a corner

**During Your Meeting:**

1. Start screen sharing in your conferencing app
2. Select the `OMG` mirror _window_ to share (not your main screen)

## Limitations

- 🛠️ If the mirrored content appears too large or too small, open `Advanced Config` and adjust the `Device Pixel Ratio` setting.
- ‼️ **Keep the mirror window at least partially visible** – If the mirror window is completely hidden behind other applications, Google Meet may freeze the content, since it stops updating "inactive" windows.


## Development

### Installation

1. Clone this repository to your machine.
2. Load the `src` folder as [Unpacked Extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

### Publish

```sh
make package
```
