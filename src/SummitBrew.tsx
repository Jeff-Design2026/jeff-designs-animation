import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ── Palette ──────────────────────────────────────────────────
const BG = "#090704";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C96A";
const GOLD_DIM = "#7A6128";
const WHITE = "#F5F0E8";
const MUTED = "#5A5040";

// ── Helpers ───────────────────────────────────────────────────
const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const Gold: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD_LIGHT}, ${GOLD})`,
      ...style,
    }}
  />
);

// ── Scene 1 · Atmosphere / Brand Teaser (0–90) ───────────────
const AtmosphereScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Steam wisps — 5 columns of rising particles
  const steamCols = [
    { x: "48%", delay: 0 },
    { x: "45%", delay: 8 },
    { x: "51%", delay: 4 },
    { x: "43%", delay: 12 },
    { x: "53%", delay: 6 },
  ];

  // Cup ring reveal
  const ringScale = spring({ frame, fps, config: { stiffness: 60, damping: 22 }, delay: 20 });
  const ringOp = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "S" teaser letter
  const letterOp = interpolate(frame, [55, 80], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: bgOp,
        overflow: "hidden",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 45% at 50% 58%, #3A2800 0%, transparent 70%)`,
        }}
      />

      {/* Cup silhouette ring */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          opacity: ringOp,
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: `2px solid ${GOLD}`,
          boxShadow: `0 0 60px 10px ${GOLD}44`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          transform: `translate(-50%, -50%) scale(${ringScale * 0.7})`,
          opacity: ringOp * 0.5,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `1px solid ${GOLD_DIM}`,
        }}
      />

      {/* Steam wisps */}
      {steamCols.map((col, i) => {
        const t = Math.max(0, frame - col.delay);
        const y = interpolate(t, [0, 90], [0, -140], { extrapolateRight: "clamp" });
        const op = interpolate(t, [0, 15, 60, 90], [0, 0.5, 0.3, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const wave = Math.sin(t * 0.12 + i * 1.1) * 14;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: col.x,
              top: "50%",
              width: 3,
              height: 60,
              borderRadius: 4,
              background: `linear-gradient(to top, ${GOLD}88, transparent)`,
              opacity: op,
              transform: `translateX(${wave}px) translateY(${y}px)`,
              filter: "blur(3px)",
            }}
          />
        );
      })}

      {/* Ghost 'S' */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: letterOp,
          fontSize: 520,
          fontWeight: 700,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: GOLD,
          letterSpacing: "-0.05em",
          userSelect: "none",
        }}
      >
        S
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2 · Kinetic Title (90–270) ────────────────────────
const KineticTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "SUMMIT" — letters drop from above, staggered
  const summitLetters = "SUMMIT".split("");
  // "BREW" — letters rise from below, slightly later
  const brewLetters = "BREW".split("");

  // Gold rule lines sweep in
  const lineW = interpolate(frame, [8, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline flash
  const subOp = interpolate(frame, [90, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene fade-out at end
  const sceneOp = interpolate(frame, [155, 178], [1, 0], {
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
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, #2A1A00 0%, transparent 75%)`,
        }}
      />

      {/* Gold rule top */}
      <div
        style={{
          width: `${lineW * 640}px`,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          marginBottom: 28,
        }}
      />

      {/* SUMMIT */}
      <div
        style={{
          display: "flex",
          letterSpacing: "0.22em",
          marginBottom: 4,
        }}
      >
        {summitLetters.map((char, i) => {
          const start = i * 5;
          const spr = spring({
            frame,
            fps,
            config: { stiffness: 180, damping: 22 },
            delay: start,
          });
          const op = interpolate(frame, [start, start + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(spr, [0, 1], [-80, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: 130,
                fontWeight: 700,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: WHITE,
                opacity: op,
                transform: `translateY(${y}px)`,
                textShadow: `0 0 40px ${GOLD}55`,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Gold divider line */}
      <Gold
        style={{
          width: `${lineW * 480}px`,
          height: 2,
          marginBottom: 4,
          opacity: 0.9,
        }}
      />

      {/* BREW */}
      <div style={{ display: "flex", letterSpacing: "0.55em", marginTop: 6 }}>
        {brewLetters.map((char, i) => {
          const start = 18 + i * 6;
          const spr = spring({
            frame,
            fps,
            config: { stiffness: 160, damping: 20 },
            delay: start,
          });
          const op = interpolate(frame, [start, start + 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(spr, [0, 1], [70, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: 56,
                fontWeight: 200,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: GOLD,
                opacity: op,
                transform: `translateY(${y}px)`,
                letterSpacing: "0.45em",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Gold rule bottom */}
      <div
        style={{
          width: `${lineW * 640}px`,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          marginTop: 28,
        }}
      />

      {/* Established sub-text */}
      <div
        style={{
          marginTop: 20,
          opacity: subOp,
          fontSize: 12,
          letterSpacing: "0.6em",
          color: GOLD_DIM,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 300,
          textTransform: "uppercase",
        }}
      >
        Est. 2024 · Small Batch · Single Origin
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3 · Product Moment (270–390) ───────────────────────
const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [90, 118], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneOp = fadeIn * fadeOut;

  const cupScale = spring({ frame, fps, config: { stiffness: 80, damping: 18 }, delay: 10 });
  const ringScale = spring({ frame, fps, config: { stiffness: 55, damping: 20 }, delay: 18 });

  // Rotating gold particles
  const particles = Array.from({ length: 12 }, (_, i) => i);
  const rotation = interpolate(frame, [0, 120], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: sceneOp,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Deep glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, #3A1E00 0%, ${BG} 65%)`,
        }}
      />

      {/* Orbiting particles */}
      {particles.map((i) => {
        const angle = ((i / particles.length) * 360 + rotation) * (Math.PI / 180);
        const radius = 195;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = i % 3 === 0 ? 4 : 2;
        const particleOp = 0.4 + (i % 4) * 0.1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: GOLD,
              opacity: particleOp,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              boxShadow: `0 0 6px ${GOLD}`,
            }}
          />
        );
      })}

      {/* Outer ring */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `1px solid ${GOLD}44`,
        }}
      />

      {/* Inner ring */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale * 0.8})`,
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: `1px solid ${GOLD}66`,
          boxShadow: `inset 0 0 40px ${GOLD}22, 0 0 40px ${GOLD}22`,
        }}
      />

      {/* Cup icon (vector-drawn with CSS) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -55%) scale(${cupScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Cup body */}
        <div
          style={{
            width: 80,
            height: 70,
            background: `linear-gradient(160deg, #1A1008, #0D0904)`,
            border: `1.5px solid ${GOLD}`,
            borderRadius: "4px 4px 16px 16px",
            position: "relative",
            boxShadow: `0 0 30px ${GOLD}44`,
          }}
        >
          {/* Handle */}
          <div
            style={{
              position: "absolute",
              right: -22,
              top: 14,
              width: 20,
              height: 28,
              border: `1.5px solid ${GOLD}`,
              borderRadius: "0 50% 50% 0",
              borderLeft: "none",
            }}
          />
          {/* Steam */}
          {[0, 1, 2].map((j) => {
            const steamY = interpolate((frame + j * 10) % 40, [0, 40], [0, -28]);
            const steamOp = interpolate((frame + j * 10) % 40, [0, 10, 35, 40], [0, 0.7, 0.4, 0]);
            return (
              <div
                key={j}
                style={{
                  position: "absolute",
                  top: -18,
                  left: 14 + j * 20,
                  width: 2,
                  height: 18,
                  background: `linear-gradient(to top, ${GOLD}88, transparent)`,
                  borderRadius: 2,
                  opacity: steamOp,
                  transform: `translateY(${steamY}px)`,
                  filter: "blur(1px)",
                }}
              />
            );
          })}
        </div>
        {/* Saucer */}
        <div
          style={{
            width: 104,
            height: 10,
            background: `linear-gradient(160deg, #1A1008, #0D0904)`,
            border: `1.5px solid ${GOLD}`,
            borderRadius: "50%",
            marginTop: -2,
            boxShadow: `0 4px 20px ${GOLD}33`,
          }}
        />
      </div>

      {/* Brand beneath cup */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          fontSize: 14,
          letterSpacing: "0.55em",
          color: GOLD,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 300,
          opacity: interpolate(frame, [30, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textTransform: "uppercase",
        }}
      >
        Premium Coffee
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4 · Tagline (390–450) ──────────────────────────────
const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["Rise", "Above", "the", "Ordinary"];

  // Scene fade in
  const sceneOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gold bar wipe
  const barW = interpolate(frame, [5, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo pop
  const logoScale = spring({ frame, fps, config: { stiffness: 200, damping: 22 }, delay: 38 });
  const logoOp = interpolate(frame, [38, 55], [0, 1], {
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
      {/* Deep warm glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, #251400 0%, ${BG} 70%)`,
        }}
      />

      {/* Gold sweep line top */}
      <Gold
        style={{
          width: `${barW * 560}px`,
          height: 1.5,
          marginBottom: 40,
          opacity: 0.8,
        }}
      />

      {/* Tagline words */}
      <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
        {words.map((word, i) => {
          const start = 12 + i * 10;
          const spr = spring({
            frame,
            fps,
            config: { stiffness: 140, damping: 18 },
            delay: start,
          });
          const op = interpolate(frame, [start, start + 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(spr, [0, 1], [30, 0]);
          const isKey = word === "Rise" || word === "Ordinary";
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: op,
                transform: `translateY(${y}px)`,
                fontSize: isKey ? 82 : 58,
                fontWeight: isKey ? 600 : 200,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: isKey ? GOLD_LIGHT : WHITE,
                letterSpacing: "-0.01em",
                textShadow: isKey ? `0 0 60px ${GOLD}88` : "none",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Gold sweep line bottom */}
      <Gold
        style={{
          width: `${barW * 560}px`,
          height: 1.5,
          marginTop: 40,
          marginBottom: 32,
          opacity: 0.8,
        }}
      />

      {/* Brand signature */}
      <div
        style={{
          opacity: logoOp,
          transform: `scale(${logoScale})`,
          fontSize: 18,
          letterSpacing: "0.45em",
          color: GOLD,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          textTransform: "uppercase",
          textShadow: `0 0 30px ${GOLD}66`,
        }}
      >
        SUMMIT BREW
      </div>
    </AbsoluteFill>
  );
};

// ── Root Composition ─────────────────────────────────────────
// Total: 450 frames = 15 seconds @ 30fps
export const SummitBrew: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Scene 1: Atmosphere   0 – 90 */}
      <Sequence from={0} durationInFrames={90}>
        <AtmosphereScene />
      </Sequence>

      {/* Scene 2: Kinetic Title  90 – 270 */}
      <Sequence from={90} durationInFrames={180}>
        <KineticTitle />
      </Sequence>

      {/* Scene 3: Product Moment  270 – 390 */}
      <Sequence from={270} durationInFrames={120}>
        <ProductScene />
      </Sequence>

      {/* Scene 4: Tagline  390 – 450 */}
      <Sequence from={390} durationInFrames={60}>
        <TaglineScene />
      </Sequence>
    </AbsoluteFill>
  );
};
