import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { FC, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import { createArcPath, createDayAngles, getCurrentPhase } from "./helpers";
import { PhaseShape } from "./types";

const RING_SIZE = 200 as const;
const OUTER_STROKE_WIDTH = 5 as const;
const OUTER_RADIUS = 90 as const;
const INNER_STROKE_WIDTH = 5 as const;
const INNER_RADIUS = 80 as const;
const GAP_LENGTH = 10 as const;
const CURRENT_DAY_STROKE_WIDTH = 5 as const;

interface Props {
  timelineLengthInDays: number;
  currentDay: number;
  ovulationDay: number;
  phases: PhaseShape[];
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

  const dayAngles = createDayAngles({
    timelineLengthInDays,
    radius: OUTER_RADIUS,
    gapLength: GAP_LENGTH,
  });

  const currentPhase = getCurrentPhase(phases, currentDay);

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
        <Circle
          cx={center}
          cy={center}
          r={OUTER_RADIUS + OUTER_STROKE_WIDTH * 0.5}
          stroke="none"
          fill="#fff7e8"
        />

        {phases.map(({ id, startDay, lengthInDays, color }) => {
          const endDay = startDay + lengthInDays - 1;

          const { start } = dayAngles[startDay];
          const { end } = dayAngles[endDay];

          return (
            <Path
              key={id}
              d={createArcPath(center, center, OUTER_RADIUS, start, end)}
              stroke={color}
              strokeWidth={OUTER_STROKE_WIDTH}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}

        <Circle
          cx={center}
          cy={center}
          r={INNER_RADIUS + INNER_STROKE_WIDTH * 0.5}
          stroke="none"
          fill={`${currentPhase.color}33`}
        />

        <Circle
          cx={center}
          cy={center}
          r={INNER_RADIUS}
          stroke="#fff7e866"
          strokeWidth={INNER_STROKE_WIDTH}
          fill="none"
        />

        <Path
          d={createArcPath(
            center,
            center,
            INNER_RADIUS,
            dayAngles[0].start,
            dayAngles[currentDay].end,
          )}
          stroke={`${currentPhase.color}99`}
          strokeWidth={CURRENT_DAY_STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
};
