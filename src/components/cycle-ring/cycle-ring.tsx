import { StyleSheet, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import type { FC, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import { createArcPath, createDayAngles } from "./helpers";

const RING_SIZE = 200 as const;
const STROKE_WIDTH_RATIO = 0.06 as const;
const SEGMENT_GAP_MULTIPLIER = 1.2 as const;
const GAP = 10;

interface Props {
  timelineLengthInDays: number;
  currentDay: number;
  ovulationDay: number;
  phases: Array<{
    id: "menstrual" | "follicular" | "luteal";
    startDay: number;
    lengthInDays: number;
    color: string;
  }>;
  className?: string;
}

export const CycleRing: FC<PropsWithChildren<Props>> = ({
  timelineLengthInDays,
  ovulationDay,
  phases,
  className,
  children,
}) => {
  const center = RING_SIZE / 2;
  const strokeWidth = RING_SIZE * STROKE_WIDTH_RATIO;
  const ovulationDayRadius = strokeWidth;
  const phaseRadius = RING_SIZE / 2 - GAP - strokeWidth;
  const fertileRadius = phaseRadius;

  const phaseMap = phases.flatMap(({ id, lengthInDays, color }) =>
    Array.from({ length: lengthInDays }, () => ({ id, color })),
  );

  const dayAngles = createDayAngles({
    timelineLengthInDays,
    strokeWidth,
    radius: phaseRadius,
    currentDayRadius: ovulationDayRadius,
    phaseMap,
    totalGaps: phases.length,
    segmentGapMultiplier: SEGMENT_GAP_MULTIPLIER,
  });

  const fertileStartDay = Math.max(0, ovulationDay - 2);
  const fertileEndDay = Math.min(timelineLengthInDays - 1, ovulationDay + 2);
  const fertileColor = "#008000";
  const dayAngleIncrement = (Math.PI * 2) / timelineLengthInDays;
  const fertileStartAngle = dayAngles[fertileStartDay] - dayAngleIncrement / 2;
  const fertileEndAngle = dayAngles[fertileEndDay] + dayAngleIncrement / 2;

  const ovulationAngle =
    (dayAngles[ovulationDay - 1] + dayAngles[ovulationDay + 1]) / 2;

  return (
    <View className={cn("relative size-full flex-1", className)}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={StyleSheet.absoluteFillObject}
      >
        <Path
          d={createArcPath(
            center,
            center,
            fertileRadius,
            fertileStartAngle,
            fertileEndAngle,
          )}
          stroke={fertileColor}
          strokeWidth={strokeWidth * 2}
          strokeLinecap="round"
          fill="none"
        />

        {phases.map(({ id, startDay, lengthInDays, color }) => {
          const phaseStartDay = startDay;
          const phaseEndDay = startDay + lengthInDays - 1;

          const startAngle = dayAngles[phaseStartDay];
          const endAngle =
            dayAngles[phaseEndDay || (phaseEndDay + 1) % timelineLengthInDays];

          return (
            <Path
              key={id}
              d={createArcPath(
                center,
                center,
                phaseRadius,
                startAngle,
                endAngle,
              )}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}

        <Circle
          cx={center + phaseRadius * Math.cos(ovulationAngle)}
          cy={center + phaseRadius * Math.sin(ovulationAngle)}
          r={ovulationDayRadius * 0.75}
          fill="white"
        />
      </Svg>

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
};
