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

type FitMode = "cover" | "contain";
type TransitionType = "cut" | "fade";
type TextPosition = "top" | "center" | "bottom";

export type NaturalVideoSegment = {
  sourceStartSec?: number;
  sourceEndSec?: number;
  playbackRate?: number;
  zoom?: number;
  focusXPercent?: number;
  focusYPercent?: number;
  brightness?: number;
  contrast?: number;
  transition?: TransitionType;
};

export type NaturalTextOverlay = {
  startSec: number;
  endSec: number;
  text: string;
  position?: TextPosition;
  fontSize?: number;
  color?: string;
  background?: string;
};

export type NaturalImageOverlay = {
  startSec: number;
  endSec: number;
  src: string;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  opacity?: number;
};

export type NaturalAudioOverlay = {
  startSec: number;
  endSec?: number;
  src: string;
  volume?: number;
};

export type NaturalVideoEditProps = {
  sourceVideo: string;
  sourceDurationSeconds?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  fit?: FitMode;
  background?: string;
  sourceVolume?: number;
  globalZoom?: number;
  globalBrightness?: number;
  globalContrast?: number;
  segments?: NaturalVideoSegment[];
  textOverlays?: NaturalTextOverlay[];
  imageOverlays?: NaturalImageOverlay[];
  audioOverlays?: NaturalAudioOverlay[];
  subtitles?: NaturalTextOverlay[];
};

type TimelineSegment = Required<
  Pick<
    NaturalVideoSegment,
    | "sourceStartSec"
    | "sourceEndSec"
    | "playbackRate"
    | "zoom"
    | "focusXPercent"
    | "focusYPercent"
    | "brightness"
    | "contrast"
    | "transition"
  >
> & {
  outputStartSec: number;
  outputDurationSec: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

const mediaSrc = (src: string) =>
  /^https?:\/\//i.test(src) ? src : staticFile(src.replace(/^\/+/, ""));

const overlayPositionStyle = (position: TextPosition = "bottom") => {
  if (position === "top") return { top: "8%" };
  if (position === "center") return { top: "50%", transform: "translateY(-50%)" };
  return { bottom: "8%" };
};

const buildTimeline = (
  segments: NaturalVideoSegment[] | undefined,
  sourceDurationSeconds: number,
  fallbackDurationSeconds: number,
): TimelineSegment[] => {
  const safeSourceDuration = clamp(sourceDurationSeconds || fallbackDurationSeconds || 15, 0.5, 3600);
  const rawSegments = Array.isArray(segments) && segments.length
    ? segments
    : [{ sourceStartSec: 0, sourceEndSec: safeSourceDuration }];

  let outputStartSec = 0;
  const timeline: TimelineSegment[] = [];

  for (const segment of rawSegments) {
    const sourceStartSec = clamp(Number(segment.sourceStartSec ?? 0), 0, safeSourceDuration);
    const sourceEndSec = clamp(Number(segment.sourceEndSec ?? safeSourceDuration), sourceStartSec + 0.1, safeSourceDuration);
    const playbackRate = clamp(Number(segment.playbackRate ?? 1), 0.25, 4);
    const outputDurationSec = Math.max(0.1, (sourceEndSec - sourceStartSec) / playbackRate);

    timeline.push({
      sourceStartSec,
      sourceEndSec,
      playbackRate,
      zoom: clamp(Number(segment.zoom ?? 1), 0.5, 3),
      focusXPercent: clamp(Number(segment.focusXPercent ?? 50), 0, 100),
      focusYPercent: clamp(Number(segment.focusYPercent ?? 50), 0, 100),
      brightness: clamp(Number(segment.brightness ?? 1), 0.2, 2),
      contrast: clamp(Number(segment.contrast ?? 1), 0.2, 2),
      transition: segment.transition === "fade" ? "fade" : "cut",
      outputStartSec,
      outputDurationSec,
    });

    outputStartSec += outputDurationSec;
  }

  return timeline;
};

const TimelineVideoSegment: FC<{
  sourceVideo: string;
  segment: TimelineSegment;
  sourceVolume: number;
  fit: FitMode;
  globalZoom: number;
  globalBrightness: number;
  globalContrast: number;
}> = ({ sourceVideo, segment, sourceVolume, fit, globalZoom, globalBrightness, globalContrast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = Math.max(1, Math.round(segment.outputDurationSec * fps));
  const fadeFrames = segment.transition === "fade" ? Math.min(14, Math.floor(durationFrames / 3)) : 0;
  const fadeIn = fadeFrames
    ? interpolate(frame, [0, fadeFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const fadeOut = fadeFrames
    ? interpolate(frame, [durationFrames - fadeFrames, durationFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const opacity = Math.min(fadeIn, fadeOut);
  const zoom = segment.zoom * globalZoom;
  const objectPosition = `${segment.focusXPercent}% ${segment.focusYPercent}%`;

  return (
    <AbsoluteFill
      style={{
        filter: `brightness(${segment.brightness * globalBrightness}) contrast(${segment.contrast * globalContrast})`,
        opacity,
        overflow: "hidden",
      }}
    >
      <Video
        src={mediaSrc(sourceVideo)}
        startFrom={Math.round(segment.sourceStartSec * fps)}
        endAt={Math.round(segment.sourceEndSec * fps)}
        playbackRate={segment.playbackRate}
        volume={sourceVolume}
        style={{
          height: "100%",
          objectFit: fit,
          objectPosition,
          transform: `scale(${zoom})`,
          transformOrigin: objectPosition,
          width: "100%",
        }}
      />
    </AbsoluteFill>
  );
};

const TextCard: FC<{ item: NaturalTextOverlay; subtle?: boolean }> = ({ item, subtle = false }) => {
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
        fontSize: item.fontSize || (subtle ? 46 : 58),
        fontWeight: 900,
        left: "8%",
        lineHeight: 1.08,
        opacity,
        position: "absolute",
        right: "8%",
        textAlign: "center",
        textShadow: "0 4px 24px rgba(0,0,0,0.55)",
        zIndex: 10,
      }}
    >
      <span
        style={{
          background: item.background || (subtle ? "rgba(15,23,42,0.68)" : "rgba(15,23,42,0.76)"),
          borderRadius: 26,
          boxDecorationBreak: "clone",
          padding: subtle ? "14px 22px" : "18px 28px",
        }}
      >
        {item.text}
      </span>
    </div>
  );
};

export const NaturalVideoEdit: FC<NaturalVideoEditProps> = ({
  sourceVideo,
  sourceDurationSeconds = 15,
  durationSeconds = sourceDurationSeconds || 15,
  fit = "cover",
  background = "#000000",
  sourceVolume = 1,
  globalZoom = 1,
  globalBrightness = 1,
  globalContrast = 1,
  segments,
  textOverlays = [],
  imageOverlays = [],
  audioOverlays = [],
  subtitles = [],
}) => {
  const { fps } = useVideoConfig();
  const timeline = buildTimeline(segments, sourceDurationSeconds, durationSeconds);

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {timeline.map((segment, index) => (
        <Sequence
          key={`${segment.sourceStartSec}-${segment.sourceEndSec}-${index}`}
          from={Math.round(segment.outputStartSec * fps)}
          durationInFrames={Math.max(1, Math.round(segment.outputDurationSec * fps))}
        >
          <TimelineVideoSegment
            sourceVideo={sourceVideo}
            segment={segment}
            sourceVolume={clamp(sourceVolume, 0, 2)}
            fit={fit}
            globalZoom={clamp(globalZoom, 0.5, 3)}
            globalBrightness={clamp(globalBrightness, 0.2, 2)}
            globalContrast={clamp(globalContrast, 0.2, 2)}
          />
        </Sequence>
      ))}

      {imageOverlays.map((item, index) => (
        <Sequence
          key={`${item.src}-${index}`}
          from={Math.round(clamp(Number(item.startSec), 0, durationSeconds) * fps)}
          durationInFrames={Math.max(1, Math.round(Math.max(0.1, Number(item.endSec) - Number(item.startSec)) * fps))}
        >
          <Img
            src={mediaSrc(item.src)}
            style={{
              left: `${clamp(Number(item.xPercent ?? 50), 0, 100)}%`,
              opacity: clamp(Number(item.opacity ?? 1), 0, 1),
              position: "absolute",
              top: `${clamp(Number(item.yPercent ?? 50), 0, 100)}%`,
              transform: "translate(-50%, -50%)",
              width: `${clamp(Number(item.widthPercent ?? 28), 4, 100)}%`,
              zIndex: 8,
            }}
          />
        </Sequence>
      ))}

      {textOverlays.map((item, index) => (
        <Sequence
          key={`${item.text}-${index}`}
          from={Math.round(clamp(Number(item.startSec), 0, durationSeconds) * fps)}
          durationInFrames={Math.max(1, Math.round(Math.max(0.1, Number(item.endSec) - Number(item.startSec)) * fps))}
        >
          <TextCard item={item} />
        </Sequence>
      ))}

      {subtitles.map((item, index) => (
        <Sequence
          key={`subtitle-${item.text}-${index}`}
          from={Math.round(clamp(Number(item.startSec), 0, durationSeconds) * fps)}
          durationInFrames={Math.max(1, Math.round(Math.max(0.1, Number(item.endSec) - Number(item.startSec)) * fps))}
        >
          <TextCard item={{ ...item, position: item.position || "bottom", fontSize: item.fontSize || 42 }} subtle />
        </Sequence>
      ))}

      {audioOverlays.map((item, index) => (
        <Sequence
          key={`${item.src}-${index}`}
          from={Math.round(clamp(Number(item.startSec), 0, durationSeconds) * fps)}
          durationInFrames={
            item.endSec
              ? Math.max(1, Math.round(Math.max(0.1, Number(item.endSec) - Number(item.startSec)) * fps))
              : undefined
          }
        >
          <Audio src={mediaSrc(item.src)} volume={clamp(Number(item.volume ?? 0.35), 0, 2)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
