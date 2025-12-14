import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Bot, User, Sparkles, X, MessageSquare } from "lucide-react";
import api from "../../services/api";

const OFFICIAL_BASE = "https://issatkr.rnu.tn/";
const ABSENCE_WARNING_AT = 3;
const ABSENCE_ELIMINATION_AT = 4;

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
    "é", "à", "ç", "attestation", "absence", "filière", "justification",
    "réclamation", "certificat", "inscription", "j'ai", "bonjour", "salut"
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
        className="text-emerald-400 underline hover:text-emerald-300"
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
    t.includes("attestation") || t.includes("certificat") || t.includes("inscription") ||
    t.includes("réclamation") || t.includes("reclamation") || t.includes("document") ||
    t.includes("administratif")
  )
    return "docs";
  if (t.includes("fili") || t.includes("module") || t.includes("coefficient") || t.includes("validation") || t.includes("orientation"))
    return "pedagogy";
  return "general";
}

function buildActions(intent, lang) {
  const isFr = lang === "fr";
  
  if (intent === "docs") {
    return isFr
      ? [
          { id: "request_doc", label: "📄 Demander un document" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "request_doc", label: "📄 Request a document" },
          { id: "open_site", label: "🌐 Official website" },
        ];
  }

  if (intent === "absence") {
    return isFr
      ? [
          { id: "submit_justif", label: "📤 Déposer une justification" },
          { id: "open_site", label: "🌐 Site officiel" },
        ]
      : [
          { id: "submit_justif", label: "📤 Submit justification" },
          { id: "open_site", label: "🌐 Official website" },
        ];
  }

  return isFr
    ? [{ id: "open_site", label: "🌐 Site officiel" }]
    : [{ id: "open_site", label: "🌐 Official website" }];
}

function normalizeDate(input) {
  const s = (input || "").trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return s;
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

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

  return fr 
    ? `🧭 Risque d’absence\n${statusEmoji} Statut: ${statusTextFR}\n• Absences: ${count}\n• Warning: ${ABSENCE_WARNING_AT}\n• Élimination: ${ABSENCE_ELIMINATION_AT}`
    : `🧭 Absence risk\n${statusEmoji} Status: ${statusTextEN}\n• Absences: ${count}\n• Warning: ${ABSENCE_WARNING_AT}\n• Elimination: ${ABSENCE_ELIMINATION_AT}`;
}

function Message({ role, text, actions, onAction, time }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-9 w-9 rounded-xl border border-emerald-900 bg-emerald-950 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-emerald-400" />
        </div>
      )}

      <div className="max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl px-3 py-2.5 text-sm whitespace-pre-wrap shadow-sm",
            isUser 
              ? "bg-emerald-900/50 border border-emerald-500/50 text-emerald-50" 
              : "bg-slate-900 border border-slate-700 text-slate-200"
          )}
        >
          {linkify(text)}
        </div>

        <div className={cn("text-[10px] opacity-60 mt-1", isUser ? "text-right" : "text-left")}>
          {time}
        </div>

        {!isUser && actions?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => onAction(a)}
                className="text-xs px-3 py-1.5 rounded-xl border border-emerald-900 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900 transition-colors"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-9 w-9 rounded-xl border border-emerald-500/50 bg-emerald-900/50 flex items-center justify-center shrink-0">
          <User size={18} className="text-emerald-400" />
        </div>
      )}
    </div>
  );
}

export default function Assistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello / Bonjour 👋\n\nI’m the ISSAT Assistant.\nJe peux t’aider sur :\n- Procédures administratives\n- Absences & justifications\n- Filières, modules...\n\nAsk your question 👇",
      actions: buildActions("general", "en"),
      time: nowTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [flow, setFlow] = useState(null);
  const endRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      "Comment faire une attestation ?",
      "Comment justifier une absence ?",
      "J'ai 3 absences, quel risque ?",
    ],
    []
  );

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, thinking, isOpen]);

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
          "✅ Pour la justification, donne-moi ton **ID étudiant**.",
          "📚 Ta **filière** ? (ex: RT2, INFO1…)",
          "📅 **Date** ? (YYYY-MM-DD)",
          "📖 **Module** ?",
          "📝 **Motif** + description.",
        ];
        const questionsEN = [
          "✅ Give me your **student ID**.",
          "📚 Your **program**? (e.g., RT2…)",
          "📅 **Date**? (YYYY-MM-DD)",
          "📖 **Module**?",
          "📝 **Reason** + description.",
        ];
        return fr ? questionsFR[f.step] : questionsEN[f.step];
      }
  
      if (f.kind === "DOCUMENT") {
        const questionsFR = [
          "✅ Pour la demande, donne-moi ton **ID étudiant**.",
          "📄 Quel **document** ? (attestation / relevé...)",
          "📝 Un **commentaire** ? (ou: non)",
        ];
        const questionsEN = [
          "✅ Give me your **student ID**.",
          "📄 Which **document**? (certificate / transcript...)",
          "📝 Any **note**? (or: no)",
        ];
        return fr ? questionsFR[f.step] : questionsEN[f.step];
      }
  
      return null;
  }

  async function finalizeFlow(f) {
    if (!f) return;
    
    // In a real app we would call the API here to create the request
    // const endpoint = f.kind === "JUSTIFICATION" ? '/absences/justify' : '/documents/request';
    // await api.post(endpoint, f.data);

    // For now we simulate success as per the original demo logic, but using local state
    setFlow(null);
    pushAssistant(
      f.lang === "fr"
        ? "✅ Demande enregistrée (Simulation). Elle serait envoyée à l'administration."
        : "✅ Request saved (Simulation). It would be sent to administration."
    );
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
  }

  async function send(text) {
    const q = text.trim();
    if (!q || thinking) return;

    setMessages((m) => [...m, { role: "user", text: q, time: nowTime() }]);
    setInput("");

    // Flow handling
    if (flow) {
        const current = flow;
        const nextData = { ...current.data };
        
        // Simple mapping based on step index
        const keys = current.kind === "JUSTIFICATION" 
            ? ['studentId', 'filiere', 'date', 'module', 'reason']
            : ['studentId', 'docType', 'note'];
            
        if (current.step < keys.length) {
            nextData[keys[current.step]] = q;
        }

        const nextStep = current.step + 1;
        const maxSteps = keys.length;

        if (nextStep >= maxSteps) {
          await finalizeFlow({ ...current, data: nextData });
        } else {
          const nextFlow = { ...current, step: nextStep, data: nextData };
          setFlow(nextFlow);
          pushAssistant(getFlowQuestion(nextFlow));
        }
        return;
    }

    // Absence risk check
    const lang = detectLanguage(q);
    const intent = getIntent(q);

    if (intent === "absence") {
      const count = parseAbsenceCount(q);
      if (count !== null) {
        pushAssistant(buildAbsenceRiskMessage(lang, count), buildActions("absence", lang));
        return; // Skip AI call if it's a simple regex check
      }
    }

    // AI API Call
    setThinking(true);
    try {
      const { data } = await api.post('/ai/ask', { question: q });
      const actions = buildActions(intent, lang);
      setMessages((m) => [...m, { role: "assistant", text: data.answer, actions, time: nowTime() }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "❌ Erreur de connexion au serveur AI.",
          actions: buildActions("general", "en"),
          time: nowTime(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105",
            "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border border-emerald-400/30",
            isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className={cn(
            "fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-[#09090b] border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right",
            isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none translate-y-10"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Bot size={20} className="text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">ISSAT Assistant</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-slate-400">Online</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
                <X size={18} />
            </button>
        </div>

        {/* Messages Information Note */}
        <div className="px-4 py-2 bg-emerald-900/20 border-b border-emerald-900/30 text-[10px] text-emerald-400 text-center">
            IA Assistant - Réponses générées par intelligence artificielle
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((m, i) => (
            <Message key={i} {...m} onAction={(a) => handleAction(a, getLastUserQuestion(messages))} />
          ))}
          {thinking && (
            <div className="flex gap-2 items-center text-xs text-slate-500 ml-1">
                <div className="h-2 w-2 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-emerald-500/50 rounded-full animate-bounce"></div>
                Thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Example Prompts (only if empty input) */}
        {!input && messages.length < 3 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
                {quickPrompts.map(p => (
                    <button 
                        key={p}
                        onClick={() => send(p)}
                        className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        {p}
                    </button>
                ))}
            </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t border-slate-800 bg-slate-900/30 rounded-b-2xl backdrop-blur-sm"
        >
          <div className="relative flex gap-2">
             {flow && (
                <button
                  type="button"
                  onClick={() => {
                    setFlow(null);
                    pushAssistant("❌ Annulé.");
                  }}
                  className="px-3 py-2 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 text-xs transition-colors"
                >
                  Cancel
                </button>
              )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={flow ? "Répondre..." : "Poser une question..."}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              disabled={thinking}
            />
            <button 
                type="submit"
                disabled={thinking || !input.trim()}
                className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
