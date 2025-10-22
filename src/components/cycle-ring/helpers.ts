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
  strokeWidth: number;
  radius: number;
  currentDayRadius: number;
  phaseMap: Array<{ id: string; color: string } | null>;
  totalGaps: number;
  segmentGapMultiplier: number;
}

export const createDayAngles = ({
  timelineLengthInDays,
  strokeWidth,
  radius,
  currentDayRadius,
  phaseMap,
  totalGaps,
  segmentGapMultiplier,
}: CreateDayAnglesParams) => {
  const fullCircle = Math.PI * 2;
  const dayAngleIncrement = fullCircle / timelineLengthInDays;
  const strokeAngularWidth = (strokeWidth * 1.2) / radius;
  const currentDayAngularWidth = (currentDayRadius * 2) / radius; // Account for current day circle diameter
  const minGapRadians = Math.max(
    0,
    Math.max(
      strokeAngularWidth,
      currentDayAngularWidth * segmentGapMultiplier,
    ) - dayAngleIncrement,
  );

  const totalGapsAngle = totalGaps * minGapRadians;
  const adjustedDayIncrement =
    (fullCircle - totalGapsAngle) / timelineLengthInDays;

  const dayAngles: number[] = [];
  let currentAngle = -Math.PI / 2; // Start from top

  for (let day = 0; day < timelineLengthInDays; day++) {
    dayAngles[day] = currentAngle;
    currentAngle += adjustedDayIncrement;

    // Add gap after each phase transition
    if (day < timelineLengthInDays - 1) {
      const currentPhase = phaseMap[day];
      const nextPhase = phaseMap[day + 1];

      if (currentPhase && nextPhase && currentPhase.id !== nextPhase.id) {
        currentAngle += minGapRadians;
      }
    }
  }

  return dayAngles;
};
