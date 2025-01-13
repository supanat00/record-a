'use client'
import React, { useRef, useState, useEffect } from "react";

type ScreenRecorderProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
};

const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ canvasRef, setIsRecording }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecordingState] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const stream = canvasRef.current.captureStream(30); // 30 FPS capture from canvas
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      setRecordedChunks((prev) => [...prev, event.data]);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };
  }, [canvasRef, recordedChunks]);

  const startRecording = () => {
    if (!mediaRecorderRef.current) return;
    setRecordedChunks([]);
    mediaRecorderRef.current.start();
    setIsRecordingState(true);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecordingState(false);
    setIsRecording(false);
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "recording.webm";
    a.click();
  };

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>

        {/* แสดงปุ่มดาวน์โหลดเมื่อบันทึกเสร็จ */}
        {videoUrl && (
          <div>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-sm border-2 border-gray-400 rounded-md"
            />
            <button
              onClick={downloadVideo}
              className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2"
            >
              Download Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenRecorder;
