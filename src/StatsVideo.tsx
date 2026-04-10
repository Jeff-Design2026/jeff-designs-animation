import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ── Config ────────────────────────────────────────────────────
const BG = "#0f0f0f";

const STATS = [
  {
    value: 47,
    suffix: "%",
    prefix: "",
    decimals: 0,
    label: "Increase in Conversion Rate",
    sub: "Compared to industry average",
    color: "#00D4FF",
    glow: "#00D4FF33",
  },
  {
    value: 2.3,
    suffix: "x",
    prefix: "",
    decimals: 1,
    label: "Return on Ad Spend",
    sub: "Across all paid channels",
    color: "#00FF88",
    glow: "#00FF8833",
  },
  {
    value: 150,
    suffix: "+",
    prefix: "",
    decimals: 0,
    label: "Clients Served",
    sub: "Across 12 industries worldwide",
    color: "#A855F7",
    glow: "#A855F733",
  },
  {
    value: 1.2,
    suffix: "M",
    prefix: "$",
    decimals: 1,
    label: "In Revenue Generated",
    sub: "For our clients in 2024",
    color: "#FF6B35",
    glow: "#FF6B3533",
  },
];

// 20s = 600 frames. Each stat: 150 frames (5s)
const SCENE_DURATION = 150;
const OVERLAP = 20; // cross-fade overlap

// ── Easing ────────────────────────────────────────────────────
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

// ── Count-up hook ─────────────────────────────────────────────
const useCountUp = (
  frame: number,
  target: number,
  decimals: number,
  startFrame: number,
  endFrame: number
) => {
  const raw = interpolate(frame, [startFrame, endFrame], [0, target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutQuart,
  });
  return decimals > 0 ? raw.toFixed(decimals) : Math.floor(raw).toString();
};

// ── Shared: progress bar ──────────────────────────────────────
const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 3,
      width: `${progress * 100}%`,
      background: `linear-gradient(90deg, ${color}88, ${color})`,
      borderRadius: "0 2px 2px 0",
      transition: "width 0.1s",
    }}
  />
);

// ── Shared: corner accents ────────────────────────────────────
const CornerAccents: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <>
    {/* Top-left */}
    <div style={{ position: "absolute", top: 48, left: 80, opacity }}>
      <div style={{ width: 40, height: 2, backgroundColor: color }} />
      <div style={{ width: 2, height: 40, backgroundColor: color, marginTop: 0 }} />
    </div>
    {/* Bottom-right */}
    <div style={{ position: "absolute", bottom: 48, right: 80, opacity }}>
      <div style={{ width: 40, height: 2, backgroundColor: color, marginLeft: "auto" }} />
      <div style={{ width: 2, height: 40, backgroundColor: color, marginLeft: "auto", marginTop: 0 }} />
    </div>
  </>
);

// ── Stat Scene ────────────────────────────────────────────────
const StatScene: React.FC<{
  stat: (typeof STATS)[0];
  index: number;
  totalScenes: number;
}> = ({ stat, index, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene-level opacity for cross-fade
  const fadeIn = interpolate(frame, [0, OVERLAP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [SCENE_DURATION - OVERLAP, SCENE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const sceneOp = index === 0 ? fadeOut : index === totalScenes - 1 ? fadeIn : fadeIn * fadeOut;

  // Count-up: runs from frame 30 to frame 110
  const countStr = useCountUp(frame, stat.value, stat.decimals, 28, 108);

  // Number entrance spring
  const numSpring = spring({ frame, fps, config: { stiffness: 100, damping: 16 }, delay: 20 });
  const numY = interpolate(numSpring, [0, 1], [60, 0]);
  const numOp = interpolate(frame, [18, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label slide up
  const labelOp = interpolate(frame, [38, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = interpolate(frame, [38, 62], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sub-text
  const subOp = interpolate(frame, [56, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent line sweep
  const lineW = interpolate(frame, [10, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  // Corner accents
  const cornerOp = interpolate(frame, [14, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Radial pulse (subtle)
  const pulseScale = 1 + 0.015 * Math.sin(frame * 0.06);

  // Progress through this scene
  const sceneProgress = Math.min(frame / SCENE_DURATION, 1);

  // Index badge
  const badgeOp = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: sceneOp,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${stat.glow} 0%, transparent 70%)`,
          transform: `scale(${pulseScale})`,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${stat.color}08 1px, transparent 1px),
            linear-gradient(90deg, ${stat.color}08 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.6,
        }}
      />

      {/* Corner brackets */}
      <CornerAccents color={stat.color} opacity={cornerOp} />

      {/* Progress bar */}
      <ProgressBar progress={sceneProgress} color={stat.color} />

      {/* Index badge — top right */}
      <div
        style={{
          position: "absolute",
          top: 52,
          right: 88,
          opacity: badgeOp,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {STATS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 24 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === index ? stat.color : "#333",
              transition: "width 0.3s",
            }}
          />
        ))}
      </div>

      {/* Accent top line */}
      <div
        style={{
          width: `${lineW * 560}px`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
          marginBottom: 52,
          boxShadow: `0 0 20px ${stat.color}88`,
        }}
      />

      {/* Main number */}
      <div
        style={{
          opacity: numOp,
          transform: `translateY(${numY}px)`,
          display: "flex",
          alignItems: "flex-start",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {/* Prefix */}
        {stat.prefix && (
          <span
            style={{
              fontSize: 64,
              fontWeight: 300,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              color: stat.color,
              marginTop: 22,
              marginRight: 4,
              opacity: 0.85,
            }}
          >
            {stat.prefix}
          </span>
        )}
        {/* Number */}
        <span
          style={{
            fontSize: 200,
            fontWeight: 800,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: "#FFFFFF",
            letterSpacing: "-0.04em",
            textShadow: `0 0 80px ${stat.color}66`,
          }}
        >
          {countStr}
        </span>
        {/* Suffix */}
        <span
          style={{
            fontSize: 80,
            fontWeight: 700,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: stat.color,
            marginTop: 28,
            marginLeft: 6,
            textShadow: `0 0 40px ${stat.color}`,
          }}
        >
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          opacity: labelOp,
          transform: `translateY(${labelY}px)`,
          fontSize: 36,
          fontWeight: 300,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#FFFFFF",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {stat.label}
      </div>

      {/* Sub text */}
      <div
        style={{
          opacity: subOp,
          fontSize: 18,
          fontWeight: 300,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#666",
          letterSpacing: "0.06em",
          marginBottom: 52,
        }}
      >
        {stat.sub}
      </div>

      {/* Accent bottom line */}
      <div
        style={{
          width: `${lineW * 560}px`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
          boxShadow: `0 0 20px ${stat.color}88`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Intro Scene (0–30) ────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20, 22, 30], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: op,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 20,
          letterSpacing: "0.6em",
          color: "#444",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 300,
          textTransform: "uppercase",
        }}
      >
        By the Numbers
      </div>
    </AbsoluteFill>
  );
};

// ── Outro Scene (570–600) ─────────────────────────────────────
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const op = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // All 4 accent colors fan out
  const colors = STATS.map((s) => s.color);

  const lineW = interpolate(frame, [8, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  const textOp = interpolate(frame, [28, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subSpring = spring({ frame, fps, config: { stiffness: 120, damping: 18 }, delay: 40 });
  const subY = interpolate(subSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: op,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Multi-color glow dots */}
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: 0.06,
            filter: "blur(60px)",
            left: `${18 + i * 20}%`,
            top: "40%",
            transform: "translateY(-50%)",
          }}
        />
      ))}

      {/* 4-color gradient line */}
      <div
        style={{
          width: `${lineW * 700}px`,
          height: 3,
          background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]})`,
          marginBottom: 44,
          borderRadius: 2,
          boxShadow: `0 0 30px #ffffff22`,
        }}
      />

      <div
        style={{
          opacity: textOp,
          fontSize: 56,
          fontWeight: 700,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#FFFFFF",
          letterSpacing: "-0.01em",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Results That Speak
      </div>

      <div
        style={{
          opacity: textOp,
          transform: `translateY(${subY}px)`,
          fontSize: 22,
          fontWeight: 300,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#555",
          letterSpacing: "0.1em",
          textAlign: "center",
          marginBottom: 44,
        }}
      >
        for themselves.
      </div>

      {/* 4-color gradient line bottom */}
      <div
        style={{
          width: `${lineW * 700}px`,
          height: 3,
          background: `linear-gradient(90deg, ${colors[3]}, ${colors[2]}, ${colors[1]}, ${colors[0]})`,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Root ──────────────────────────────────────────────────────
// 20s = 600 frames @ 30fps
// Layout:
//   0–30   Intro flash
//   10–160  Stat 1 (blue)
//   150–300 Stat 2 (green)
//   290–440 Stat 3 (purple)
//   430–580 Stat 4 (orange)
//   570–600 Outro
export const StatsVideo: React.FC = () => {
  const offsets = [10, 150, 290, 430];

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={0} durationInFrames={32}>
        <IntroScene />
      </Sequence>

      {STATS.map((stat, i) => (
        <Sequence key={i} from={offsets[i]} durationInFrames={SCENE_DURATION}>
          <StatScene stat={stat} index={i} totalScenes={STATS.length} />
        </Sequence>
      ))}

      <Sequence from={570} durationInFrames={30}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
