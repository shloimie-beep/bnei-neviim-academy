import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { FC } from "react";

type OrganicMediaType = "image" | "video";
type OrganicTextPosition = "top" | "center" | "bottom";
type OrganicTransition = "cut" | "fade";

export type OrganicMediaItem = {
  type: OrganicMediaType;
  src: string;
  startSec: number;
  endSec: number;
  sourceStartSec?: number;
  sourceEndSec?: number;
  fit?: "cover" | "contain";
  label?: string;
  transition?: OrganicTransition;
  zoom?: number;
  focusXPercent?: number;
  focusYPercent?: number;
};

export type OrganicTextOverlay = {
  startSec: number;
  endSec: number;
  text: string;
  position?: OrganicTextPosition;
  fontSize?: number;
  color?: string;
  background?: string;
};

export type OrganicAudioTrack = {
  src: string;
  startSec?: number;
  endSec?: number;
  volume?: number;
};

export type OrganicFinalCard = {
  startSec?: number;
  durationSeconds?: number;
  title?: string;
  subtitle?: string;
  cta?: string;
  imageSrc?: string;
  background?: string;
};

export type OrganicClipFactoryProps = {
  durationSeconds?: number;
  width?: number;
  height?: number;
  background?: string;
  mediaItems?: OrganicMediaItem[];
  textOverlays?: OrganicTextOverlay[];
  captions?: OrganicTextOverlay[];
  audioTrack?: OrganicAudioTrack | null;
  finalCard?: OrganicFinalCard | null;
};

const clamp = (value: number, min: number, max: number, fallback = min) => {
  const number = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
};

const mediaSrc = (src: string) =>
  /^https?:\/\//i.test(src) ? src : staticFile(src.replace(/^\/+/, ""));

const overlayPositionStyle = (position: OrganicTextPosition = "bottom") => {
  if (position === "top") return { top: "7%" };
  if (position === "center") return { top: "50%", transform: "translateY(-50%)" };
  return { bottom: "7%" };
};

const fadeOpacity = (frame: number, durationFrames: number, transition: OrganicTransition) => {
  if (transition !== "fade") return 1;
  const fadeFrames = Math.min(14, Math.floor(durationFrames / 3));
  if (fadeFrames <= 0) return 1;
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationFrames - fadeFrames, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
};

const OrganicMedia: FC<{ item: OrganicMediaItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = Math.max(1, Math.round((item.endSec - item.startSec) * fps));
  const opacity = fadeOpacity(frame, durationFrames, item.transition || "fade");
  const focusX = clamp(Number(item.focusXPercent ?? 50), 0, 100, 50);
  const focusY = clamp(Number(item.focusYPercent ?? 50), 0, 100, 50);
  const objectPosition = `${focusX}% ${focusY}%`;
  const baseZoom = clamp(Number(item.zoom ?? 1.04), 0.5, 2.5, 1.04);
  const driftZoom = interpolate(frame, [0, durationFrames], [baseZoom, baseZoom + 0.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const commonStyle = {
    height: "100%",
    objectFit: item.fit || "cover",
    objectPosition,
    opacity,
    transform: `scale(${driftZoom})`,
    transformOrigin: objectPosition,
    width: "100%",
  } as const;

  if (item.type === "video") {
    return (
      <Video
        src={mediaSrc(item.src)}
        startFrom={Math.round(clamp(Number(item.sourceStartSec ?? 0), 0, 3600, 0) * fps)}
        endAt={
          item.sourceEndSec === undefined
            ? undefined
            : Math.round(clamp(Number(item.sourceEndSec), 0.1, 3600, 0.1) * fps)
        }
        style={commonStyle}
      />
    );
  }

  return <Img src={mediaSrc(item.src)} style={commonStyle} />;
};

const TextOverlay: FC<{ item: OrganicTextOverlay; subtle?: boolean }> = ({ item, subtle = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = Math.max(1, Math.round((item.endSec - item.startSec) * fps));
  const opacity = interpolate(
    frame,
    [0, Math.min(8, durationFrames / 3), Math.max(9, durationFrames - 8), durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        ...overlayPositionStyle(item.position || "bottom"),
        color: item.color || "#ffffff",
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        fontSize: item.fontSize || (subtle ? 40 : 56),
        fontWeight: subtle ? 800 : 900,
        left: "7%",
        lineHeight: 1.12,
        opacity,
        position: "absolute",
        right: "7%",
        textAlign: "center",
        textShadow: "0 5px 24px rgba(0,0,0,0.58)",
        zIndex: 20,
      }}
    >
      <span
        style={{
          background: item.background || (subtle ? "rgba(12,18,28,0.72)" : "rgba(12,18,28,0.78)"),
          borderRadius: subtle ? 16 : 22,
          boxDecorationBreak: "clone",
          padding: subtle ? "12px 18px" : "16px 24px",
        }}
      >
        {item.text}
      </span>
    </div>
  );
};

const FinalCard: FC<{ card: OrganicFinalCard; durationSeconds: number }> = ({ card, durationSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, Math.min(12, durationSeconds * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: card.background || "linear-gradient(145deg, #111827 0%, #16352f 55%, #f59e0b 140%)",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        opacity,
        overflow: "hidden",
        padding: "7%",
        textAlign: "center",
      }}
    >
      {card.imageSrc ? (
        <Img
          src={mediaSrc(card.imageSrc)}
          style={{
            height: "100%",
            left: 0,
            objectFit: "cover",
            opacity: 0.34,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
      ) : null}
      <div style={{ maxWidth: "92%", position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            fontSize: 76,
            fontWeight: 950,
            letterSpacing: 0,
            lineHeight: 0.96,
            textShadow: "0 8px 28px rgba(0,0,0,0.45)",
          }}
        >
          {card.title || "Bnei Nevi'im Academy"}
        </div>
        <div
          style={{
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.16,
            marginTop: 28,
            textShadow: "0 5px 20px rgba(0,0,0,0.45)",
          }}
        >
          {card.subtitle || "Torah learning built around responsibility"}
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 18,
            color: "#111827",
            display: "inline-block",
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            fontSize: 32,
            fontWeight: 900,
            marginTop: 40,
            padding: "16px 24px",
          }}
        >
          {card.cta || "Message us to learn more"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const OrganicClipFactory: FC<OrganicClipFactoryProps> = ({
  durationSeconds = 22,
  background = "#05070c",
  mediaItems = [],
  textOverlays = [],
  captions = [],
  audioTrack = null,
  finalCard = null,
}) => {
  const { fps } = useVideoConfig();
  const safeDuration = clamp(Number(durationSeconds), 1, 180, 22);
  const safeFinalCard = finalCard || {
    startSec: Math.max(0, safeDuration - 2),
    durationSeconds: 2,
    title: "Bnei Nevi'im Academy",
    subtitle: "Torah learning built around responsibility",
    cta: "Message us to learn more",
  };
  const finalStart = clamp(
    Number(safeFinalCard.startSec ?? safeDuration - (safeFinalCard.durationSeconds || 2)),
    0,
    safeDuration,
    Math.max(0, safeDuration - 2),
  );
  const finalDuration = clamp(Number(safeFinalCard.durationSeconds ?? safeDuration - finalStart), 0.1, safeDuration, 2);

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {mediaItems.map((item, index) => {
        const startSec = clamp(Number(item.startSec), 0, safeDuration, 0);
        const endSec = clamp(Number(item.endSec), startSec + 0.1, safeDuration, startSec + 2);
        return (
          <Sequence
            key={`${item.src}-${index}`}
            from={Math.round(startSec * fps)}
            durationInFrames={Math.max(1, Math.round((endSec - startSec) * fps))}
          >
            <OrganicMedia item={{ ...item, startSec, endSec }} />
          </Sequence>
        );
      })}

      {textOverlays.map((item, index) => (
        <Sequence
          key={`text-${item.text}-${index}`}
          from={Math.round(clamp(Number(item.startSec), 0, safeDuration, 0) * fps)}
          durationInFrames={Math.max(1, Math.round(Math.max(0.1, Number(item.endSec) - Number(item.startSec)) * fps))}
        >
          <TextOverlay item={item} />
        </Sequence>
      ))}

      {captions.map((item, index) => (
        <Sequence
          key={`caption-${item.text}-${index}`}
          from={Math.round(clamp(Number(item.startSec), 0, safeDuration, 0) * fps)}
          durationInFrames={Math.max(1, Math.round(Math.max(0.1, Number(item.endSec) - Number(item.startSec)) * fps))}
        >
          <TextOverlay item={{ ...item, position: item.position || "bottom", fontSize: item.fontSize || 38 }} subtle />
        </Sequence>
      ))}

      <Sequence from={Math.round(finalStart * fps)} durationInFrames={Math.max(1, Math.round(finalDuration * fps))}>
        <FinalCard card={safeFinalCard} durationSeconds={finalDuration} />
      </Sequence>

      {audioTrack?.src ? (
        <Sequence
          from={Math.round(clamp(Number(audioTrack.startSec ?? 0), 0, safeDuration, 0) * fps)}
          durationInFrames={
            audioTrack.endSec
              ? Math.max(1, Math.round(Math.max(0.1, Number(audioTrack.endSec) - Number(audioTrack.startSec || 0)) * fps))
              : undefined
          }
        >
          <Audio src={mediaSrc(audioTrack.src)} volume={clamp(Number(audioTrack.volume ?? 0.26), 0, 2, 0.26)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
