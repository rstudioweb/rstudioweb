"use client";

import { useSprings, animated, config } from "@react-spring/web";
import { useEffect, useState } from "react";

type Props = {
  text: string;
  className?: string;
  delayStep?: number;
};

export default function SplitText({
  text,
  className = "",
  delayStep = 100,
}: Props) {
  const letters = text.split("");
  const [springs, api] = useSprings(letters.length, (i) => ({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: i * delayStep,
    config: config.gentle,
  }));

  // Optional: Trigger again on remount
  const [trigger, setTrigger] = useState(false);
  useEffect(() => {
    setTrigger(true);
  }, []);

  return (
    <span className={`inline-block ${className}`}>
      {springs.map((style, i) => (
        <animated.span key={i} style={style} className="inline-block">
          {letters[i] === " " ? "\u00A0" : letters[i]}
        </animated.span>
      ))}
    </span>
  );
}
