"use client";
import { useRef, useState } from "react";
import { IncomingCallScreen } from "@/components/IncomingCallScreen";
import { Camera } from "@/components/Camera";
import ScreenRecorder from "@/components/ScreenRecorder";

type LiveContentProps = {
    roomId: string;
    imageSrc: string;
    videoSrc: string;
};

export default function LiveContent({
    roomId,
    imageSrc,
    videoSrc,
}: LiveContentProps) {
    const cameraRef = useRef<HTMLVideoElement>(null);
    const screenRecorderRef = useRef<{ playVideo: () => void } | null>(null);
    const [isIncomingCallVisible, setIsIncomingCallVisible] = useState(true);

    return (
        <section className="relative flex justify-center items-center w-full h-screen">
            <ScreenRecorder
                ref={screenRecorderRef}
                videoSrc={videoSrc}
                cameraRef={cameraRef}
                imageSrc={imageSrc}
                roomId={roomId}
                isIncomingCallVisible={isIncomingCallVisible}
                options={{ frameRate: 60, mimeType: "video/webm", audio: true }}
            />
            <IncomingCallScreen
                imageSrc={imageSrc}
                videoSrc={videoSrc}
                roomId={roomId}
                onAccept={() => {
                    setIsIncomingCallVisible(false); // ปิด IncomingCallScreen
                    screenRecorderRef.current?.playVideo(); // เล่นวิดีโอใน ScreenRecorder
                }}
                onReject={() => console.log("Call Rejected")}
            />

            <Camera ref={cameraRef} /> {/* ส่ง Ref ไปยัง ScreenRecorder */}
        </section>
    );
}
