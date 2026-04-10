import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

const BG = "#FFFFFF";
const FG = "#0A0A0A";
const MUTED = "#888888";
const RULE = "#E0E0E0";

// ── Shared fade wrapper ──────────────────────────────────────
const FadeScene: React.FC<{
  children: React.ReactNode;
  totalFrames: number;
}> = ({ children, totalFrames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 18, totalFrames - 18, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

// ── Scene 1 · Logo Reveal ────────────────────────────────────
const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const lineProgress = interpolate(frame, [18, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const brand = "JEFF DESIGNS".split("");
  const sub = "Motion & Video Studio";

  return (
    <FadeScene totalFrames={150}>
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {/* Rule top */}
        <div
          style={{
            width: `${lineProgress * 520}px`,
            height: 1,
            backgroundColor: FG,
            marginBottom: 36,
          }}
        />

        {/* Brand name — letter stagger */}
        <div style={{ display: "flex", letterSpacing: "0.35em" }}>
          {brand.map((char, i) => {
            const start = 22 + i * 3;
            const op = interpolate(frame, [start, start + 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [start, start + 16], [18, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span
                key={i}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  display: "inline-block",
                  fontSize: 80,
                  fontWeight: 200,
                  fontFamily:
                    "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: FG,
                }}
              >
                {char === " " ? "\u00A0\u00A0" : char}
              </span>
            );
          })}
        </div>

        {/* Rule bottom */}
        <div
          style={{
            width: `${lineProgress * 520}px`,
            height: 1,
            backgroundColor: FG,
            marginTop: 36,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            opacity: interpolate(frame, [75, 100], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginTop: 28,
            fontSize: 13,
            letterSpacing: "0.55em",
            color: MUTED,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            textTransform: "uppercase",
          }}
        >
          {sub}
        </div>
      </AbsoluteFill>
    </FadeScene>
  );
};

// ── Scene 2 · Tagline ────────────────────────────────────────
const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["Motion.", "Video.", "Vision."];

  return (
    <FadeScene totalFrames={120}>
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 56, alignItems: "baseline" }}>
          {words.map((word, i) => {
            const start = 12 + i * 18;
            const op = interpolate(frame, [start, start + 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(frame, [start, start + 22], [28, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const isAccent = i === words.length - 1;
            return (
              <span
                key={i}
                style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  display: "inline-block",
                  fontSize: 68,
                  fontFamily:
                    "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontWeight: isAccent ? 600 : 200,
                  color: isAccent ? FG : MUTED,
                  letterSpacing: "-0.01em",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Underline bar */}
        <div
          style={{
            width: `${interpolate(frame, [60, 95], [0, 480], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px`,
            height: 2,
            backgroundColor: FG,
          }}
        />
      </AbsoluteFill>
    </FadeScene>
  );
};

// ── Scene 3 · Services ───────────────────────────────────────
const SERVICES = [
  {
    num: "01",
    title: "Motion Design",
    desc: "Kinetic typography, logo animation, and brand motion systems.",
  },
  {
    num: "02",
    title: "Video Production",
    desc: "Full-service production from concept through final delivery.",
  },
  {
    num: "03",
    title: "Visual Effects",
    desc: "Compositing, color grading, and post-production excellence.",
  },
];

const ServicesScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FadeScene totalFrames={150}>
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 160px",
        }}
      >
        <div style={{ width: "100%" }}>
          {/* Label */}
          <div
            style={{
              opacity: interpolate(frame, [15, 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 11,
              letterSpacing: "0.5em",
              color: MUTED,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 400,
              marginBottom: 56,
              textTransform: "uppercase",
            }}
          >
            What We Do
          </div>

          {/* Rows */}
          {SERVICES.map((s, i) => {
            const start = 28 + i * 22;
            const op = interpolate(frame, [start, start + 24], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(frame, [start, start + 24], [36, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 48,
                  paddingBottom: 40,
                  marginBottom: 40,
                  borderBottom: `1px solid ${RULE}`,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: MUTED,
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    minWidth: 28,
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.num}
                </span>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 300,
                    color: FG,
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    minWidth: 300,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    color: MUTED,
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontWeight: 300,
                    lineHeight: 1.65,
                    maxWidth: 440,
                  }}
                >
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </FadeScene>
  );
};

// ── Scene 4 · CTA / Outro ────────────────────────────────────
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headOp = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headY = interpolate(frame, [15, 45], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineW = interpolate(frame, [40, 80], [0, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOp = interpolate(frame, [75, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotScale = spring({ frame, fps, config: { stiffness: 180, damping: 18 }, delay: 70 });

  return (
    <FadeScene totalFrames={150}>
      <AbsoluteFill
        style={{
          backgroundColor: FG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {/* Pre-label */}
        <div
          style={{
            opacity: interpolate(frame, [10, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontSize: 12,
            letterSpacing: "0.5em",
            color: "#666",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Let's Create Together
        </div>

        {/* Headline */}
        <div
          style={{
            opacity: headOp,
            transform: `translateY(${headY}px)`,
            fontSize: 84,
            fontWeight: 200,
            color: "#FFFFFF",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Bringing Stories
          <br />
          to Life.
        </div>

        {/* Divider */}
        <div
          style={{
            width: `${lineW}px`,
            height: 1,
            backgroundColor: "#333",
            marginBottom: 40,
          }}
        />

        {/* URL */}
        <div
          style={{
            opacity: ctaOp,
            fontSize: 15,
            letterSpacing: "0.3em",
            color: "#666",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
          }}
        >
          JEFFDESIGNS.COM
        </div>

        {/* Pulse dot */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            opacity: 0.25,
            transform: `scale(${dotScale})`,
          }}
        />
      </AbsoluteFill>
    </FadeScene>
  );
};

// ── Root Composition ─────────────────────────────────────────
export const JeffDesigns: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Scene 1: Logo  0–150 */}
      <Sequence from={0} durationInFrames={150}>
        <LogoScene />
      </Sequence>

      {/* Scene 2: Tagline  150–270 */}
      <Sequence from={150} durationInFrames={120}>
        <TaglineScene />
      </Sequence>

      {/* Scene 3: Services  270–420 */}
      <Sequence from={270} durationInFrames={150}>
        <ServicesScene />
      </Sequence>

      {/* Scene 4: CTA  420–570 */}
      <Sequence from={420} durationInFrames={150}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
