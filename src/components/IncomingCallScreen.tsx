"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Fakecall from "@/components/Fakecall";

type IncomingCallScreenProps = {
  imageSrc: string;
  videoSrc: string;
  roomId: string; // Pass roomId to match the name
  onAccept: () => void; // ฟังก์ชันที่เรียกเมื่อกดปุ่ม Accept
  onReject: () => void; // ฟังก์ชันที่เรียกเมื่อกดปุ่ม Reject
};

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  imageSrc,
  videoSrc,
  roomId,
  onAccept,
  onReject,
}) => {
  const [showFakeCall, setShowFakeCall] = useState(false);
  const router = useRouter();

  const handleAccept = () => {
    console.log("Accept button clicked");
    setShowFakeCall(true);
    onAccept();
  };

  const handleReject = () => {
    console.log("Reject button clicked");
    router.push("/");
    onReject();
  };

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

  if (showFakeCall) {
    return <Fakecall videoSrc={videoSrc} />;
  }

  return (
    <div className="flex flex-col p-8 bg-blue-200 rounded-lg border-2 border-white w-full max-w-lg">
      {/* ชื่ออยู่ตรงกลาง */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl z-50 flex flex-col items-center">
        <div>{displayName}</div>
        <div className="text-sm text-gray-300 mt-2">Incoming Call...</div>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full blur-sm z-40">
        <Image
          src={imageSrc}
          alt="Incoming Call Background"
          fill
          priority
          className="object-cover w-full h-full"
        />
      </div>

      {/* ปุ่ม */}
      <div className="absolute bottom-20 flex justify-around w-4/5 max-w-sm items-center z-50">
        <div className="flex flex-col items-center animate-bounce-slow">
          <button
            onClick={handleReject}
            className="w-16 h-16 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition duration-300 flex items-center justify-center"
          />
          <span className="mt-2 text-sm text-white">Decline</span>
        </div>
        <div className="flex flex-col items-center animate-bounce-fast">
          <button
            onClick={handleAccept}
            className="w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition duration-300 flex items-center justify-center"
          />
          <span className="mt-2 text-sm text-white">Accept</span>
        </div>
      </div>
    </div>
  );
};
