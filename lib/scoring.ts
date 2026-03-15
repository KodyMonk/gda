import { DetectionResult } from "./types";

export function calculateBahrainRisk30(
  bahrain: DetectionResult,
  qatar: DetectionResult,
  uae: DetectionResult,
  saudi: DetectionResult
): number {
  let score = 0;

  if (qatar.status === "Being attacked") score += 20;
  if (uae.status === "Being attacked") score += 20;
  if (saudi.status === "Being attacked") score += 15;
  if (bahrain.status === "Suspicious") score += 20;
  if (bahrain.status === "Being attacked") score += 40;

  const activeCountries = [qatar, uae, saudi].filter((r) => r.status !== "Quiet").length;
  if (activeCountries >= 2) score += 15;
  if (bahrain.confidence === "High") score += 10;

  return Math.min(95, score);
}   