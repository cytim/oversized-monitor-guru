import { useEffect, useRef, useState } from 'react';
import { StreamConfig } from '../types';
import './StreamView.css';

interface StreamViewProps {
  streamConfig: StreamConfig;
  onStopMirroring: () => void;
}

const validateStreamConfig = (streamConfig: StreamConfig, videoWidth: number, videoHeight: number): StreamConfig => {
  const config = { ...streamConfig };
  config.offset_x = Math.round(config.offset_x * config.dpr);
  config.offset_y = Math.round(config.offset_y * config.dpr);
  config.width = Math.round(config.width * config.dpr);
  config.height = Math.round(config.height * config.dpr);

  config.offset_x = Math.max(0, config.offset_x);
  config.offset_y = Math.max(0, config.offset_y);

  config.offset_x = Math.min(config.offset_x, videoWidth - 1);
  config.offset_y = Math.min(config.offset_y, videoHeight - 1);

  config.width = Math.max(1, config.width);
  config.height = Math.max(1, config.height);

  config.width = Math.min(config.width, videoWidth - config.offset_x);
  config.height = Math.min(config.height, videoHeight - config.offset_y);

  return config;
};

function StreamView({ streamConfig, onStopMirroring }: StreamViewProps) {
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
      const screenWidth = window.screen.width * streamConfig.dpr;
      const screenHeight = window.screen.height * streamConfig.dpr;

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: screenWidth, max: screenWidth },
          height: { ideal: screenHeight, max: screenHeight },
          frameRate: { ideal: streamConfig.frame_rate, max: streamConfig.frame_rate }
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
    console.log('Rendering started:', streamConfig);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    ctxRef.current = canvas.getContext('2d', { alpha: false });
    ctxRef.current!.imageSmoothingEnabled = false;

    video.onloadedmetadata = () => {
      console.log('Video bounds:', video.videoWidth, video.videoHeight);

      const drawFrame = (currentTime: number) => {
        if (!video || !canvas || !ctxRef.current) return;

        if (video.paused || video.ended) {
          return;
        }

        const frameInterval = 1000 / streamConfig.frame_rate;
        if (currentTime - lastFrameTimeRef.current >= frameInterval) {
          const currentConfig = validateStreamConfig(streamConfig, video.videoWidth, video.videoHeight);

          if (currentConfig.width !== canvas.width || currentConfig.height !== canvas.height) {
            canvas.width = currentConfig.width / streamConfig.dpr;
            canvas.height = currentConfig.height / streamConfig.dpr;
          }

          ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

          ctxRef.current.drawImage(
            video,
            currentConfig.offset_x, currentConfig.offset_y, currentConfig.width, currentConfig.height,
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
