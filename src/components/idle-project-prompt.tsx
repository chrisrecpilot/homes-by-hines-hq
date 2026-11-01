import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const EXAMPLES = ["rear extension", "garden room", "loft conversion", "kitchen renovation", "new bathroom", "single-storey extension"];

/** Visual demonstration only: never participates in form values or accessible text. */
export function IdleProjectPrompt({ visible }: { visible: boolean }) {
  const reducedMotion = useReducedMotion();
  const [example, setExample] = useState(0);
  const [characters, setCharacters] = useState(0);
  const [erasing, setErasing] = useState(false);
  useEffect(() => {
    if (!visible || reducedMotion) return;
    const word = EXAMPLES[example] ?? EXAMPLES[0] ?? "rear extension";
    const complete = characters === word.length;
    const delay = erasing ? 38 : complete ? 1800 : characters === 0 ? 450 : 65 + (characters % 4) * 22;
    const timer = window.setTimeout(() => {
      if (erasing && characters === 0) {
        setExample((i) => (i + 1) % EXAMPLES.length);
        setErasing(false);
      } else if (erasing) setCharacters((n) => n - 1);
      else if (complete) setErasing(true);
      else setCharacters((n) => n + 1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, example, characters, erasing]);
  if (!visible) return null;
  const text = reducedMotion ? "rear extension" : (EXAMPLES[example] ?? "rear extension").slice(0, characters);
  return <span aria-hidden="true" className="idle-project-prompt pointer-events-none absolute inset-x-5 top-5 text-base text-muted-foreground sm:inset-x-6 sm:top-6 sm:text-lg">
    <span>I'm looking to build a… </span><span>{text}</span><span className="idle-typing-cursor" />
  </span>;
}