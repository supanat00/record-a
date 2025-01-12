"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // for navigating back to the previous page
import Fakecall from "@/components/Fakecall"; // assuming Fakecall is in components

type IncomingCallScreenProps = {
  imageSrc: string; // Prop for imageSrc
  videoSrc: string; // Prop for videoSrc to pass to Fakecall
};

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  imageSrc,
  videoSrc,
}) => {
  const [showFakeCall, setShowFakeCall] = useState(false); // State to control screen change
  const router = useRouter();

  const handleAccept = () => {
    console.log("Accept button clicked");
    setShowFakeCall(true); // Show the Fakecall screen
  };

  const handleReject = () => {
    console.log("Reject button clicked");
    router.push("/"); // Navigate back to the first page (home)
  };

  if (showFakeCall) {
    return <Fakecall videoSrc={videoSrc} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-between items-center z-50">
      <div className="absolute inset-0 w-full h-full blur-sm z-50">
        <Image
          src={imageSrc} // Use imageSrc prop passed from parent
          alt="Incoming Call Background"
          fill
          priority
          className="object-cover w-full h-full"
        />
      </div>

      <div className="mt-16 text-white text-2xl z-50 flex flex-col items-center">
        <div>แมวเป้า</div>
        <div className="text-sm text-gray-300 mt-2">Incoming Call...</div>
      </div>

      <div className="absolute bottom-20 flex justify-around w-4/5 max-w-sm items-center z-50">
        <div className="flex flex-col items-center animate-bounce-slow">
          <button
            onClick={handleReject}
            className="w-16 h-16 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition duration-300 flex items-center justify-center"
          >
            {/* Placeholder for the future icon */}
          </button>
          <span className="mt-2 text-sm text-white">Decline</span>
        </div>

        <div className="flex flex-col items-center animate-bounce-fast">
          <button
            onClick={handleAccept}
            className="w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition duration-300 flex items-center justify-center"
          >
            {/* Placeholder for the future icon */}
          </button>
          <span className="mt-2 text-sm text-white">Accept</span>
        </div>
      </div>
    </div>
  );
};
