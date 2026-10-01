import React from "react";
import { Check, X } from "lucide-react";
import { APPLICATION_TIMELINE_STEPS } from "../constants";

export default function StatusTimeline({ currentStatus }) {
  const steps = APPLICATION_TIMELINE_STEPS;
  const isRejected = currentStatus === "rejected";
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center w-full my-4">
      {steps.map((step, index) => {
        const isCompleted = !isRejected && currentIndex > index;
        const isCurrent = !isRejected && currentIndex === index;
        
        let circleStyle = "bg-gray-800 border-2 border-gray-700 text-gray-500";
        if (isCompleted) circleStyle = "bg-emerald-500 border-emerald-500 text-black";
        if (isCurrent) circleStyle = "bg-[#070b13] border-2 border-emerald-500 text-emerald-400 animate-[pulse-ring_2s_infinite]";
        
        let lineStyle = "bg-gray-700";
        if (isCompleted || isCurrent) lineStyle = "bg-emerald-500";

        return (
          <React.Fragment key={step}>
            <div className="relative flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isRejected ? (index === 0 ? "bg-rose-500 border-rose-500 text-black" : "bg-gray-800 border-2 border-gray-700 text-gray-500") : circleStyle}`}>
                {isCompleted && <Check size={16} strokeWidth={3} />}
                {isRejected && index === 0 && <X size={16} strokeWidth={3} />}
                {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
              </div>
              <span className={`absolute top-10 text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-emerald-400' : isRejected && index === 0 ? 'text-rose-400' : isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                {isRejected && index === 0 ? "Rejected" : step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${isRejected ? 'bg-gray-700' : lineStyle}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
