'use client'
import { useState, useRef, useEffect } from "react";

type RecorderOptions = {
  frameRate?: number;
  mimeType?: string;
  audio?: boolean;
  preferCurrentTab?: boolean;
  audioBitsPerSecond?: 2_500_000;
  videoBitsPerSecond?: 2_500_000;
};

type ScreenRecorderProps = {
  options?: RecorderOptions;
  videoSrc: string; // Prop for video source
};

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  videoSrc,
  options = {
    frameRate: 60,
    mimeType: "video/mp4",
    audio: true,
    preferCurrentTab: true,
  },
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Reference to the canvas
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null); // Context to draw on canvas
  const videoRef = useRef<HTMLVideoElement | null>(null); // Reference to video element

  // Initialize the canvas drawing context and draw the video frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctxRef.current = ctx;

        // Start drawing the video on the canvas
        const draw = () => {
          const video = videoRef.current;
          if (video && ctxRef.current) {
            ctxRef.current.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctxRef.current.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw video frame
          }
          requestAnimationFrame(draw); // Continue drawing in the next frame
        };
        draw();
      }
    }
  }, [videoSrc]);

  const startRecording = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas element not found.");
        return;
      }
  
      // Ensure the video element is properly loaded and playing
      const videoElement = videoRef.current as HTMLVideoElement & { captureStream: () => MediaStream }; // คาสต์ชนิดที่นี่
      if (!videoElement) {
        console.error("Video element not found.");
        return;
      }
  
      await videoElement.play(); // Play video to capture it
  
      // Capture the stream from the canvas (video only)
      const videoStream = canvas.captureStream(options.frameRate || 60);
  
      // Capture audio from the video element
      const audioTracks = videoElement.captureStream().getAudioTracks();
      
      // Combine the video stream and audio stream into one MediaStream
      const mediaStream = new MediaStream([
        ...videoStream.getTracks(),
        ...audioTracks,
      ]);
  
      // Create MediaRecorder to capture the stream
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: options.mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond,
        videoBitsPerSecond: options.videoBitsPerSecond,
      });
  
      let chunks: Blob[] = [];
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        setVideoURL(url); // Set the recorded video URL for playback
        chunks = [];
      };
  
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting canvas recording:", err);
    }
  };
  
  

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="absolute bottom-10 z-10 flex flex-col items-center space-y-4">
      {/* Button to Start or Stop recording */}
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
        >
          Stop Recording
        </button>
      )}

      {/* Video Preview and Download */}
      {videoURL && (
        <div className="mt-4">
          <video
            src={videoURL}
            controls
            className="w-full max-w-lg rounded-lg shadow-lg"
          />
          <a
            href={videoURL}
            download="video.mp4"
            className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Download Video
          </a>
        </div>
      )}

      {/* Canvas Element for Recording */}
      <canvas
        ref={canvasRef}
        width={180} // Small size for canvas
        height={320}
        className="block border border-gray-300" // Add border for clarity
      />
      
      {/* Hidden Video Element for playback */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="hidden"
        playsInline
        autoPlay
        loop
      />
    </div>
  );
};

export default ScreenRecorder;
