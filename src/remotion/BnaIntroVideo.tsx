import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { FC } from "react";

export type BnaIntroVideoProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  callToAction: string;
  durationSeconds?: number;
  footerText?: string;
  showLogo?: boolean;
  tone?: "calm" | "forest" | "bold" | "warm" | "night";
};

const palettes = {
  calm: {
    blue: "#1e3a5f",
    deepBlue: "#10233f",
    gold: "#c9a227",
    background: "linear-gradient(145deg, #fff8ea 0%, #e8f0f8 56%, #ffffff 100%)",
    text: "#334155",
  },
  forest: {
    blue: "#254a3b",
    deepBlue: "#123226",
    gold: "#d7a83a",
    background: "linear-gradient(145deg, #f7f0df 0%, #dce9dd 56%, #eef6f0 100%)",
    text: "#2d3d35",
  },
  bold: {
    blue: "#1e3a5f",
    deepBlue: "#07182d",
    gold: "#f1b82d",
    background: "linear-gradient(145deg, #f6d365 0%, #f8fbff 44%, #d8e7f6 100%)",
    text: "#172033",
  },
  warm: {
    blue: "#5a381c",
    deepBlue: "#28190e",
    gold: "#c5891f",
    background: "linear-gradient(145deg, #fff2d8 0%, #f5dfbd 50%, #fffaf0 100%)",
    text: "#4d3a26",
  },
  night: {
    blue: "#f6d365",
    deepBlue: "#ffffff",
    gold: "#f6d365",
    background: "linear-gradient(145deg, #08192f 0%, #10233f 52%, #1e3a5f 100%)",
    text: "#d9e7f7",
  },
};

export const BnaIntroVideo: FC<BnaIntroVideoProps> = ({
  eyebrow,
  headline,
  subheadline,
  callToAction,
  footerText = "Ramat Beit Shemesh",
  showLogo = true,
  tone = "calm",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const isPortrait = height > width;
  const brand = palettes[tone] ?? palettes.calm;

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 160,
      mass: 0.7,
      stiffness: 110,
    },
  });

  const logoScale = interpolate(entrance, [0, 1], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headlineY = interpolate(frame, [18, 48], [72, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeIn = interpolate(frame, [12, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: brand.background,
        color: brand.blue,
        fontFamily:
          'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 620 : 760,
          height: isPortrait ? 620 : 760,
          borderRadius: "999px",
          background: "rgba(201, 162, 39, 0.18)",
          right: isPortrait ? -250 : -170,
          top: isPortrait ? -190 : -220,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 720 : 920,
          height: isPortrait ? 720 : 920,
          borderRadius: "999px",
          background: "rgba(30, 58, 95, 0.1)",
          left: isPortrait ? -360 : -240,
          bottom: isPortrait ? -300 : -420,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          alignItems: isPortrait ? "flex-start" : "center",
          justifyContent: "center",
          gap: isPortrait ? 72 : 96,
          height: "100%",
          padding: isPortrait ? "150px 88px" : "96px 130px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {showLogo ? (
          <div
            style={{
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.82)",
              border: "1px solid rgba(30, 58, 95, 0.12)",
              borderRadius: isPortrait ? 52 : 64,
              boxShadow: "0 38px 90px rgba(16, 35, 63, 0.15)",
              display: "flex",
              height: isPortrait ? 330 : 380,
              justifyContent: "center",
              minWidth: isPortrait ? 330 : 380,
              padding: 42,
              transform: `scale(${logoScale})`,
            }}
          >
            <Img
              src={staticFile("images/bna-logo-nobg.png")}
              style={{
                height: "100%",
                objectFit: "contain",
                width: "100%",
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            maxWidth: isPortrait ? 900 : 1000,
            opacity: fadeIn,
            transform: `translateY(${headlineY}px)`,
          }}
        >
          <div
            style={{
              color: brand.gold,
              fontSize: isPortrait ? 36 : 34,
              fontWeight: 900,
              letterSpacing: "0.16em",
              marginBottom: 30,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              color: brand.deepBlue,
              fontFamily:
                'Georgia, "Times New Roman", "Noto Serif Hebrew", serif',
              fontSize: isPortrait ? 108 : 92,
              letterSpacing: "-0.045em",
              lineHeight: 0.92,
              margin: 0,
              maxWidth: isPortrait ? 860 : 980,
            }}
          >
            {headline}
          </h1>
          <p
            style={{
              color: brand.text,
              fontSize: isPortrait ? 42 : 34,
              lineHeight: 1.35,
              margin: "38px 0 52px",
              maxWidth: isPortrait ? 780 : 820,
            }}
          >
            {subheadline}
          </p>
          <div
            style={{
              alignItems: "center",
              background: brand.blue,
              borderRadius: 999,
              boxShadow: "0 20px 45px rgba(30, 58, 95, 0.22)",
              color: "#ffffff",
              display: "inline-flex",
              fontSize: isPortrait ? 34 : 28,
              fontWeight: 900,
              gap: 18,
              letterSpacing: "0.02em",
              padding: isPortrait ? "26px 38px" : "22px 34px",
            }}
          >
            <span>{callToAction}</span>
            <span style={{ color: brand.gold }}>&gt;</span>
          </div>
        </div>
      </div>

      <div
        style={{
          bottom: isPortrait ? 70 : 48,
          height: 10,
          left: isPortrait ? 88 : 130,
          position: "absolute",
          right: isPortrait ? 88 : 130,
          zIndex: 3,
        }}
      >
        <div
          style={{
            background: "rgba(30, 58, 95, 0.12)",
            borderRadius: 999,
            height: "100%",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${brand.gold}, #f6d365)`,
              borderRadius: 999,
              height: "100%",
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
      <div
        style={{
          bottom: isPortrait ? 100 : 78,
          color: brand.text,
          fontSize: isPortrait ? 25 : 22,
          fontWeight: 800,
          left: isPortrait ? 88 : 130,
          letterSpacing: "0.08em",
          opacity: 0.78,
          position: "absolute",
          right: isPortrait ? 88 : 130,
          textTransform: "uppercase",
          zIndex: 3,
        }}
      >
        {footerText}
      </div>
    </AbsoluteFill>
  );
};
