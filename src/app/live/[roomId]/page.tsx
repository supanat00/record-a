import { IncomingCallScreen } from "@/components/IncomingCallScreen";
import { Camera } from "@/components/Camera";
import ScreenRecorder from "@/components/ScreenRecorder";

type Params = Promise<{ roomId: string }>;

export default async function Live({ params }: { params: Params }) {
  const { roomId } = await params;
  const imageSrc = `/images/bg-button/asset${String(roomId).padStart(4, "0")}.jpg`;
  const videoSrc = `/videos/${String(roomId).padStart(4, "0")}.mp4`;

  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-black">     
      {/*ScreenRecorder */}
      <ScreenRecorder videoSrc={videoSrc} options={{ frameRate: 60, mimeType: "video/webm", audio: true }} />

      {/* Incoming Call Screen */}
      <IncomingCallScreen imageSrc={imageSrc} videoSrc={videoSrc} />

      {/* Live Room Header */}
      <h1 className="absolute text-2xl font-bold text-white z-10">Live Room: {roomId}</h1>

      {/* Camera */}
      <Camera />
    </div>
  );
}
