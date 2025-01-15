// LivePage.tsx (Server Component)
import LiveContent from "@/components/LiveContent";

type Params = Promise<{ roomId: string }>;

export default async function LivePage({ params }: { params: Params }) {
  const { roomId } = await params;
  const imageSrc = `/images/bg-button/asset${String(roomId).padStart(4, "0")}.jpg`;
  const videoSrc = `/videos/${String(roomId).padStart(4, "0")}.mp4`;

  return (
    <LiveContent roomId={roomId} imageSrc={imageSrc} videoSrc={videoSrc} />
  );
}
