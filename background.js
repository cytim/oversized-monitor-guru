// Background script to handle persistent window monitoring
chrome.windows.onRemoved.addListener(function (windowId) {
  // Check if this was our stream window
  chrome.storage.local.get(['isStreaming', 'streamWindowId'], function (result) {
    if (result.isStreaming && result.streamWindowId === windowId) {
      // Stream window was closed, update state
      chrome.storage.local.set({
        isStreaming: false,
        streamWindowId: null
      });

      // Clear badge when stream window is closed
      chrome.action.setBadgeText({ text: "" });
    }
  });
});
