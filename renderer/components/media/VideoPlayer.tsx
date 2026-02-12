import "videojs-hotkeys";
import "video.js/dist/video-js.css";
import "../../styles/video-player.scss";

import React, { HTMLAttributes, memo, useMemo } from "react";
import { TbMessageCircle2 } from "react-icons/tb";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";

import AnnotationPopup from "./video-js/annotation-popup";
import CaptionButton from "./video-js/caption-button";
import EndVideoModal from "./video-js/end-video-modal";

type VideoPlayerProps = HTMLAttributes<HTMLVideoElement> & {
  options?: any;
  onReady?: (player: Player) => void;
  onEndModalReady?: (modal: EndVideoModal) => void;
  children?: React.ReactNode;
};

// Desktop/Electron: same MSE-based streaming helper as web version
function setupMSE(source: string, videoEl: HTMLVideoElement) {
  const mediaSource = new MediaSource();
  let duration = 0;

  mediaSource.addEventListener("sourceopen", function () {
    fetch(source, {
      method: "HEAD",
    }).then((res) => {
      const contentLength = parseInt(res.headers.get("content-length") ?? "0");
      const videoLength = res.headers.get("x-goog-meta-video-length");

      if (videoLength) {
        duration = parseInt(videoLength);
        mediaSource.duration = duration;
      } else if (contentLength) {
        duration = contentLength / 500000;
        mediaSource.duration = duration;
      }

      const sourceBuffer = mediaSource.addSourceBuffer(
        'video/mp4; codecs="avc1.42E01E,mp4a.40.2"'
      );

      let currentByte = 0;

      function onUpdateEnd() {
        if (!sourceBuffer.updating && mediaSource.readyState === "open") {
          mediaSource.endOfStream();
        }
      }

      const requestNextChunk = () => {
        const nextByte = Math.min(currentByte + 2000000, contentLength);

        fetch(source, {
          headers: { range: `bytes=${currentByte}-${nextByte - 1}` },
        })
          .then((res) => res.arrayBuffer())
          .then((buf) => {
            sourceBuffer.addEventListener("updateend", onUpdateEnd, {
              once: true,
            });
            sourceBuffer.appendBuffer(buf);

            currentByte = nextByte;

            if (currentByte < contentLength) {
              sourceBuffer.removeEventListener("updateend", onUpdateEnd);
              requestNextChunk();
            }
          });
      };

      requestNextChunk();
    });
  });

  return URL.createObjectURL(mediaSource);
}

const VideoPlayer = ({
  options,
  children,
  onReady,
  onEndModalReady,
  className = "",
}: VideoPlayerProps) => {
  const videoJsOptions = useMemo(() => {
    return {
      controls: true,
      responsive: true,
      aspectRatio: "16:9",
      playsInline: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controlBar: {
        pictureInPictureToggle: false,
      },
      plugins: {
        hotkeys: {
          volumeStep: 0.1,
          seekStep: 5,
          enableModifiersForNumbers: false,
        },
      },
      ...options,
    };
  }, [options]);

  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<Player | null>();

  const modalRef = React.useRef<EndVideoModal>();
  const popupRef = React.useRef<AnnotationPopup>();
  const captionButtonRef = React.useRef<CaptionButton>();

  React.useEffect(() => {
    if (!videoRef.current) return;

    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add(
        "vjs-big-play-centered",
        "vento-player",
        ...className.split(" ")
      );

      videoRef.current.parentElement!.insertBefore(
        videoElement,
        videoRef.current
      );

      const player = (playerRef.current = videojs(
        videoElement,
        videoJsOptions,
        () => {
          videojs.log("player is ready");
          onReady?.(player);

          captionButtonRef.current?.toggleCaption();
          const header = videoElement.querySelector("[data-slot='overlay']");

          if (header) {
            player.el().appendChild(header);
          }

          const source: string = videoJsOptions.sources?.[0]?.src;
          const useMSE =
            new Date(videoJsOptions.createdAt) >=
            new Date("2023-04-09 08:23:00.107 GMT-0000");

          if (source && source.endsWith("mp4") && useMSE) {
            const videoEl = videoElement.querySelector("video")!;

            const url = setupMSE(source, videoEl);
            videoEl!.src = url;
          }
        }
      ));

      videoElement.querySelector("video")?.setAttribute("playsinline", "true");

      videoElement
        .querySelector("video")
        ?.addEventListener("touchstart", () => {
          if (player.paused()) {
            player.play();
          } else if (player.userActive()) {
            player.pause();
          }
        });

      player.playbackRate(
        parseFloat(localStorage.getItem("playbackRate") ?? "1")
      );

      player.preload(true);

      player.on("ratechange", () => {
        localStorage.setItem("playbackRate", player.playbackRate().toString());
      });

      modalRef.current = new EndVideoModal(player, {
        visible: videoJsOptions.allowEndVideoModal,
      });
      onEndModalReady?.(modalRef.current);

      popupRef.current = new AnnotationPopup(player);

      captionButtonRef.current = new CaptionButton(player, {
        kind: "captions",
        label: "default",
        src: videoJsOptions.trackSource,
        srclang: "en",
        default: true,
      });
    } else {
      const player = playerRef.current;

      player.autoplay(videoJsOptions.autoplay);

      if ((videoJsOptions.sources?.length ?? 0) > 0) {
        player.src(videoJsOptions.sources);
      }

      if (captionButtonRef.current) {
        captionButtonRef.current.updateOption({
          kind: "captions",
          label: "default",
          src: videoJsOptions.trackSource,
          srclang: "en",
          default: true,
        });
      }

      modalRef.current?.toggle(videoJsOptions.allowEndVideoModal);
      onReady?.(player);
    }
  }, [onReady, videoJsOptions, className]);

  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player className="vjsPlayer" ref={videoRef}>
      {children}
      <button
        style={{ display: "none" }}
        id="annotationBtnTemplate"
        className="timeline-btn"
      >
        <TbMessageCircle2 size={20} />
      </button>
      <button
        style={{ display: "none" }}
        id="linkCtaTemplate"
        className="timeline-btn"
      >
        <img src="/assets/cta-link.png" />
      </button>
    </div>
  );
};

export default memo(VideoPlayer);

