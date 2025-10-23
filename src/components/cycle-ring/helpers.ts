import { PhaseShape } from "./types";

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadians: number,
) => ({
  x: centerX + radius * Math.cos(angleInRadians),
  y: centerY + radius * Math.sin(angleInRadians),
});

export const createArcPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const normalizedEndAngle =
    (endAngle - startAngle + Math.PI * 2) % (Math.PI * 2);
  const largeArcFlag = normalizedEndAngle > Math.PI ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

interface CreateDayAnglesParams {
  timelineLengthInDays: number;
  gapLength: number;
  radius: number;
}

interface DayAngles {
  start: number;
  end: number;
}

export const createDayAngles = ({
  timelineLengthInDays,
  gapLength,
  radius,
}: CreateDayAnglesParams): DayAngles[] => {
  const fullCircle = Math.PI * 2;
  const gapAngleIncrement = gapLength / radius;
  const totalDaysLength = fullCircle - gapAngleIncrement * timelineLengthInDays;
  const dayAngleIncrement = totalDaysLength / timelineLengthInDays;

  const dayAngles: DayAngles[] = [];
  let currentAngle = -Math.PI / 2; // Start from top

  for (let day = 0; day < timelineLengthInDays; day++) {
    dayAngles[day] = {
      start: currentAngle,
      end: currentAngle + dayAngleIncrement,
    };
    currentAngle += dayAngleIncrement + gapAngleIncrement;
  }

  return dayAngles;
};

export const getCurrentPhase = (phases: PhaseShape[], currentDay: number) => {
  const daysMap = phases.flatMap((phase) =>
    Array.from({ length: phase.lengthInDays }, () => phase),
  );

  return daysMap[currentDay];
};
