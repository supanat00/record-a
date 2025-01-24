"use client";
import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import AWS from "aws-sdk";
import { S3 } from "aws-sdk";

const s3 = new S3({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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
  isAcceptPressed: boolean; // รับค่าจาก LiveContent
  options?: RecorderOptions;
  ref: React.Ref<unknown> | undefined
};

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  videoSrc,
  cameraRef,
  imageSrc,
  roomId,
  isAcceptPressed, // รับค่าจาก Props
  ref,
  options = {
    frameRate: 60,
    mimeType: "video/webm",
    audio: true,
    audioBitsPerSecond: 2_500_000,
    videoBitsPerSecond: 2_500_000,
  },
}) => {
  // const [isRecording, setIsRecording] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [fileUpload, setFileUpload]: any = useState(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
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

  // ย้ายฟังก์ชัน drawStaticElements มาไว้ใน scope หลักของ component
  const drawStaticElements = (ctx: CanvasRenderingContext2D, backgroundImage: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.save();
    ctx.globalAlpha = 0.5;
    const scale = Math.max(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
    const scaledWidth = backgroundImage.width * scale;
    const scaledHeight = backgroundImage.height * scale;
    ctx.drawImage(
      backgroundImage,
      (canvas.width - scaledWidth) / 2,
      (canvas.height - scaledHeight) / 2,
      scaledWidth,
      scaledHeight
    );
    ctx.restore();

    // วาดข้อความ
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(displayName, canvas.width / 2, 60);
    ctx.font = "10px Arial";
    ctx.fillStyle = "gray";
    ctx.fillText("Incoming Call...", canvas.width / 2, 80);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadBackgroundImage = (): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const backgroundImage = new Image();
        backgroundImage.src = imageSrc;
        backgroundImage.onload = () => resolve(backgroundImage);
        backgroundImage.onerror = reject;
      });
    };

    loadBackgroundImage()
      .then((backgroundImage) => {
        drawStaticElements(ctx, backgroundImage);

        const drawDynamicElements = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawStaticElements(ctx, backgroundImage); // วาดภาพพื้นหลังและข้อความซ้ำ

          // วาดวิดีโอถ้ามี
          const mainVideo = videoRef.current;
          if (mainVideo) {
            ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);
          }

          // วาดกล้องพร้อมจัดการการกลับด้าน (mirroring)
          if (cameraRef?.current) {
            ctx.save(); // บันทึกสถานะ context

            const canvasHeight = canvas.height;

            // ขนาดของกรอบ (4:3 ในแนวตั้ง)
            const cameraHeight = canvasHeight * 0.2; // 20% ของความสูงจอ
            const cameraWidth = (cameraHeight / 4) * 3; // อัตราส่วน 4:3

            // ขนาดและอัตราส่วนของกล้องจริง
            const videoWidth = cameraRef.current.videoWidth || 1;
            const videoHeight = cameraRef.current.videoHeight || 1;
            const aspectRatio = videoWidth / videoHeight;

            // คำนวณการครอบ (Crop) เพื่อให้ภาพเต็มกรอบ
            let sourceWidth, sourceHeight, sourceX, sourceY;
            if (aspectRatio > 3 / 4) {
              // ภาพกว้างเกินไป (Crop ด้านซ้าย-ขวา)
              sourceHeight = videoHeight;
              sourceWidth = sourceHeight * (3 / 4); // กรอบ 4:3
              sourceX = (videoWidth - sourceWidth) / 2; // กึ่งกลางแนวนอน
              sourceY = 0;
            } else {
              // ภาพสูงเกินไป (Crop ด้านบน-ล่าง)
              sourceWidth = videoWidth;
              sourceHeight = sourceWidth / (3 / 4); // กรอบ 4:3
              sourceX = 0;
              sourceY = (videoHeight - sourceHeight) / 2; // กึ่งกลางแนวตั้ง
            }

            // ตำแหน่งมุมขวาบน
            const cameraX = canvas.width - cameraWidth - 10; // เว้นขอบ 10px จากขวา
            const cameraY = 10; // เว้นขอบ 10px จากบน

            ctx.translate(cameraX + cameraWidth, cameraY); // ย้ายไปตำแหน่งที่ต้องการ
            ctx.scale(-1, 1); // กลับด้านในแกน x

            // วาดภาพจากกล้องแบบครอบ (Crop) ให้เต็มกรอบ 4:3
            ctx.drawImage(
              cameraRef.current,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              0,
              0,
              cameraWidth,
              cameraHeight
            );

            ctx.restore(); // คืนค่าที่บันทึกไว้
          }
          requestAnimationFrame(drawDynamicElements);
        };

        drawDynamicElements();
      })
      .catch((error) => {
        console.error("Failed to load background image:", error);
      });
  }, [imageSrc, displayName, videoRef, cameraRef, drawStaticElements, videoURL]);

  // ฟังก์ชันการบันทึกหน้าจอใน canvas
  const startRecording = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas element not found.");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Canvas context not found.");
        return;
      }

      // โหลดและวาดภาพพื้นหลัง
      const backgroundImage = new Image();
      backgroundImage.src = imageSrc;
      backgroundImage.onload = () => {
        drawStaticElements(ctx, backgroundImage);
      };

      // รอให้เฟรมแรกถูกวาด
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

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: options.mimeType });
        const url = window.URL.createObjectURL(blob);
        setVideoURL(url);
        chunks = [];

        // Convert Blob to File for upload
        const fileUpload = new File([blob], "recorded-video.webm", { type: "video/webm" });
        setFileUpload(fileUpload);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Error starting canvas recording:", err);
    }
    // setIsRecording(true);
    setShowStartButton(false); // ซ่อนปุ่มและ div หลังจากเริ่มบันทึก
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    videoRef.current?.pause();
    videoRef.current!.currentTime = 0;
    // setIsRecording(false);
  };

  const uploadToS3 = async (file: any) => {
    try {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: `video/${Date.now()}_${file.name}`,
        Body: file,
        ContentType: file.type,
      };
    
      try {
        const result = await s3.upload(uploadParams).promise();
        console.log("File uploaded successfully:", result);
        alert("File upload success");
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed");
    }
  };

  return (
    <div className="absolute z-50 flex flex-col items-center w-full h-full">
      {/* ปุ่มที่ 1: ปุ่ม Start Recording */}
      {showStartButton && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg border">
          <p className="text-lg text-center mb-4">กดปุ่ม &quot;OK&quot; เพื่อเริ่มเล่น</p>
          <button
            onClick={startRecording} // กดแล้วจะเริ่มบันทึกและซ่อน div นี้
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none"
          >
            OK
          </button>
        </div>
      )}


      {/* ปุ่มที่ 2: Stop Recording */}
      {isAcceptPressed && (
        <button
          onClick={stopRecording}
          className="absolute bottom-10 right-10 w-16 h-16 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none"
        >
          Stop
        </button>
      )}
      {videoURL && (
        <div className="flex flex-col items-center">
          <video
            src={videoURL}
            autoPlay
            playsInline
            loop
            className="block relative w-full max-w-lg rounded-lg shadow-lg"
          />
          <a
            href={videoURL}
            download="video.webm"
            className="absolute top-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Download Video
          </a>
          <a
            onClick={() => { uploadToS3(fileUpload) }}
            className="absolute top-1/2 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Upload Video
          </a>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        className="hidden border border-gray-300"
      />

      <video
        ref={videoRef}
        src={videoSrc}
        className="hidden"
        playsInline
      />
    </div>
  );
};

export default ScreenRecorder;
