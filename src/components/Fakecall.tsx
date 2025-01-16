'use client'
import React, { useRef, forwardRef, useImperativeHandle } from "react";

type VideoPlayerProps = {
  videoSrc: string;
};

export const Fakecall = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoSrc }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // เปิดให้ parent component ควบคุมผ่าน ref
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    return (
      <div className="flex w-full h-full justify-center items-center bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-mds h-full object-cover"
          playsInline
          autoPlay
        />
      </div>
    );
  }
);

export default Fakecall;
