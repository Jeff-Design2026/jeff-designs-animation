import "./index.css";
import { Composition } from "remotion";
import { JeffDesigns } from "./JeffDesigns";
import { SummitBrew } from "./SummitBrew";
import { StatsVideo } from "./StatsVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JeffDesigns"
        component={JeffDesigns}
        durationInFrames={570}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SummitBrew"
        component={SummitBrew}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StatsVideo"
        component={StatsVideo}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
