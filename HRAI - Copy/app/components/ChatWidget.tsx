"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { fbGet } from "@/app/lib/firebase";

interface ChatMessage {
  type: "bot" | "user";
  html: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "bot",
      html: 'Hi Ahmad! I\'m your HR assistant. I can answer questions about <strong>leave policies</strong>, <strong>contracts</strong>, <strong>compliance</strong>, and more. How can I help?',
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [dbData, setDbData] = useState<Record<string, any>>({});
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Detect page context
  const getPageContext = useCallback(() => {
    const path = pathname.toLowerCase();
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("people")) return "People";
    if (path.includes("calendar")) return "Calendar";
    if (path.includes("contract")) return "Contracts";
    if (path.includes("compliance")) return "Compliance";
    if (path.includes("analytics")) return "Analytics";
    if (path.includes("settings")) return "Settings";
    return "General";
  }, [pathname]);

  const pageContext = getPageContext();

  // Load Firebase data once
  useEffect(() => {
    Promise.all([
      fbGet<Record<string, any>>("employees"),
      fbGet<any>("compliance"),
      fbGet<any[]>("alerts"),
      fbGet<any>("chatAssistant"),
      fbGet<any>("company"),
    ]).then(([employees, compliance, alerts, chatAssistant, company]) => {
      setDbData({
        employees: employees || {},
        compliance: compliance || {},
        alerts: alerts || [],
        chatAssistant: chatAssistant || {},
        company: company || {},
      });
    }).catch(() => { });
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // AI response engine (ported from chat-widget.js)
  const getResponse = useCallback(
    (query: string): string => {
      const q = query.toLowerCase();
      const employees = dbData.employees || {};
      const compliance = dbData.compliance || {};
      const chat = dbData.chatAssistant || {};
      const faqs =
        (chat.knowledgeBase && chat.knowledgeBase.faqs) || [];

      // Try FAQ match first
      const faqMatch = faqs.find((f: any) => {
        const fq = f.question.toLowerCase();
        const words = fq.split(/\s+/).filter((w: string) => w.length > 3);
        return words.filter((w: string) => q.includes(w)).length >= 2;
      });
      if (
        faqMatch &&
        !q.includes("visa") &&
        !q.includes("sarah") &&
        !q.includes("alex") &&
        !q.includes("training")
      ) {
        return faqMatch.answer;
      }

      // Notice period
      if (q.includes("notice period") || q.includes("notice")) {
        if (pageContext === "Contracts") {
          return `Based on the contract you're viewing, the notice period depends on length of service:<br><br>
          <strong>&bull; &lt; 2 years:</strong> 1 month<br>
          <strong>&bull; 2–5 years:</strong> 2 months<br>
          <strong>&bull; &gt; 5 years:</strong> 3 months<br><br>
          During probation, notice is <strong>1 week</strong>. This follows the <strong>Malaysian Employment Act 1955</strong>.`;
        }
        return `Under Deriv's policy (Malaysian Employment Act 1955):<br><br>
        <strong>&bull; &lt; 2 years service:</strong> 1 month notice<br>
        <strong>&bull; 2–5 years:</strong> 2 months<br>
        <strong>&bull; &gt; 5 years:</strong> 3 months<br>
        <strong>&bull; During probation:</strong> 1 week<br><br>
        Note: UK and Germany have different statutory requirements.`;
      }

      // Annual leave
      if (
        q.includes("annual leave") ||
        q.includes("leave days") ||
        q.includes("holiday")
      ) {
        return `Deriv grants <strong>18 days</strong> annual leave per year (pro-rated for new joiners). Key details:<br><br>
        <strong>&bull; Carry forward:</strong> Max 5 days to next year<br>
        <strong>&bull; Sick leave:</strong> 14 days paid<br>
        <strong>&bull; Hospitalization:</strong> 60 days<br>
        <strong>&bull; Compassionate:</strong> 3 days<br>
        <strong>&bull; Marriage:</strong> 3 days (one-time)<br><br>
        Public holidays follow local jurisdiction (Malaysia: 11 gazetted days).`;
      }

      // EPF / pension
      if (
        q.includes("epf") ||
        q.includes("pension") ||
        q.includes("provident fund") ||
        q.includes("contribution")
      ) {
        return `For Malaysian employees:<br><br>
        <strong>&bull; EPF Employee:</strong> 11% of monthly wages<br>
        <strong>&bull; EPF Employer:</strong> 12% of monthly wages<br>
        <strong>&bull; SOCSO:</strong> Employment Injury + Invalidity Scheme<br><br>
        For UK staff, <strong>National Insurance</strong> applies instead. Singapore uses <strong>CPF</strong> (Employee 20%, Employer 17%).`;
      }

      // Visa / Sarah Kim
      if (
        q.includes("visa") ||
        q.includes("sarah") ||
        q.includes("work permit")
      ) {
        const sarah = employees["emp-002"];
        const expiry =
          sarah && sarah.workPermit
            ? sarah.workPermit.expiryDate
            : "2026-02-23";
        const daysLeft = Math.max(
          0,
          Math.ceil(
            (new Date(expiry).getTime() - new Date().getTime()) / 86400000
          )
        );
        const permitType =
          sarah && sarah.workPermit
            ? sarah.workPermit.type
            : "Employment Pass";

        return `⚠️ <strong>Urgent Alert:</strong> ${sarah ? sarah.name : "Sarah Kim"}'s ${permitType} (Singapore) expires on <strong>${expiry}</strong> — that's <strong>${daysLeft} days away</strong>.<br><br>
        <strong>Recommended action:</strong><br>
        1. Initiate renewal application immediately<br>
        2. Prepare supporting documents (employment letter, financial records)<br>
        3. Budget processing time: ~10 business days<br><br>
        <a href="/compliance?alert=visa-sarah" style="color:var(--accent);text-decoration:underline">→ View in Compliance Dashboard</a>`;
      }

      // Contract — Alex
      if (
        q.includes("contract") &&
        (q.includes("alex") || q.includes("error") || q.includes("clause"))
      ) {
        const alex = employees["emp-001"];
        return `📄 <strong>Contract Issue — ${alex ? alex.name : "Alex Chen"}:</strong><br><br>
        The employment agreement references <strong>outdated EPF contribution rates</strong> (pre-2026 schedule). The correct rate is <strong>Employee 11%, Employer 12%</strong>.<br><br>
        <strong>Action needed:</strong> Update clause §6 before signing deadline (Feb 15).<br><br>
        <a href="/contract-generator" style="color:var(--accent);text-decoration:underline">→ Regenerate contract with correct clauses</a>`;
      }

      // Training
      if (
        q.includes("training") ||
        q.includes("safety") ||
        q.includes("eu team")
      ) {
        const tracker = compliance.trainingTracker;
        let overdueNames = "Tom Weber, and others";
        if (tracker && tracker[0]) {
          overdueNames = tracker[0].overdueEmployees
            ? tracker[0].overdueEmployees.join(", ")
            : overdueNames;
        }
        return `⚠️ <strong>Safety Training — EU Team:</strong><br><br>
        <strong>3 of 12</strong> EU employees haven't completed mandatory workplace safety training. Deadline: <strong>Feb 20, 2026</strong>.<br><br>
        Pending employees:<br>
        ${overdueNames
            .split(", ")
            .map((n: string) => "&bull; " + n)
            .join("<br>")}<br><br>
        <a href="/compliance?alert=training-eu" style="color:var(--accent);text-decoration:underline">→ Send reminder via Compliance page</a>`;
      }

      // Overtime
      if (q.includes("overtime") || q.includes("ot")) {
        return `Overtime applies to <strong>non-exempt employees only</strong>:<br><br>
        <strong>&bull; Weekdays:</strong> 1.5× hourly rate<br>
        <strong>&bull; Rest days:</strong> 2× hourly rate<br>
        <strong>&bull; Public holidays:</strong> 3× hourly rate<br><br>
        This follows the Malaysian Employment Act 1955, Part IV.`;
      }

      // Remote work
      if (
        q.includes("remote") ||
        q.includes("work from home") ||
        q.includes("wfh") ||
        q.includes("hybrid")
      ) {
        return `Deriv's remote work policy:<br><br>
        <strong>&bull; Hybrid:</strong> 2 days/week WFH for eligible roles<br>
        <strong>&bull; Full remote:</strong> Requires VP-level approval<br>
        <strong>&bull; Equipment:</strong> Company provides laptop & peripherals<br><br>
        Check with your department head for role eligibility.`;
      }

      // Probation
      if (q.includes("probation")) {
        return `Probation period at Deriv:<br><br>
        <strong>&bull; Duration:</strong> 3 months for all new hires<br>
        <strong>&bull; Notice during probation:</strong> 1 week<br>
        <strong>&bull; Extension:</strong> Can be extended by 1–3 months if needed<br>
        <strong>&bull; Benefits:</strong> Full benefits from Day 1 except equity vesting`;
      }

      // Maternity / paternity
      if (
        q.includes("maternity") ||
        q.includes("paternity") ||
        q.includes("parental")
      ) {
        return `Parental leave by jurisdiction:<br><br>
        <strong>🇲🇾 Malaysia:</strong> Maternity 98 days, Paternity 7 days<br>
        <strong>🇬🇧 UK:</strong> Maternity 52 weeks, Paternity 2 weeks<br>
        <strong>🇸🇬 Singapore:</strong> Maternity 16 weeks (govt-paid), Paternity 2 weeks<br><br>
        All fully paid per local statutory requirements.`;
      }

      // Compliance score
      if (
        q.includes("compliance") &&
        (q.includes("score") || q.includes("status"))
      ) {
        const score = compliance.overallScore || 94;
        const breakdown = compliance.scoreBreakdown || {};
        let breakdownHtml = "";
        for (const key in breakdown) {
          const item = breakdown[key];
          breakdownHtml += `&bull; ${item.label}: <strong>${item.score}%</strong> (${item.issues} issues)<br>`;
        }
        return `Current compliance status:<br><br>
        <strong>Overall Score: ${score}%</strong><br><br>
        ${breakdownHtml}<br>
        Visa quota remaining: <strong>${compliance.visaQuota ? compliance.visaQuota.availableQuota : 2}</strong> slots`;
      }

      // Headcount
      if (
        q.includes("headcount") ||
        q.includes("how many employees") ||
        q.includes("team size")
      ) {
        const company = dbData.company || {};
        const depts = company.departments || [];
        const deptHtml = depts
          .map((d: any) => `&bull; ${d.name}: ${d.headcount}`)
          .join("<br>");
        return `Current headcount: <strong>${company.totalEmployees || 247} employees</strong><br><br>
        ${deptHtml}<br><br>
        <strong>+${company.newThisMonth || 10}</strong> new this month. Attrition rate: <strong>${company.attritionRate || 4.2}%</strong>.`;
      }

      // Visa quota
      if (q.includes("quota") || q.includes("hiring")) {
        const vq = compliance.visaQuota || {};
        return `Visa quota status:<br><br>
        <strong>&bull; Total quota:</strong> ${vq.currentQuota || 12}<br>
        <strong>&bull; Used:</strong> ${vq.usedQuota || 10}<br>
        <strong>&bull; Available:</strong> ${vq.availableQuota || 2}<br>
        <strong>&bull; Q3 hiring target:</strong> ${vq.q3HiringTarget || 8}<br>
        <strong>&bull; Predicted shortfall:</strong> ${vq.predictedShortfall || 6} slots<br><br>
        ⚠️ ${vq.recommendation || "Apply for more visa slots to meet hiring targets."}`;
      }

      // Default / fallback
      const pageKey = pageContext.toLowerCase().replace(/\s+/g, "");
      const pageSuggestions =
        (chat.pageContext &&
          chat.pageContext[pageKey] &&
          chat.pageContext[pageKey].suggestedQuestions) ||
        [];
      const suggestHtml = pageSuggestions.length
        ? pageSuggestions.map((s: string) => "&bull; " + s).join("<br>")
        : "&bull; Leave policies & entitlements<br>&bull; Notice periods & termination<br>&bull; EPF/pension contributions<br>&bull; Active compliance alerts<br>&bull; Specific employee cases";

      return `I understand you're asking about "<strong>${query}</strong>". Based on Deriv's HR policies and the ${pageContext} context, I'd recommend checking with the relevant department head or reviewing the employee handbook.<br><br>
      You can also try asking me about:<br>
      ${suggestHtml}`;
    },
    [pageContext, dbData]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      setShowSuggestions(false);
      setMessages((prev) => [...prev, { type: "user", html: text }]);
      setInputValue("");
      setIsTyping(true);

      const delay = 800 + Math.random() * 1200;
      setTimeout(() => {
        setIsTyping(false);
        const response = getResponse(text);
        setMessages((prev) => [...prev, { type: "bot", html: response }]);
      }, delay);
    },
    [getResponse]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(inputValue);
  };

  const suggestions = [
    { label: "Notice period?", q: "What is the notice period?" },
    { label: "Annual leave?", q: "How many annual leave days do I get?" },
    { label: "EPF rates?", q: "What is the EPF contribution rate?" },
    { label: "Visa expiry?", q: "Tell me about Sarah Kim's visa expiry" },
  ];

  return (
    <>
      {/* FAB Button */}
      <button
        className={`chat-fab${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="fab-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <svg
          className="fab-close"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Chat Window */}
      <div className={`chat-window${isOpen ? " open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-avatar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="chat-header-info">
            <strong>derivHR Assistant</strong>
            <span>Online</span>
          </div>
          <span className="chat-context-badge">{pageContext}</span>
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={messagesRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.type}`}>
              <div className="chat-msg-avatar">
                {msg.type === "bot" ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ) : (
                  "AR"
                )}
              </div>
              <div
                className="chat-msg-bubble"
                dangerouslySetInnerHTML={{ __html: msg.html }}
              />
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="chat-suggestion"
                  onClick={() => sendMessage(s.q)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-typing visible">
              <div className="chat-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything about HR..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage(inputValue)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
