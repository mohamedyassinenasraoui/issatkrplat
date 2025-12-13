import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import OpenAI from "openai";

const OFFICIAL_BASE = "https://issatkr.rnu.tn/";

// Demo thresholds (adjust later)
const ABSENCE_WARNING_AT = 3;
const ABSENCE_ELIMINATION_AT = 4;

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function detectLanguage(text) {
  const lower = (text || "").toLowerCase();
  const frHints = [
    "é",
    "à",
    "ç",
    "attestation",
    "absence",
    "filière",
    "justification",
    "réclamation",
    "certificat",
    "inscription",
    "j'ai",
  ];
  return frHints.some((h) => lower.includes(h)) ? "fr" : "en";
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = (text || "").split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#7dffbd", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function getIntent(q) {
  const t = (q || "").toLowerCase();
  if (t.includes("absence") || t.includes("absences") || t.includes("justif") || t.includes("élim") || t.includes("elim"))
    return "absence";
  if (
    t.includes("attestation") ||
    t.includes("certificat") ||
    t.includes("inscription") ||
    t.includes("réclamation") ||
    t.includes("reclamation") ||
    t.includes("document") ||
    t.includes("administratif")
  )
    return "docs";
  if (t.includes("fili") || t.includes("module") || t.includes("coefficient") || t.includes("validation") || t.includes("orientation"))
    return "pedagogy";
  return "general";
}

function buildActions(intent, lang) {
  if (intent === "docs") {
    return lang === "fr"
      ? [
          { id: "request_doc", label: "📄 Demander un document" },
          { id: "track_requests", label: "🕒 Suivre mes demandes (Docs)" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "request_doc", label: "📄 Request a document" },
          { id: "track_requests", label: "🕒 Track my requests (Docs)" },
          { id: "open_site", label: "🌐 Official website" },
        ];
  }

  if (intent === "absence") {
    return lang === "fr"
      ? [
          { id: "submit_justif", label: "📤 Déposer une justification" },
          { id: "track_requests_justif", label: "📊 Statut (acceptée/refusée/en attente)" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "submit_justif", label: "📤 Submit justification" },
          { id: "track_requests_justif", label: "📊 Status (accepted/rejected/pending)" },
          { id: "open_site", label: "🌐 Official website" },
        ];
  }

  if (intent === "pedagogy") {
    return lang === "fr"
      ? [
          { id: "track_requests", label: "📁 Espace documents" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "track_requests", label: "📁 Documents area" },
          { id: "open_site", label: "🌐 Official website" },
        ];
  }

  return lang === "fr"
    ? [{ id: "open_site", label: "🌐 Site officiel" }]
    : [{ id: "open_site", label: "🌐 Official website" }];
}

// ✅ Requests become “Document Requests” (admin will see them later)
async function createDocumentRequest(payload) {
  const request = {
    id: `REQ-${Date.now()}`,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  // TODO: connect backend later
  console.log("✅ Document request created (send to admin documents):", request);
  return request;
}

async function askAI(question) {
  const lang = detectLanguage(question);

  const system =
    lang === "fr"
      ? "Tu es un assistant officiel de l’ISSAT Kairouan. Réponds de manière institutionnelle, claire et fiable."
      : "You are the official assistant of ISSAT Kairouan. Respond clearly, reliably, and in an institutional tone.";

  const instruction =
    lang === "fr"
      ? [
          "Structure EXACTE:",
          "✅ Réponse courte (1–2 lignes)",
          "📋 Étapes (bullet points)",
          "📄 Documents requis (ou 'Aucun')",
          "⏱️ Délais (ou 'Non précisé')",
          "⚠️ Remarques / Règles",
          `📌 Sources: ${OFFICIAL_BASE}`,
          "",
          "Règles:",
          "- N'invente rien.",
          "- Si l’information n’est pas connue, écris 'Non précisé'.",
        ].join("\n")
      : [
          "EXACT structure:",
          "✅ Short answer (1–2 lines)",
          "📋 Steps (bullet points)",
          "📄 Required documents (or 'None')",
          "⏱️ Deadlines (or 'Not specified')",
          "⚠️ Notes / Rules",
          `📌 Sources: ${OFFICIAL_BASE}`,
          "",
          "Rules:",
          "- Do not invent information.",
          "- If unknown, say 'Not specified'.",
        ].join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Question: ${question}\n\n${instruction}` },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content ?? "No response.";
}

// accept "DD/MM/YYYY" and convert to "YYYY-MM-DD"
function normalizeDate(input) {
  const s = (input || "").trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return s;
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

// Absence risk parsing
function parseAbsenceCount(text) {
  const t = (text || "").toLowerCase();
  const patterns = [
    /(\d+)\s*(absence|absences)/,
    /(absence|absences)\s*[:=]?\s*(\d+)/,
    /(j'ai|jai|i have)\s*(\d+)\s*(absence|absences)?/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (!m) continue;
    const n = m.find((x) => /^\d+$/.test(x));
    if (n) return Number(n);
  }
  if (/^\d+$/.test(t.trim())) return Number(t.trim());
  return null;
}

function buildAbsenceRiskMessage(lang, count) {
  const fr = lang === "fr";
  let statusEmoji = "🟢";
  let statusTextFR = "OK";
  let statusTextEN = "OK";

  if (count >= ABSENCE_ELIMINATION_AT) {
    statusEmoji = "🔴";
    statusTextFR = "Risque élevé (élimination)";
    statusTextEN = "High risk (elimination)";
  } else if (count >= ABSENCE_WARNING_AT) {
    statusEmoji = "🟡";
    statusTextFR = "Attention (warning)";
    statusTextEN = "Warning";
  }

  const msgFR = [
    `🧭 Risque d’absence (demo)`,
    `${statusEmoji} Statut: ${statusTextFR}`,
    `• Absences: ${count}`,
    `• Warning: ${ABSENCE_WARNING_AT}`,
    `• Élimination: ${ABSENCE_ELIMINATION_AT}`,
    `➡️ Clique sur “Déposer une justification” si tu as un justificatif.`,
  ].join("\n");

  const msgEN = [
    `🧭 Absence risk (demo)`,
    `${statusEmoji} Status: ${statusTextEN}`,
    `• Absences: ${count}`,
    `• Warning: ${ABSENCE_WARNING_AT}`,
    `• Elimination: ${ABSENCE_ELIMINATION_AT}`,
    `➡️ Click “Submit justification” if you have proof.`,
  ].join("\n");

  return fr ? msgFR : msgEN;
}

function Message({ role, text, actions, onAction, time }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div style={{ height: 36, width: 36, borderRadius: 12, border: "1px solid #1d5b45", background: "#0b1f17", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot size={18} color="#59ffb3" />
        </div>
      )}

      <div style={{ maxWidth: "78%" }}>
        <div
          style={{
            borderRadius: 16,
            padding: "10px 12px",
            border: isUser ? "1px solid #2cff9d" : "1px solid #1d5b45",
            background: isUser ? "#0f2a20" : "#07140f",
            color: isUser ? "#d7ffe8" : "#c7ffe0",
            whiteSpace: "pre-wrap",
          }}
        >
          {linkify(text)}
        </div>

        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: isUser ? "right" : "left" }}>
          {time}
        </div>

        {!isUser && actions?.length ? (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => onAction(a)}
                style={{
                  fontSize: 12,
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px solid #1d5b45",
                  background: "#050b08",
                  color: "#c7ffe0",
                  cursor: "pointer",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isUser && (
        <div style={{ height: 36, width: 36, borderRadius: 12, border: "1px solid #2cff9d", background: "#0f2a20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={18} color="#2cff9d" />
        </div>
      )}
    </div>
  );
}

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hello / Bonjour 👋\n\nI’m the ISSAT Assistant.\nJe peux t’aider sur :\n- Procédures administratives\n- Absences & justifications\n- Filières, modules, coefficients\n\nAsk your question 👇",
      actions: buildActions("general", "en"),
      time: nowTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  const [flow, setFlow] = useState(null);

  const quickPrompts = useMemo(
    () => [
      "Comment faire une attestation ?",
      "Comment justifier une absence ?",
      "J'ai 3 absences, quel est le risque ?",
      "Quelles sont les règles d’élimination ?",
      "Quels sont les modules et coefficients ?",
      "How can I request a student certificate?",
    ],
    []
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function pushAssistant(text, actions) {
    setMessages((m) => [...m, { role: "assistant", text, actions, time: nowTime() }]);
  }

  function getLastUserQuestion(msgs) {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") return msgs[i].text;
    }
    return "";
  }

  function getFlowQuestion(f) {
    if (!f) return null;
    const fr = f.lang === "fr";

    if (f.kind === "JUSTIFICATION") {
      const questionsFR = [
        "✅ Pour créer la justification, donne-moi ton **ID étudiant** (ou email institutionnel).",
        "📚 Ta **filière / classe** ? (ex: RT2, INFO1…)",
        "📅 **Date de l’absence** ? (YYYY-MM-DD ou DD/MM/YYYY)",
        "📖 **Module / matière** ? (si tu sais)",
        "📝 **Motif** (médical / famille / autre) + une petite description.",
      ];
      const questionsEN = [
        "✅ To create the justification, give me your **student ID** (or institutional email).",
        "📚 Your **program / class**? (e.g., RT2, CS1…)",
        "📅 **Absence date**? (YYYY-MM-DD or DD/MM/YYYY)",
        "📖 **Module / subject**? (if known)",
        "📝 **Reason** (medical / family / other) + short description.",
      ];
      return fr ? questionsFR[f.step] : questionsEN[f.step];
    }

    if (f.kind === "DOCUMENT") {
      const questionsFR = [
        "✅ Pour créer la demande, donne-moi ton **ID étudiant** (ou email institutionnel).",
        "📄 Quel **document** veux-tu ? (attestation de scolarité / relevé de notes / autre)",
        "📝 Un **commentaire** (optionnel) ? (sinon écris: non)",
      ];
      const questionsEN = [
        "✅ To create the request, give me your **student ID** (or institutional email).",
        "📄 Which **document** do you need? (enrollment certificate / transcript / other)",
        "📝 Any **note** (optional)? (otherwise type: no)",
      ];
      return fr ? questionsFR[f.step] : questionsEN[f.step];
    }

    return null;
  }

  async function finalizeFlow(f) {
    if (!f) return;

    if (f.kind === "JUSTIFICATION") {
      const payload = {
        type: "JUSTIFICATION",
        title: f.lang === "fr" ? "Justification d’absence" : "Absence justification",
        data: {
          studentId: f.data.studentId,
          filiere: f.data.filiere,
          date: f.data.date,
          module: f.data.module,
          reason: f.data.reason,
        },
      };
      await createDocumentRequest(payload);
      pushAssistant(
        f.lang === "fr"
          ? "✅ Justification créée. Elle apparaîtra dans Admin → Documents (statut: En attente)."
          : "✅ Justification created. It will appear in Admin → Documents (status: Pending)."
      );
    }

    if (f.kind === "DOCUMENT") {
      const payload = {
        type: "DOCUMENT",
        title: f.lang === "fr" ? "Demande de document" : "Document request",
        data: {
          studentId: f.data.studentId,
          docType: f.data.docType,
          note: f.data.note,
        },
      };
      await createDocumentRequest(payload);
      pushAssistant(
        f.lang === "fr"
          ? "✅ Demande créée. Elle apparaîtra dans Admin → Documents (statut: En attente)."
          : "✅ Request created. It will appear in Admin → Documents (status: Pending)."
      );
    }

    setFlow(null);
  }

  async function handleAction(action, lastUserQuestion) {
    const lang = detectLanguage(lastUserQuestion || "");

    if (action.id === "open_site") {
      window.open(OFFICIAL_BASE, "_blank", "noreferrer");
      return;
    }

    if (action.id === "submit_justif") {
      const f = { kind: "JUSTIFICATION", step: 0, data: {}, lang };
      setFlow(f);
      pushAssistant(getFlowQuestion(f));
      return;
    }

    if (action.id === "request_doc") {
      const f = { kind: "DOCUMENT", step: 0, data: {}, lang };
      setFlow(f);
      pushAssistant(getFlowQuestion(f));
      return;
    }

    if (action.id === "track_requests" || action.id === "track_requests_justif") {
      pushAssistant(
        lang === "fr"
          ? "📁 Suivi: vos demandes seront visibles dans l’espace Documents. L’admin peut accepter/refuser (En attente / Acceptée / Refusée)."
          : "📁 Tracking: your requests will be visible in the Documents area. Admin can accept/reject (Pending / Accepted / Rejected)."
      );
      return;
    }
  }

  async function send(text) {
    const q = text.trim();
    if (!q || thinking) return;

    setMessages((m) => [...m, { role: "user", text: q, time: nowTime() }]);
    setInput("");

    // flow mode
    if (flow) {
      const current = flow;

      if (current.kind === "JUSTIFICATION") {
        const nextData = { ...current.data };
        if (current.step === 0) nextData.studentId = q;
        if (current.step === 1) nextData.filiere = q;
        if (current.step === 2) nextData.date = normalizeDate(q);
        if (current.step === 3) nextData.module = q;
        if (current.step === 4) nextData.reason = q;

        const nextStep = current.step + 1;

        if (nextStep >= 5) {
          await finalizeFlow({ ...current, data: nextData });
          pushAssistant(current.lang === "fr" ? "✨ Terminé ! Pose une nouvelle question." : "✨ Done! Ask a new question.");
        } else {
          const nextFlow = { ...current, step: nextStep, data: nextData };
          setFlow(nextFlow);
          pushAssistant(getFlowQuestion(nextFlow));
        }
      }

      if (current.kind === "DOCUMENT") {
        const nextData = { ...current.data };
        if (current.step === 0) nextData.studentId = q;
        if (current.step === 1) nextData.docType = q;
        if (current.step === 2) nextData.note = q;

        const nextStep = current.step + 1;

        if (nextStep >= 3) {
          await finalizeFlow({ ...current, data: nextData });
          pushAssistant(current.lang === "fr" ? "✨ Terminé ! Pose une nouvelle question." : "✨ Done! Ask a new question.");
        } else {
          const nextFlow = { ...current, step: nextStep, data: nextData };
          setFlow(nextFlow);
          pushAssistant(getFlowQuestion(nextFlow));
        }
      }

      return;
    }

    // B) absence risk
    const lang = detectLanguage(q);
    const intent = getIntent(q);

    if (intent === "absence") {
      const count = parseAbsenceCount(q);
      if (count === null) {
        pushAssistant(lang === "fr" ? "🧭 Combien d’absences as-tu ? (ex: 2)" : "🧭 How many absences do you have? (e.g., 2)");
      } else {
        pushAssistant(buildAbsenceRiskMessage(lang, count), buildActions("absence", lang));
      }
    }

    // AI mode
    setThinking(true);
    try {
      const answer = await askAI(q);
      const actions = buildActions(intent, lang);
      setMessages((m) => [...m, { role: "assistant", text: answer, actions, time: nowTime() }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "❌ OpenAI error. Check VITE_OPENAI_API_KEY and restart Vite.",
          actions: buildActions("general", "en"),
          time: nowTime(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050b08", color: "white" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Sparkles color="#59ffb3" />
          <h1 style={{ margin: 0, fontSize: 20 }}>ISSAT Assistant</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #1d5b45", background: "#07140f", color: "white", cursor: "pointer" }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ borderRadius: 24, border: "1px solid #1d5b45", background: "#040a07" }}>
          <div style={{ height: "60vh", overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((m, i) => (
              <Message key={i} role={m.role} text={m.text} actions={m.actions} time={m.time} onAction={(a) => handleAction(a, getLastUserQuestion(messages))} />
            ))}
            {thinking && <div style={{ fontSize: 13, color: "#c7ffe0" }}>Thinking...</div>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #1d5b45" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={flow ? "Answer the question above…" : "Type your question..."}
              style={{ flex: 1, borderRadius: 12, padding: "10px 12px", background: "#07140f", border: "1px solid #1d5b45", color: "white" }}
              disabled={thinking}
            />
            {flow && (
              <button
                type="button"
                onClick={() => {
                  setFlow(null);
                  pushAssistant(detectLanguage(getLastUserQuestion(messages)) === "fr" ? "❌ Saisie annulée. Pose une nouvelle question." : "❌ Cancelled. Ask a new question.");
                }}
                style={{ borderRadius: 12, padding: "10px 12px", background: "#140707", border: "1px solid #5b1d1d", color: "#ffb3b3", cursor: "pointer" }}
              >
                Cancel
              </button>
            )}
            <button style={{ borderRadius: 12, padding: "10px 12px", background: "#0f2a20", border: "1px solid #2cff9d", color: "white", cursor: "pointer" }} disabled={thinking}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
