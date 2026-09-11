import React, { useEffect, useState } from "react";

const sizeMap = { sm: 60, md: 90, lg: 120 };
const strokeMap = { sm: 5, md: 6, lg: 8 };
const fontMap = { sm: "text-sm", md: "text-xl", lg: "text-2xl" };
const subFontMap = { sm: "text-[8px]", md: "text-xs", lg: "text-sm" };

export default function ATSRadial({ score = 0, size = "md" }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const dim = sizeMap[size] || sizeMap.md;
  const stroke = strokeMap[size] || strokeMap.md;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;
  const color =
    score >= 70
      ? "text-emerald-400 stroke-emerald-400"
      : score >= 40
      ? "text-amber-400 stroke-amber-400"
      : "text-rose-400 stroke-rose-400";

  const trackColor =
    score >= 70
      ? "stroke-emerald-500/15"
      : score >= 40
      ? "stroke-amber-500/15"
      : "stroke-rose-500/15";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} className="-rotate-90">
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={trackColor}
        />
        {/* Progress */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={color}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${fontMap[size]} ${color.split(" ")[0]}`}>
          {Math.round(animatedScore)}
        </span>
        <span className={`${subFontMap[size]} text-gray-500 -mt-0.5`}>%</span>
      </div>
    </div>
  );
}
