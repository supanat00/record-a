type VideoPlayerProps = {
  videoSrc: string;
};

export const Fakecall: React.FC<VideoPlayerProps> = ({ videoSrc }) => {
  return (
    <div className="w-full h-full items-center bg-black">
      <video
        src={videoSrc}
        className="w-full h-full object-cover"
        playsInline  
        autoPlay                  
        >
        </video>
    </div>
  );
};

export default Fakecall;
