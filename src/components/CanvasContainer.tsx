'use client'
import { useRef, useState, useEffect } from "react";
import { IncomingCallScreen } from "@/components/IncomingCallScreen";
import { Camera } from "@/components/Camera";
import ScreenRecorder from "@/components/ScreenRecorder";

type CanvasContainerProps = {
  imageSrc: string;
  videoSrc: string;
};

const CanvasContainer: React.FC<CanvasContainerProps> = ({ imageSrc, videoSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // เรียกใช้งานเมื่อ component ถูก mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // วาด IncomingCallScreen ลงบน canvas
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    // วาด Camera ลงบน canvas
    const updateCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // ลบภาพเดิม
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // วาดภาพจาก IncomingCallScreen

      // ถ้า Camera มี video element อยู่ให้วาดลงบน canvas
      const webcamElement = document.querySelector("video") as HTMLVideoElement;
      if (webcamElement) {
        ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
      }

      if (isRecording) {
        requestAnimationFrame(updateCanvas); // ทำการอัพเดตภาพเรื่อยๆ เมื่อบันทึก
      }
    };

    updateCanvas(); // เริ่มต้นการอัพเดต canvas

  }, [imageSrc, videoSrc, isRecording]);

  return (
    <div className="relative w-full h-full">
      {/* Canvas ที่แสดง IncomingCallScreen และ Camera */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-10" />
      
      {/* Screen Recorder */}
      <ScreenRecorder canvasRef={canvasRef} setIsRecording={setIsRecording} />
      
      {/* Incoming Call Screen */}
      <IncomingCallScreen imageSrc={imageSrc} videoSrc={videoSrc} />

      {/* Camera */}
      <Camera />


    </div>
  );
};

export default CanvasContainer;
