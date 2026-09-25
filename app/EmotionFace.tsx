export default function EmotionFace({ emotion, label = "" }: { emotion: "happy" | "sad" | "angry" | "calm" | "frustrated"; label?: string }) {
  const name = emotion === "frustrated" ? "angry" : emotion;
  return <img className="plb-emotion-face" src={`/emotions/${name}.webp`} alt={label} width="320" height="320" draggable={false} />;
}
