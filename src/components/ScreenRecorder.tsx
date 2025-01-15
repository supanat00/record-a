"use client";
import React, { useRef, useEffect, useState, useImperativeHandle } from "react";

type RecorderOptions = {
  frameRate?: number;
  mimeType?: string;
  audio?: boolean;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
};

type ScreenRecorderProps = {
  videoSrc: string;
  cameraRef: React.RefObject<HTMLVideoElement | null>;
  imageSrc: string;
  roomId: string;
  isIncomingCallVisible: boolean;
  options?: RecorderOptions;
  ref: React.Ref<unknown> | undefined
};

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  videoSrc,
  cameraRef,
  imageSrc,
  roomId,
  isIncomingCallVisible,
  ref,
  options = {
    frameRate: 60,
    mimeType: "video/webm",
    audio: true,
    audioBitsPerSecond: 2_500_000,
    videoBitsPerSecond: 2_500_000,
  },
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // เปิดให้ LiveContent ควบคุมผ่าน ref
  useImperativeHandle(ref, () => ({
    playVideo() {
      videoRef.current?.play();
    },
  }));

  const names = [
    "JAMEJI",
    "COPPER",
    "PHUTATCHAI",
    "THAI",
    "PEEM WASU",
    "NEX",
    "MARC",
    "JINWOOK",
    "Marckris",
    "Khunpol",
    "AA",
    "Alan",
    "HEART",
  ];

  const displayName = names[parseInt(roomId, 10) - 1];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctxRef.current = ctx;

        const draw = () => {
          // วาดวิดีโอหลัก
          const mainVideo = videoRef.current;
          if (mainVideo) {
            ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);
          }

          // วาดกล้องพร้อมจัดการการกลับด้าน (mirroring)
          if (cameraRef?.current) {
            ctx.save(); // บันทึกสถานะ context

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // ขนาดและอัตราส่วนของกล้อง
            const cameraWidth = canvasWidth * 0.2; // 20% ของความกว้างจอ
            const cameraHeight = (cameraWidth / 3) * 4; // อัตราส่วน 3:4

            // ตำแหน่งมุมขวาบน
            const cameraX = canvasWidth - cameraWidth - 10; // เว้นขอบ 20px จากขวา
            const cameraY = 10; // เว้นขอบ 20px จากบน

            ctx.translate(cameraX + cameraWidth, cameraY); // ย้ายไปตำแหน่งที่ต้องการ
            ctx.scale(-1, 1); // กลับด้านในแกน x
            ctx.drawImage(cameraRef.current, 0, 0, cameraWidth, cameraHeight); // วาดกล้อง
            ctx.restore(); // คืนค่าที่บันทึกไว้
          }

          // ภาพพื้นหลังหน้าจอโทรเข้า
          // Draw incoming call UI if visible
          if (isIncomingCallVisible) {
            const backgroundImage = new Image();
            backgroundImage.src = imageSrc;
            backgroundImage.onload = () => {
              ctx.save();
              ctx.globalAlpha = 0.5;

              const imgWidth = backgroundImage.width;
              const imgHeight = backgroundImage.height;
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;

              const scale = Math.max(
                canvasWidth / imgWidth,
                canvasHeight / imgHeight
              );
              const scaledWidth = imgWidth * scale;
              const scaledHeight = imgHeight * scale;
              const offsetX = (canvasWidth - scaledWidth) / 2;
              const offsetY = (canvasHeight - scaledHeight) / 2;

              ctx.drawImage(
                backgroundImage,
                offsetX,
                offsetY,
                scaledWidth,
                scaledHeight
              );

              ctx.restore();
            };

            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(displayName, canvas.width / 2, 60);

            ctx.font = "10px Arial";
            ctx.fillStyle = "gray";
            ctx.fillText("Incoming Call...", canvas.width / 2, 80);
          }

          requestAnimationFrame(draw);
        };

        draw();
      }
    }
  }, [videoSrc, cameraRef, imageSrc, displayName, isIncomingCallVisible]);


  const startRecording = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas element not found.");
        return;
      }

      // รอให้ canvas เตรียมพร้อม
      await new Promise((resolve) => setTimeout(resolve, 100));

      // สร้าง MediaStream จาก canvas
      const canvasStream = canvas.captureStream(options.frameRate || 60);

      // เพิ่มเสียงจาก video (ถ้ามี)
      let mediaStream = canvasStream;
      const videoElement = videoRef.current as HTMLVideoElement & {
        captureStream: () => MediaStream;
      };

      if (options.audio && videoElement?.captureStream) {
        const audioTracks = videoElement.captureStream()?.getAudioTracks();
        if (audioTracks?.length) {
          mediaStream = new MediaStream([
            ...canvasStream.getTracks(),
            ...audioTracks,
          ]);
        }
      }

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

    videoRef.current?.pause();
    videoRef.current!.currentTime = 0;
  };

  return (
    <div className="absolute z-50 flex flex-col items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-6 py-2 text-white rounded-full ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {videoURL && (
        <div className="flex flex-col items-center">
          <video
            src={videoURL}
            controls
            className="relative w-full max-w-lg rounded-lg shadow-lg"
          />
          <a
            href={videoURL}
            download="video.webm"
            className="absolute top-1/2 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Download Video
          </a>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        className="hidden border border-gray-300"
      />

      <video
        ref={videoRef}
        src={videoSrc}
        className="hidden"
        playsInline
        loop
      />
    </div>
  );
};

export default ScreenRecorder;
