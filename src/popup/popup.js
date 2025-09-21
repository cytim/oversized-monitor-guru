document.addEventListener('DOMContentLoaded', function () {
  const streamBtn = document.getElementById('streamBtn');
  const form = document.getElementById('streamForm');
  const advancedConfig = document.getElementById('advanced-config');
  const advancedConfigToggle = advancedConfig.querySelector('.advanced-config-toggle');

  loadFormValues();
  onStateChange();

  // Handle advanced config toggle
  advancedConfigToggle.addEventListener('click', function (e) {
    e.preventDefault();
    advancedConfig.classList.toggle('expanded');
  });

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
      if (saveFormValues()) {
        startStreaming();
      }
    } else {
      stopStreaming();
    }
  });

  // State updates are handled in stream.html to ensure accurate state restoration if the window is opened outside of the popup controls.
  function startStreaming() {
    chrome.storage.local.get(['streamConfig'], function ({ streamConfig }) {
      chrome.windows.create({
        url: 'stream/stream.html',
        type: 'popup',
        width: streamConfig.width,
        height: streamConfig.height,
        left: window.screen.width - streamConfig.width,
        top: 0
      });
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
      offset_x: parseInt(document.getElementById('offset-x').value),
      offset_y: parseInt(document.getElementById('offset-y').value),
      frame_rate: parseInt(document.getElementById('frame-rate').value),
      dpr: parseFloat(document.getElementById('dpr').value)
    };
  }

  function validateFormData(data) {
    return data.width > 0 && data.height > 0 &&
      data.offset_x >= 0 && data.offset_y >= 0 &&
      data.frame_rate >= 10 && data.frame_rate <= 1000 &&
      data.dpr >= 0.1 && data.dpr <= 4;
  }

  function saveFormValues() {
    const formData = getFormData();

    if (!validateFormData(formData)) {
      alert('Please enter valid values for all fields.');
      return false;
    }

    chrome.storage.local.set({ streamConfig: formData });
    return true;
  }

  function loadFormValues() {
    chrome.storage.local.get(['streamConfig'], function (result) {
      if (result.streamConfig) {
        const config = result.streamConfig;
        document.getElementById('width').value = config.width || 1920;
        document.getElementById('height').value = config.height || 1080;
        document.getElementById('offset-x').value = config.offset_x || 0;
        document.getElementById('offset-y').value = config.offset_y || 0;
        document.getElementById('frame-rate').value = config.frame_rate || 30;
        document.getElementById('dpr').value = config.dpr || window.devicePixelRatio || 1.0;
      } else {
        // Initialize with default values
        document.getElementById('width').value = Math.floor(window.screen.width / 2);
        document.getElementById('height').value = window.screen.height;
        document.getElementById('dpr').value = window.devicePixelRatio || 1.0;
      }
    });
  }
});
