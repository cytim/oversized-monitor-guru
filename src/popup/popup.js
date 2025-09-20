document.addEventListener('DOMContentLoaded', function () {
  const streamBtn = document.getElementById('streamBtn');
  const form = document.getElementById('streamForm');

  loadFormValues();
  onStateChange();

  // Listen for storage changes to refresh UI when streaming state changes
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && changes.isStreaming && changes.isStreaming.newValue != null) {
      onStateChange();
    }
  });

  // Save form values when they change
  form.addEventListener('input', saveFormValues);

  streamBtn.addEventListener('click', function () {
    if (streamBtn.textContent === 'Start Mirroring') {
      startStreaming();
    } else {
      stopStreaming();
    }
  });

  // State updates are handled in stream.html to ensure accurate state restoration if the window is opened outside of the popup controls.
  function startStreaming() {
    const formData = getFormData();

    // Validate form data
    if (!validateFormData(formData)) {
      alert('Please enter valid values for all fields.');
      return;
    }

    // Open stream.html in a new popup window
    chrome.windows.create({
      url: 'stream/stream.html',
      type: 'popup',
      width: formData.width,
      height: formData.height
    });
  }

  // State updates are handled in background.js to ensure accurate state restoration if the window is closed outside of the popup controls.
  function stopStreaming() {
    chrome.storage.local.get(['streamWindowId'], function (result) {
      if (result.streamWindowId) {
        chrome.windows.remove(result.streamWindowId);
      }
    });
  }

  function refreshUI({ isStreaming }) {
    if (isStreaming) {
      streamBtn.textContent = 'Stop Mirroring';
      streamBtn.style.backgroundColor = '#f44336';
    } else {
      streamBtn.textContent = 'Start Mirroring';
      streamBtn.style.backgroundColor = '#4CAF50';
    }
  }

  function onStateChange() {
    chrome.storage.local.get(['isStreaming', 'streamWindowId'], function (result) {
      refreshUI(result);

      if (result.isStreaming && result.streamWindowId) {
        // Verify the window still exists
        chrome.windows.get(result.streamWindowId, function (window) {
          if (chrome.runtime.lastError) {
            // Window doesn't exist, reset state
            chrome.storage.local.set({
              isStreaming: false,
              streamWindowId: null
            });
            chrome.action.setBadgeText({ text: "" });
          }
        });
      }
    });
  }

  function getFormData() {
    return {
      width: parseInt(document.getElementById('width').value),
      height: parseInt(document.getElementById('height').value),
      offset_x: parseInt(document.getElementById('offset_x').value),
      offset_y: parseInt(document.getElementById('offset_y').value)
    };
  }

  function validateFormData(data) {
    return data.width > 0 && data.height > 0 &&
      data.offset_x >= 0 && data.offset_y >= 0;
  }

  function saveFormValues() {
    const formData = getFormData();
    chrome.storage.local.set({ streamConfig: formData });
  }

  function loadFormValues() {
    chrome.storage.local.get(['streamConfig'], function (result) {
      if (result.streamConfig) {
        const config = result.streamConfig;
        document.getElementById('width').value = config.width || 1920;
        document.getElementById('height').value = config.height || 1080;
        document.getElementById('offset_x').value = config.offset_x || 0;
        document.getElementById('offset_y').value = config.offset_y || 0;
      }
    });
  }
});
