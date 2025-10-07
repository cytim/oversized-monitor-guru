import { useEffect, useRef, useState } from 'react';
import { InputConfig, StreamConfig } from '../types';
import './StreamView.css';

interface StreamViewProps {
  inputConfig: InputConfig;
  onStopMirroring: () => void;
}

const calculateStreamConfig = (inputConfig: InputConfig, videoWidth: number, videoHeight: number): StreamConfig => {
  let srcX = Math.round(inputConfig.offsetX * inputConfig.dpr);
  let srcY = Math.round(inputConfig.offsetY * inputConfig.dpr);
  let srcWidth = Math.round(inputConfig.width * inputConfig.dpr);
  let srcHeight = Math.round(inputConfig.height * inputConfig.dpr);

  srcX = Math.max(0, Math.min(srcX, videoWidth - 1));
  srcY = Math.max(0, Math.min(srcY, videoHeight - 1));

  srcWidth = Math.max(1, Math.min(srcWidth, videoWidth - srcX));
  srcHeight = Math.max(1, Math.min(srcHeight, videoHeight - srcY));

  return {
    srcX,
    srcY,
    srcWidth,
    srcHeight,
    destWidth: inputConfig.width,
    destHeight: inputConfig.height
  };
};

function StreamView({ inputConfig, onStopMirroring }: StreamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isCapturingRef = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCapturingRef.current) {
      isCapturingRef.current = true;
      startScreenCapture();
    }

    return () => {
      stopStreaming();
    };
  }, []);

  const startScreenCapture = async () => {
    try {
      const physicalWidth = window.screen.width * inputConfig.dpr;
      const physicalHeight = window.screen.height * inputConfig.dpr;

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: physicalWidth, max: physicalWidth },
          height: { ideal: physicalHeight, max: physicalHeight },
          frameRate: { ideal: inputConfig.frameRate, max: inputConfig.frameRate }
        },
        audio: false
      });

      mediaStreamRef.current = mediaStream;
      videoRef.current!.srcObject = mediaStream;

      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          stopStreaming();
          onStopMirroring();
        });
      }

      setLoading(false);
      setError(null);

      startRendering();
    } catch (err) {
      console.log('Screen capture failed:', err);
      handleCaptureError(err);
    }
  };

  const handleCaptureError = (err: unknown) => {
    setLoading(false);

    let errorMessage = 'Failed to start screen capture. ';
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Screen sharing was denied or cancelled.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No screen capture source found.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
    } else {
      errorMessage += 'Unknown error occurred.';
    }

    setError(errorMessage);
  };

  const startRendering = () => {
    console.log('Rendering started:', inputConfig);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    ctxRef.current = canvas.getContext('2d', { alpha: false });
    ctxRef.current!.imageSmoothingEnabled = false;

    video.onloadedmetadata = () => {
      console.log('Video dimensions:', video.videoWidth, video.videoHeight);

      const drawFrame = (currentTime: number) => {
        if (!video || !canvas || !ctxRef.current) return;

        if (video.paused || video.ended) {
          return;
        }

        const frameInterval = 1000 / inputConfig.frameRate;
        if (currentTime - lastFrameTimeRef.current >= frameInterval) {
          const streamConfig = calculateStreamConfig(inputConfig, video.videoWidth, video.videoHeight);

          if (streamConfig.destWidth !== canvas.width || streamConfig.destHeight !== canvas.height) {
            canvas.width = streamConfig.destWidth;
            canvas.height = streamConfig.destHeight;
          }

          ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

          ctxRef.current.drawImage(
            video,
            streamConfig.srcX, streamConfig.srcY, streamConfig.srcWidth, streamConfig.srcHeight,
            0, 0, canvas.width, canvas.height
          );

          lastFrameTimeRef.current = currentTime;
        }

        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };

      drawFrame(performance.now());
    };
  };

  const stopStreaming = () => {
    console.log('Stopping streaming');

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (ctxRef.current && canvasRef.current) {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <div className="stream-view">
      {loading && <div className="loading">Starting stream...</div>}
      <video ref={videoRef} autoPlay style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: loading || error ? 'none' : 'block' }} />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default StreamView;
