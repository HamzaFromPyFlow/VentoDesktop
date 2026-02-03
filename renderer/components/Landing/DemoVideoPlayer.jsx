import React, { useState, useRef } from 'react';
import { BiExpandAlt, BiVolumeFull, BiVolumeMute } from 'react-icons/bi';

function DemoVideoPlayer({ src, poster, className = '', autoPlay, playsInline, muted: initialMuted, loop }) {
  const [muted, setMuted] = useState(initialMuted || false);
  const videoRef = useRef(null);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const handleFullscreen = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.requestFullscreen();
        videoRef.current.muted = false;
        setMuted(false);
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline={playsInline}
        muted={muted}
        loop={loop}
        className="w-full rounded-lg"
      >
        <p>Video Not Available</p>
      </video>
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleMuteToggle}
          className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
        >
          {muted ? <BiVolumeMute size={20} /> : <BiVolumeFull size={20} />}
        </button>
        <button
          onClick={handleFullscreen}
          className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
        >
          <BiExpandAlt size={20} />
        </button>
      </div>
    </div>
  );
}

export default DemoVideoPlayer;
