"use client";

import { useState, useRef } from "react";

type RecorderOptions = {
  frameRate?: number;
  mimeType?: string;
  audio?: boolean;
  preferCurrentTab?:boolean;
  audioBitsPerSecond?: 2_500_000,
  videoBitsPerSecond?: 2_500_000,
};

type ScreenRecorderProps = {
  options?: RecorderOptions;
};

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
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
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      // รับ video stream
      const videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: options.frameRate },
        audio: options.audio,
        preferCurrentTab: options.preferCurrentTab, // เพิ่มส่วนนี้
      } as DisplayMediaStreamOptions); // บังคับข้ามการตรวจสอบ
  
      // รับ audio stream
      const audioStream = options.audio
        ? await navigator.mediaDevices.getUserMedia({ audio: options.audio, })
        : null;
  
      // รวม video และ audio stream (ถ้ามี)
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
  
      let chunks: Blob[] = [];
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        chunks = []
      };
  
      mediaRecorder.start();
      setIsRecording(true);
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
    <div className="absolute bottom-10 z-10 flex flex-col items-center space-y-4">
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
            download="video.mp4"
            className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
