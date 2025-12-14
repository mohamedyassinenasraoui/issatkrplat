import OpenAI from "openai";

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("Missing OPENAI_API_KEY. Put it in .env.local or export it in your shell.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: key });

const question = process.argv.slice(2).join(" ") || "How can I request a student certificate at ISSAT?";

const system = "You are the official assistant of ISSAT Kairouan. Respond clearly and in an institutional tone.";
const instruction = [
  "EXACT structure:",
  "✅ Short answer (1–2 lines)",
  "📋 Steps (bullet points)",
  "📄 Required documents (or 'None')",
  "⏱️ Deadlines (or 'Not specified')",
  "⚠️ Notes / Rules (if applicable)",
  "📌 Sources: https://issatkr.rnu.tn/",
  "",
  "Rules:",
  "- Do not invent. If unknown, say 'Not specified'.",
].join("\n");

async function main() {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Question: ${question}\n\n${instruction}` },
    ],
    temperature: 0.2,
  });

  console.log(resp.choices[0]?.message?.content ?? "(no content)");
}

main().catch((e) => {
  console.error("OpenAI error:");
  console.error(e?.message || e);
  process.exit(1);
});
