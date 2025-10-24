export type PhaseID = "menstrual" | "follicular" | "fertile" | "luteal";

export interface PhaseShape {
  id: PhaseID;
  startDay: number;
  lengthInDays: number;
  color: string;
}
