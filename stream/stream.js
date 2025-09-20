// Startup logic - activate streaming state when window opens
document.addEventListener('DOMContentLoaded', function () {
  // Get current window ID
  chrome.windows.getCurrent(function (currentWindow) {
    if (currentWindow && currentWindow.id) {
      // Set streaming state to active
      chrome.storage.local.set({
        isStreaming: true,
        streamWindowId: currentWindow.id
      });

      // Update badge to show streaming status
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
    }
  });
});
