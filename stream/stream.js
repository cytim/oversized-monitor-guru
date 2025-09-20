document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  let mediaStream = null;
  let ctx = null;

  // Get current window ID and initialize streaming
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

      // Start screen capture
      startScreenCapture();
    }
  });

  // Handle window close
  window.addEventListener('beforeunload', function () {
    stopStreaming();
  });

  async function startScreenCapture() {
    try {
      // Request screen capture with audio disabled for better performance
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
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
      console.error('Screen capture failed:', error);
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
    console.log('Rendering started - canvas setup will be implemented next');
    ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      function drawFrame() {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      }

      drawFrame();
    };
  }

  function stopStreaming() {
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
