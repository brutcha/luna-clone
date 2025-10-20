import { StyleSheet, View } from "react-native";
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";
import type { FC, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import { createArcPath, createDayAngles, darkenColor } from "./helpers";

const RING_SIZE = 200 as const;
const STROKE_WIDTH_RATIO = 0.07 as const;
const CURRENT_DAY_SIZE_RATIO = 0.8 as const;
const SEGMENT_GAP_MULTIPLIER = 1.2 as const;

interface Props {
  timelineLengthInDays: number;
  currentDay: number;
  phases: Array<{
    id: "menstrual" | "follicular" | "ovulatory" | "luteal";
    startDay: number;
    lengthInDays: number;
    color: string;
  }>;
  className?: string;
}

export const CycleRing: FC<PropsWithChildren<Props>> = ({
  timelineLengthInDays,
  currentDay,
  phases,
  className,
  children,
}) => {
  const center = RING_SIZE / 2;
  const strokeWidth = RING_SIZE * STROKE_WIDTH_RATIO;
  const currentDayRadius = strokeWidth * CURRENT_DAY_SIZE_RATIO;
  const radius = Math.max(center - strokeWidth / 2 - currentDayRadius / 2, 0);

  const phaseMap = phases.flatMap(({ id, lengthInDays, color }) =>
    Array.from({ length: lengthInDays }, () => ({ id, color })),
  );

  const dayAngles = createDayAngles({
    timelineLengthInDays,
    strokeWidth,
    radius,
    currentDayRadius,
    phaseMap,
    totalGaps: phases.length,
    segmentGapMultiplier: SEGMENT_GAP_MULTIPLIER,
  });

  const currentDayAngle = dayAngles[currentDay];
  const currentDayPosition = {
    x: center + radius * Math.cos(currentDayAngle),
    y: center + radius * Math.sin(currentDayAngle),
  };
  const currentDayPhase = phaseMap[currentDay];
  const currentDayPhaseColor = currentDayPhase?.color ?? "deeppink";

  return (
    <View
      className={cn(
        "relative size-full flex-1 items-center justify-center",
        className,
      )}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <RadialGradient id="embossGradient" cx="45%" cy="45%" r="50%">
            <Stop
              offset="0%"
              stopColor={currentDayPhaseColor}
              stopOpacity={1.0}
            />
            <Stop
              offset="60%"
              stopColor={currentDayPhaseColor}
              stopOpacity={1}
            />
            <Stop
              offset="100%"
              stopColor={darkenColor(currentDayPhaseColor, 0.05)}
              stopOpacity={1}
            />
          </RadialGradient>
        </Defs>
        {phases.map(({ id, startDay, lengthInDays, color }) => {
          const phaseStartDay = startDay;
          const phaseEndDay = startDay + lengthInDays - 1;

          const startAngle = dayAngles[phaseStartDay];
          const endAngle =
            dayAngles[phaseEndDay || (phaseEndDay + 1) % timelineLengthInDays];

          return (
            <Path
              key={id}
              d={createArcPath(center, center, radius, startAngle, endAngle)}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}

        <Circle
          cx={currentDayPosition.x}
          cy={currentDayPosition.y}
          r={currentDayRadius}
          fill="url(#embossGradient)"
          stroke={currentDayPhaseColor}
          strokeWidth="0.5"
        />
      </Svg>
      {children}
    </View>
  );
};
