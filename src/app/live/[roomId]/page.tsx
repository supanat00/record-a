// pages/Live.tsx
import CanvasContainer from "@/components/CanvasContainer";

type Params = Promise<{ roomId: string }>;

export default async function Live({ params }: { params: Params }) {
  const { roomId } = await params;
  const imageSrc = `/images/bg-button/asset${String(roomId).padStart(4, "0")}.jpg`;
  const videoSrc = `/videos/${String(roomId).padStart(4, "0")}.mp4`;

  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-black">
      {/* CanvasContainer สำหรับการวาดทั้ง IncomingCallScreen และ Camera */}
      <CanvasContainer imageSrc={imageSrc} videoSrc={videoSrc} />
      
      {/* Live Room Header */}
      <h1 className="absolute text-2xl font-bold text-white z-10">Live Room: {roomId}</h1>
    </div>
  );
}
