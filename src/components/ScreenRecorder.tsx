"use client";

import { useState, useRef,} from "react";

type RecorderOptions = {
  frameRate?: number;
  mimeType?: string;
  audio?: boolean;
  preferCurrentTab?: boolean;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
};

type ScreenRecorderProps = {
  options?: RecorderOptions;
};

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  options = {
    frameRate: 60,
    mimeType: "video/webm",
    audio: true,
    preferCurrentTab: true,
    audioBitsPerSecond: 2_500_000,
    videoBitsPerSecond: 2_500_000,
  },
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startRecording = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: options.frameRate },
        audio: options.audio,
        preferCurrentTab: options.preferCurrentTab,
      } as DisplayMediaStreamOptions);

      const audioStream = options.audio
        ? await navigator.mediaDevices.getUserMedia({ audio: true })
        : null;

      const combinedStream = new MediaStream([
        ...videoStream.getTracks(),
        ...(audioStream ? audioStream.getTracks() : []),
      ]);

      streamRef.current = combinedStream;

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: options.mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond,
        videoBitsPerSecond: options.videoBitsPerSecond,
      });

      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: options.mimeType });
        setVideoURL(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // วาด canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        canvas.width = 1280;
        canvas.height = 720;
        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          ctx.fillRect(50, 50, 200, 100); // วาดตัวอย่างสี่เหลี่ยม
          if (isRecording) requestAnimationFrame(draw);
        };
        draw();
      }
    } catch (err) {
      console.error("Error starting screen recording:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      ></canvas>
      <div className="absolute bottom-10 flex flex-col items-center space-y-4">
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
      </div>
    </div>
  );
};

export default ScreenRecorder;
