import { Composition } from "remotion";
import type { FC } from "react";
import { BnaIntroVideo, type BnaIntroVideoProps } from "./BnaIntroVideo";
import { NaturalVideoEdit, type NaturalVideoEditProps } from "./NaturalVideoEdit";
import { OrganicClipFactory, type OrganicClipFactoryProps } from "./OrganicClipFactory";

const defaultProps: BnaIntroVideoProps = {
  eyebrow: "Bnei Nevi'im Academy",
  headline: "Torah learning built around responsibility",
  subheadline:
    "A calm, relationship-based morning program for boys in Ramat Beit Shemesh.",
  callToAction: "Book a visit",
  durationSeconds: 7,
  footerText: "Ramat Beit Shemesh",
  showLogo: true,
  tone: "calm",
};

function durationFromProps(props: BnaIntroVideoProps): number {
  const seconds = Number(props.durationSeconds || 7);
  const clampedSeconds = Math.max(3, Math.min(30, seconds));
  return Math.round(clampedSeconds * 30);
}

const naturalVideoDefaultProps: NaturalVideoEditProps = {
  sourceVideo: "https://remotion.media/video.mp4",
  sourceDurationSeconds: 15,
  durationSeconds: 15,
  width: 1080,
  height: 1920,
  fit: "cover",
  background: "#000000",
  sourceVolume: 1,
  segments: [{ sourceStartSec: 0, sourceEndSec: 15, playbackRate: 1 }],
  textOverlays: [],
  imageOverlays: [],
  audioOverlays: [],
  subtitles: [],
};

const organicClipDefaultProps: OrganicClipFactoryProps = {
  durationSeconds: 22,
  width: 1080,
  height: 1920,
  background: "#05070c",
  mediaItems: [
    {
      type: "image",
      src: "images/learning-moments/forest-learning-01-web.jpg",
      startSec: 0,
      endSec: 20,
      transition: "fade",
    },
  ],
  textOverlays: [
    {
      startSec: 0.25,
      endSec: 3.5,
      text: "Torah learning with real ownership",
      position: "top",
    },
  ],
  captions: [],
  audioTrack: null,
  finalCard: {
    startSec: 20,
    durationSeconds: 2,
    title: "Bnei Nevi'im Academy",
    subtitle: "A Torah learning environment for boys who learn differently",
    cta: "Message us to learn more",
  },
};

function naturalDurationFromProps(props: NaturalVideoEditProps): number {
  const seconds = Number(props.durationSeconds || props.sourceDurationSeconds || 15);
  const clampedSeconds = Math.max(1, Math.min(3600, seconds));
  return Math.round(clampedSeconds * 30);
}

function organicDurationFromProps(props: OrganicClipFactoryProps): number {
  const seconds = Number(props.durationSeconds || 22);
  const clampedSeconds = Math.max(1, Math.min(180, seconds));
  return Math.round(clampedSeconds * 30);
}

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="BnaIntroPortrait"
        component={BnaIntroVideo}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: durationFromProps(props),
        })}
      />
      <Composition
        id="BnaIntroWide"
        component={BnaIntroVideo}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          ...defaultProps,
          headline: "A Torah learning environment for boys who learn differently",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: durationFromProps(props),
        })}
      />
      <Composition
        id="NaturalVideoEdit"
        component={NaturalVideoEdit}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={naturalVideoDefaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: naturalDurationFromProps(props),
          width: Math.round(Math.max(320, Math.min(3840, Number(props.width || 1080)))),
          height: Math.round(Math.max(320, Math.min(3840, Number(props.height || 1920)))),
        })}
      />
      <Composition
        id="OrganicClipFactory"
        component={OrganicClipFactory}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={organicClipDefaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: organicDurationFromProps(props),
          width: Math.round(Math.max(320, Math.min(3840, Number(props.width || 1080)))),
          height: Math.round(Math.max(320, Math.min(3840, Number(props.height || 1920)))),
        })}
      />
    </>
  );
};
