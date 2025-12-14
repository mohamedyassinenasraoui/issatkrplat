import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import api from "../../services/api";

const OFFICIAL_BASE = "https://issatkr.rnu.tn/";

// Demo thresholds
const ABSENCE_WARNING_AT = 3;
const ABSENCE_ELIMINATION_AT = 4;

function cn(...xs: (string | boolean | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function detectLanguage(text: string): "fr" | "en" {
  const lower = (text || "").toLowerCase();
  const frHints = [
    "é", "à", "ç", "attestation", "absence", "filière", "justification",
    "réclamation", "certificat", "inscription", "j'ai",
  ];
  return frHints.some((h) => lower.includes(h)) ? "fr" : "en";
}

function linkify(text: string) {
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

function getIntent(q: string) {
  const t = (q || "").toLowerCase();
  if (t.includes("absence") || t.includes("absences") || t.includes("justif") || t.includes("élim") || t.includes("elim"))
    return "absence";
  if (
    t.includes("attestation") || t.includes("certificat") || t.includes("inscription") ||
    t.includes("réclamation") || t.includes("reclamation") || t.includes("document") || t.includes("administratif")
  )
    return "docs";
  if (t.includes("fili") || t.includes("module") || t.includes("coefficient") || t.includes("validation") || t.includes("orientation"))
    return "pedagogy";
  return "general";
}

interface Action {
  id: string;
  label: string;
}

function buildActions(intent: string, lang: "fr" | "en"): Action[] {
  if (intent === "docs") {
    return lang === "fr"
      ? [
          { id: "request_doc", label: "📄 Demander un document" },
          { id: "track_requests", label: "🕒 Suivre mes demandes" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "request_doc", label: "📄 Request a document" },
          { id: "track_requests", label: "🕒 Track my requests" },
          { id: "open_site", label: "🌐 Official website" },
        ];
  }

  if (intent === "absence") {
    return lang === "fr"
      ? [
          { id: "submit_justif", label: "📤 Déposer une justification" },
          { id: "track_requests_justif", label: "📊 Statut justification" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "submit_justif", label: "📤 Submit justification" },
          { id: "track_requests_justif", label: "📊 Justification status" },
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

// Absence risk parsing
function parseAbsenceCount(text: string): number | null {
  const t = (text || "").toLowerCase();
  const patterns = [
    /(\d+)\s*(absence|absences)/,
    /(absence|absences)\s*[:=]?\s*(\d+)/,
    /(j'ai|jai|i have)\s*(\d+)\s*(absence|absences)?/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (!m) continue;
    const n = m.find((x) => /^\d+$/.test(x || ""));
    if (n) return Number(n);
  }
  if (/^\d+$/.test(t.trim())) return Number(t.trim());
  return null;
}

function buildAbsenceRiskMessage(lang: "fr" | "en", count: number) {
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
    `🧭 Risque d'absence`,
    `${statusEmoji} Statut: ${statusTextFR}`,
    `• Absences: ${count}`,
    `• Warning: ${ABSENCE_WARNING_AT}`,
    `• Élimination: ${ABSENCE_ELIMINATION_AT}`,
    `➡️ Clique sur "Déposer une justification" si tu as un justificatif.`,
  ].join("\n");

  const msgEN = [
    `🧭 Absence risk`,
    `${statusEmoji} Status: ${statusTextEN}`,
    `• Absences: ${count}`,
    `• Warning: ${ABSENCE_WARNING_AT}`,
    `• Elimination: ${ABSENCE_ELIMINATION_AT}`,
    `➡️ Click "Submit justification" if you have proof.`,
  ].join("\n");

  return lang === "fr" ? msgFR : msgEN;
}

// Accept "DD/MM/YYYY" and convert to "YYYY-MM-DD"
function normalizeDate(input: string) {
  const s = (input || "").trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return s;
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

interface MessageData {
  role: "user" | "assistant";
  text: string;
  actions?: Action[];
  time: string;
}

interface FlowData {
  kind: "JUSTIFICATION" | "DOCUMENT";
  step: number;
  data: Record<string, string>;
  lang: "fr" | "en";
}

interface MessageProps {
  role: "user" | "assistant";
  text: string;
  actions?: Action[];
  onAction: (action: Action) => void;
  time: string;
}

function Message({ role, text, actions, onAction, time }: MessageProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div 
          className="flex-shrink-0 flex items-center justify-center"
          style={{ 
            height: 36, 
            width: 36, 
            borderRadius: 12, 
            border: "1px solid #1d5b45", 
            background: "#0b1f17" 
          }}
        >
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
                className="hover:bg-[#0f2a20] transition-colors"
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
        <div 
          className="flex-shrink-0 flex items-center justify-center"
          style={{ 
            height: 36, 
            width: 36, 
            borderRadius: 12, 
            border: "1px solid #2cff9d", 
            background: "#0f2a20" 
          }}
        >
          <User size={18} color="#2cff9d" />
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<MessageData[]>([
    {
      role: "assistant",
      text:
        "Bonjour 👋\n\nJe suis l'Assistant ISSAT Kairouan.\nJe peux t'aider sur :\n- Procédures administratives\n- Absences & justifications\n- Filières, modules, coefficients\n\nPose ta question 👇",
      actions: buildActions("general", "fr"),
      time: nowTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const [flow, setFlow] = useState<FlowData | null>(null);

  const quickPrompts = useMemo(
    () => [
      "Comment faire une attestation ?",
      "Comment justifier une absence ?",
      "J'ai 3 absences, quel est le risque ?",
      "Quelles sont les règles d'élimination ?",
      "How can I request a student certificate?",
    ],
    []
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function pushAssistant(text: string, actions?: Action[]) {
    setMessages((m) => [...m, { role: "assistant", text, actions, time: nowTime() }]);
  }

  function getLastUserQuestion(msgs: MessageData[]) {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") return msgs[i].text;
    }
    return "";
  }

  function getFlowQuestion(f: FlowData | null): string | null {
    if (!f) return null;
    const fr = f.lang === "fr";

    if (f.kind === "JUSTIFICATION") {
      const questionsFR = [
        "✅ Pour créer la justification, donne-moi ton **ID étudiant** (ou email institutionnel).",
        "📚 Ta **filière / classe** ? (ex: RT2, INFO1…)",
        "📅 **Date de l'absence** ? (YYYY-MM-DD ou DD/MM/YYYY)",
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

  async function finalizeFlow(f: FlowData) {
    if (!f) return;

    try {
      if (f.kind === "JUSTIFICATION") {
        // Create document request via API
        await api.post('/documents', {
          type: 'justification',
          reason: f.data.reason,
          moduleId: null, // Would need to look up module
        });
        pushAssistant(
          f.lang === "fr"
            ? "✅ Justification créée ! Vous pouvez la voir dans l'espace Documents."
            : "✅ Justification created! You can see it in the Documents area."
        );
      }

      if (f.kind === "DOCUMENT") {
        await api.post('/documents', {
          type: f.data.docType?.toLowerCase().includes('attestation') ? 'attestation' : 
                f.data.docType?.toLowerCase().includes('relevé') ? 'releve_notes' : 'certificat',
          reason: f.data.note === 'non' ? '' : f.data.note,
        });
        pushAssistant(
          f.lang === "fr"
            ? "✅ Demande créée ! Vous pouvez suivre le statut dans l'espace Documents."
            : "✅ Request created! You can track the status in the Documents area."
        );
      }
    } catch (error) {
      pushAssistant(
        f.lang === "fr"
          ? "❌ Erreur lors de la création de la demande. Veuillez réessayer."
          : "❌ Error creating request. Please try again."
      );
    }

    setFlow(null);
  }

  async function handleAction(action: Action, lastUserQuestion: string) {
    const lang = detectLanguage(lastUserQuestion || "");

    if (action.id === "open_site") {
      window.open(OFFICIAL_BASE, "_blank", "noreferrer");
      return;
    }

    if (action.id === "submit_justif") {
      const f: FlowData = { kind: "JUSTIFICATION", step: 0, data: {}, lang };
      setFlow(f);
      const question = getFlowQuestion(f);
      if (question) pushAssistant(question);
      return;
    }

    if (action.id === "request_doc") {
      const f: FlowData = { kind: "DOCUMENT", step: 0, data: {}, lang };
      setFlow(f);
      const question = getFlowQuestion(f);
      if (question) pushAssistant(question);
      return;
    }

    if (action.id === "track_requests" || action.id === "track_requests_justif") {
      pushAssistant(
        lang === "fr"
          ? "📁 Suivi: vos demandes sont visibles dans l'espace Documents. L'admin peut accepter/refuser (En attente / Acceptée / Refusée)."
          : "📁 Tracking: your requests are visible in the Documents area. Admin can accept/reject (Pending / Accepted / Rejected)."
      );
      return;
    }
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;

    setMessages((m) => [...m, { role: "user", text: q, time: nowTime() }]);
    setInput("");

    // Flow mode
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
          const question = getFlowQuestion(nextFlow);
          if (question) pushAssistant(question);
        }
        return;
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
          const question = getFlowQuestion(nextFlow);
          if (question) pushAssistant(question);
        }
        return;
      }
    }

    // B) absence risk check
    const lang = detectLanguage(q);
    const intent = getIntent(q);

    if (intent === "absence") {
      const count = parseAbsenceCount(q);
      if (count !== null) {
        pushAssistant(buildAbsenceRiskMessage(lang, count), buildActions("absence", lang));
        return;
      }
    }

    // AI mode - call backend
    setThinking(true);
    try {
      const response = await api.post('/ai/ask', { question: q });
      const answer = response.data.answer;
      const actions = buildActions(intent, lang);
      setMessages((m) => [...m, { role: "assistant", text: answer, actions, time: nowTime() }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: lang === "fr" 
            ? "❌ Erreur de connexion. Vérifiez que le serveur est démarré."
            : "❌ Connection error. Check that the server is running.",
          actions: buildActions("general", lang),
          time: nowTime(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div style={{ minHeight: "80vh", background: "#050b08", color: "white", borderRadius: 24 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Sparkles color="#59ffb3" />
          <h1 style={{ margin: 0, fontSize: 20, color: "#c7ffe0" }}>ISSAT Assistant</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="hover:bg-[#0f2a20] transition-colors"
              style={{ 
                padding: "8px 10px", 
                borderRadius: 12, 
                border: "1px solid #1d5b45", 
                background: "#07140f", 
                color: "white", 
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ borderRadius: 24, border: "1px solid #1d5b45", background: "#040a07" }}>
          <div 
            style={{ 
              height: "55vh", 
              overflowY: "auto", 
              padding: 14, 
              display: "flex", 
              flexDirection: "column", 
              gap: 14 
            }}
          >
            {messages.map((m, i) => (
              <Message 
                key={i} 
                role={m.role} 
                text={m.text} 
                actions={m.actions} 
                time={m.time} 
                onAction={(a) => handleAction(a, getLastUserQuestion(messages))} 
              />
            ))}
            {thinking && (
              <div className="flex gap-3 justify-start">
                <div 
                  className="flex-shrink-0 flex items-center justify-center animate-pulse"
                  style={{ 
                    height: 36, 
                    width: 36, 
                    borderRadius: 12, 
                    border: "1px solid #1d5b45", 
                    background: "#0b1f17" 
                  }}
                >
                  <Bot size={18} color="#59ffb3" />
                </div>
                <div 
                  style={{ 
                    borderRadius: 16, 
                    padding: "10px 12px", 
                    border: "1px solid #1d5b45", 
                    background: "#07140f", 
                    color: "#c7ffe0" 
                  }}
                >
                  Réflexion...
                </div>
              </div>
            )}
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
              placeholder={flow ? "Réponds à la question ci-dessus…" : "Pose ta question..."}
              style={{ 
                flex: 1, 
                borderRadius: 12, 
                padding: "10px 12px", 
                background: "#07140f", 
                border: "1px solid #1d5b45", 
                color: "white",
                outline: "none",
              }}
              disabled={thinking}
            />
            {flow && (
              <button
                type="button"
                onClick={() => {
                  setFlow(null);
                  pushAssistant(detectLanguage(getLastUserQuestion(messages)) === "fr" 
                    ? "❌ Saisie annulée. Pose une nouvelle question." 
                    : "❌ Cancelled. Ask a new question."
                  );
                }}
                className="hover:bg-[#2a0707] transition-colors"
                style={{ 
                  borderRadius: 12, 
                  padding: "10px 12px", 
                  background: "#140707", 
                  border: "1px solid #5b1d1d", 
                  color: "#ffb3b3", 
                  cursor: "pointer" 
                }}
              >
                Annuler
              </button>
            )}
            <button 
              type="submit"
              className="hover:bg-[#1a3d2d] transition-colors disabled:opacity-50"
              style={{ 
                borderRadius: 12, 
                padding: "10px 14px", 
                background: "#0f2a20", 
                border: "1px solid #2cff9d", 
                color: "white", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }} 
              disabled={thinking}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
