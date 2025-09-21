document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  let windowId = null;
  let mediaStream = null;
  let ctx = null;
  let streamConfig = {
    width: 1920,
    height: 1080,
    offset_x: 0,
    offset_y: 0,
    frame_rate: 30,
    dpr: 1.0
  };
  let lastFrameTime = 0;

  // Get current window ID and initialize streaming
  chrome.windows.getCurrent(function (currentWindow) {
    if (currentWindow && currentWindow.id) {
      windowId = currentWindow.id;

      // Set streaming state to active
      chrome.storage.local.set({
        isStreaming: true,
        streamWindowId: currentWindow.id
      });

      // Update badge to show streaming status
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      chrome.action.setBadgeTextColor({ color: "#FFFFFF" });

      // Load stream configuration and start screen capture
      loadStreamConfig(startScreenCapture);
    }
  });

  // Listen for real-time configuration updates
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && changes.streamConfig) {
      onStreamConfigChange({ ...streamConfig, ...changes.streamConfig.newValue });
    }
  });

  // Handle window close
  window.addEventListener('beforeunload', function () {
    stopStreaming();
  });

  // Load stream configuration from storage
  function loadStreamConfig(done) {
    chrome.storage.local.get(['streamConfig'], function (result) {
      if (result.streamConfig) {
        onStreamConfigChange({ ...streamConfig, ...result.streamConfig });
      }
      done();
    });
  }

  function onStreamConfigChange(newStreamConfig) {
    console.log('Stream config changed:', newStreamConfig);
    streamConfig = newStreamConfig;

    chrome.windows.update(windowId, {
      width: newStreamConfig.width,
      height: newStreamConfig.height
    });
  }

  // Validate and clamp streamConfig to video bounds
  function validateStreamConfig(videoWidth, videoHeight) {
    const dpr = streamConfig.dpr || window.devicePixelRatio || 1;

    const config = { ...streamConfig };
    config.offset_x = Math.round(config.offset_x * dpr);
    config.offset_y = Math.round(config.offset_y * dpr);
    config.width = Math.round(config.width * dpr);
    config.height = Math.round(config.height * dpr);

    // Ensure offsets are not negative
    config.offset_x = Math.max(0, config.offset_x);
    config.offset_y = Math.max(0, config.offset_y);

    // Ensure crop area doesn't exceed video bounds
    config.offset_x = Math.min(config.offset_x, videoWidth - 1);
    config.offset_y = Math.min(config.offset_y, videoHeight - 1);

    // Ensure width and height are positive
    config.width = Math.max(1, config.width);
    config.height = Math.max(1, config.height);

    // Clamp dimensions to fit within video bounds
    config.width = Math.min(config.width, videoWidth - config.offset_x);
    config.height = Math.min(config.height, videoHeight - config.offset_y);

    return config;
  }

  async function startScreenCapture() {
    try {
      // Request screen capture with audio disabled for better performance
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 3840, max: 3840 },
          height: { ideal: 2160, max: 2160 },
          frameRate: { ideal: streamConfig.frame_rate, max: streamConfig.frame_rate }
        },
        audio: false
      });

      video.srcObject = mediaStream;

      // Handle stream end (user stops sharing)
      mediaStream.getVideoTracks()[0].addEventListener('ended', function () {
        stopStreaming();
      });

      // Hide loading and show canvas
      loadingDiv.style.display = 'none';
      errorDiv.style.display = 'none';
      canvas.style.display = 'block';

      // Start rendering the stream
      startRendering();
    } catch (error) {
      console.log('Screen capture failed:', error);
      handleCaptureError(error);
    }
  }

  function handleCaptureError(error) {
    canvas.style.display = 'none';
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'block';

    let errorMessage = 'Failed to start screen capture. ';
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Screen sharing was denied or cancelled.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No screen capture source found.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }

    errorDiv.textContent = errorMessage;
  }

  function startRendering() {
    console.log('Rendering started');
    ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      console.log('Video bounds:', video.videoWidth, video.videoHeight, window.devicePixelRatio);

      function drawFrame(currentTime) {
        if (video.paused || video.ended) {
          return;
        }

        const frameInterval = 1000 / streamConfig.frame_rate;
        if (currentTime - lastFrameTime >= frameInterval) {
          // Get current validated config (in case it changed during streaming)
          const currentConfig = validateStreamConfig(video.videoWidth, video.videoHeight);
          if (currentConfig.width !== canvas.width || currentConfig.height !== canvas.height) {
            canvas.width = currentConfig.width;
            canvas.height = currentConfig.height;
          }

          // Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the cropped portion of the video at 1:1 scale
          // Source: video at (offset_x, offset_y) with size (width, height)
          // Destination: canvas at (0, 0) with same size (width, height)
          ctx.drawImage(
            video,
            currentConfig.offset_x, currentConfig.offset_y, currentConfig.width, currentConfig.height,
            0, 0, canvas.width, canvas.height
          );

          lastFrameTime = currentTime;
        }

        requestAnimationFrame(drawFrame);
      }

      drawFrame(performance.now());
    };
  }

  function stopStreaming() {
    console.log('Stopping streaming');

    // Stop media stream
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
      video.srcObject = null;
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Close the window
    window.close();
  }
});
