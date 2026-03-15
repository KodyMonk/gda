export async function classifySignal(comments: string[]) {
  const prompt = `
You are analyzing live Reddit comments during a possible missile/drone/interception event.

Decide the status for ONE country.

Possible states:
- Quiet
- Suspicious
- Being attacked

Instructions:
- Focus on real-time eyewitness comments only
- Ignore past stories ("last night", "yesterday", etc.)
- Ignore links, news summaries, speculation, and opinions
- Strong evidence includes: sirens, loud booms, thuds, interceptions, windows shaking, multiple users confirming current sounds

Comments:
${comments.join("\n")}

Return STRICT JSON only:
{
  "status": "Quiet | Suspicious | Being attacked",
  "confidence": 0.0,
  "reason": "short explanation"
}
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {
      status: "Quiet",
      confidence: 0.2,
      reason: "AI parse failed",
    };
  }
}

export async function summarizeGulfSituation(input: {
  bahrain: string[];
  qatar: string[];
  uae: string[];
  dubai: string[];
}) {
  const prompt = `
You are summarizing live Gulf Reddit megathread comments from the last 30 minutes.

Your job:
- say what appears to be happening across Bahrain, Qatar, UAE, and Dubai
- mention if activity looks concentrated in one place or spreading regionally
- keep it short, operational, and factual
- ignore past stories, links, speculation, and opinionated comments

Comments by country:

Bahrain:
${input.bahrain.length ? input.bahrain.join("\n") : "No strong recent comments."}

Qatar:
${input.qatar.length ? input.qatar.join("\n") : "No strong recent comments."}

UAE:
${input.uae.length ? input.uae.join("\n") : "No strong recent comments."}

Dubai:
${input.dubai.length ? input.dubai.join("\n") : "No strong recent comments."}

Return STRICT JSON only:
{
  "headline": "short one-line summary",
  "summary": "2-4 sentences max",
  "regionalPattern": "localized | spreading | unclear | quiet",
  "bahrainRiskHint": "low | elevated | high"
}
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {
      headline: "Gulf situation unclear",
      summary: "AI summary parse failed.",
      regionalPattern: "unclear",
      bahrainRiskHint: "low",
    };
  }
}