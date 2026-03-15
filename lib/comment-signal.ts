export function extractSignalComments(comments: string[]) {

  const signals = [
    "siren",
    "sirens",
    "boom",
    "booms",
    "explosion",
    "thud",
    "interception",
    "heard it",
    "heard that",
    "windows shook",
    "wuuuush",
    "shake"
  ];

  const pastIndicators = [
    "last night",
    "yesterday",
    "earlier",
    "before",
    "previous"
  ];

  return comments.filter((text) => {

    const lower = text.toLowerCase();

    if (pastIndicators.some(p => lower.includes(p))) return false;

    return signals.some(s => lower.includes(s));

  });
}