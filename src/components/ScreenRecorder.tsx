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
  videoSrc: string; // เพิ่ม prop เพื่อรับ src ของวิดีโอ
};

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  videoSrc,
  options = {
    frameRate: 60,
    mimeType: "video/webm",
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

  // Initialize the canvas drawing context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctxRef.current = ctx;

        // เริ่มวาดบางอย่างบน canvas
        const draw = () => {
          const video = videoRef.current;
          if (video && ctxRef.current) {
            ctxRef.current.clearRect(0, 0, canvas.width, canvas.height); // ลบภาพเดิม
            ctxRef.current.drawImage(video, 0, 0, canvas.width, canvas.height); // วาดวิดีโอใน canvas
          }
          requestAnimationFrame(draw); // เรียกซ้ำเพื่อวาดในเฟรมถัดไป
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
  
      // Check if captureStream is available
      const videoElement = document.createElement("video");
      videoElement.src = videoSrc; // Use the passed videoSrc
      videoElement.load();
  
      // ตรวจสอบว่า `captureStream` รองรับ
      if (typeof videoElement.captureStream !== 'function' && typeof videoElement.mozCaptureStream !== 'function') {
        console.error("CaptureStream is not supported.");
        return;
      }
  
      const videoStream = canvas.captureStream(options.frameRate || 60); // Capture stream from the canvas
      await videoElement.play();
  
      const audioStream = options.audio ? videoElement.captureStream().getAudioTracks() : null;
      const combinedStream = new MediaStream([
        ...videoStream.getTracks(),
        ...(audioStream ? audioStream : []),
      ]);
  
      const mediaRecorder = new MediaRecorder(combinedStream, {
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
        setVideoURL(url);
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
            download="video.webm"
            className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Download Video
          </a>
        </div>
      )}

      {/* Canvas Element */}
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />
      {/* The canvas can be made visible by adjusting the class if you want it on screen */}

      {/* Video Element */}
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
