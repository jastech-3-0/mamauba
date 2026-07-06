/**
 * Server-side ZAI SDK wrapper for AI features.
 * MUST be used only in API routes / server components.
 */
import ZAI from "z-ai-web-dev-sdk";

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function llmChat(
  systemPrompt: string,
  userPrompt: string,
  opts: { thinking?: boolean } = {},
): Promise<string> {
  const zai = await getZai();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    thinking: { type: opts.thinking ? "enabled" : "disabled" },
  });
  return completion.choices[0]?.message?.content ?? "";
}

/**
 * Ask the LLM to return strictly-valid JSON.
 * Falls back to extracting the first {...} block if the model returns
 * surrounding prose.
 */
export async function llmJson<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  const raw = await llmChat(systemPrompt, userPrompt);
  // Try strict parse first
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Extract first {...} block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* noop */
      }
    }
    throw new Error("LLM did not return valid JSON: " + raw.slice(0, 200));
  }
}
