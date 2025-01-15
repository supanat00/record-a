"use client";
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
    width: 1920,
    height: 1080,
    facingMode: { exact: "user" },
};

const fallbackConstraints = {
    width: 1920,
    height: 1080,
    facingMode: { exact: "environment" },
};

export const Camera = forwardRef<HTMLVideoElement>((_, ref) => {
    const [constraints, setConstraints] = useState(videoConstraints);
    const [mirrored, setMirrored] = useState(false);
    const [isPortrait, setIsPortrait] = useState(true);

    const webcamRef = useRef<Webcam>(null);

    useEffect(() => {
        const checkCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
                setConstraints(videoConstraints);
                setMirrored(true);
                mediaStream.getTracks().forEach((track) => track.stop());
            } catch {
                // ใช้ fallback constraints ในกรณีที่เกิดข้อผิดพลาด
                setConstraints(fallbackConstraints);
                setMirrored(true);
            }
        };

        const handleOrientationChange = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        checkCamera();
        handleOrientationChange();
        window.addEventListener("resize", handleOrientationChange);

        return () => {
            window.removeEventListener("resize", handleOrientationChange);
        };
    }, []);

    // ส่ง `video` element กลับผ่าน `ref`
    useImperativeHandle(ref, () => webcamRef.current?.video as HTMLVideoElement);

    return (
        <div className="camera-container absolute top-0 right-0 m-4 z-10">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/webp"
                videoConstraints={constraints}
                mirrored={mirrored}
                className={isPortrait ? "portraitWebcam" : "landscapeWebcam"}
                style={{
                    width: "120px",
                    height: "160px",
                    objectFit: "cover",
                    objectPosition: "center",
                }}
            />
        </div>
    );
});

// กำหนด displayName ให้คอมโพเนนต์
Camera.displayName = "Camera";

export default Camera;
