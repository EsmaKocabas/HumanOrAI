import { TextAnalyzer } from "./components/TextAnalyzer";
import { BackgroundEffects } from "./components/BackgroundEffects";

export default function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      <TextAnalyzer />
    </div>
  );
}