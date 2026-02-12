"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════
   DERIV HR — Landing Page (React Migration)
   ═══════════════════════════════════════════ */

const typingWords = [
  "invisible.", "effortless.", "automated.", "seamless.",
  "intelligent.", "instant.", "autonomous.", "frictionless.",
  "self-service.", "delightful.",
];

const chatResponses: Record<string, string> = {
  leave: `You currently have **18 days** of annual leave remaining out of 24 days for 2026.\n\n📅 Used: 6 days\n🏖️ Pending: 2 days (Mar 15-16)\n\nWould you like to submit a new leave request?`,
  expense: `Yes! Coworking space expenses are covered under our **Remote Work Allowance** policy.\n\n💰 Monthly limit: **$200 USD**\n📋 Required: Receipt + coworking space name\n⏱️ Submit within 30 days of expense\n\nShall I start an expense claim for you?`,
  address: `I can help you update your home address! I'll need:\n\n1. 🏠 **New address** (full with postal code)\n2. 📅 **Effective date**\n3. 📄 **Proof of address** (utility bill or bank statement)\n\nPlease provide your new address and I'll process the update.`,
  promotion: `Promotion eligibility at Deriv is based on:\n\n📊 **Performance**: Consistently exceeds expectations (2+ review cycles)\n🎯 **Impact**: Demonstrated business impact in current role\n📈 **Growth**: Evidence of operating at next level\n⏳ **Tenure**: Minimum 12 months in current role\n\nBased on your profile, you've been in your current role for **14 months**. Your next review cycle is in **April 2026**.`,
  default: `That's a great question! Let me look into that for you.\n\nI'm searching our HR knowledge base for the most accurate answer. For complex queries, I may route this to your HR Business Partner for a detailed response.\n\nIs there anything else I can help with in the meantime?`,
};

const chatSuggestions = [
  { emoji: "🏖️", label: "Leave balance", question: "How many days of annual leave do I have?" },
  { emoji: "💰", label: "Expense policy", question: "Can I expense coworking space?" },
  { emoji: "📋", label: "Update details", question: "I need to update my home address" },
  { emoji: "📈", label: "Promotion", question: "When am I eligible for promotion?" },
];

function getResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("leave") || q.includes("annual") || q.includes("vacation") || q.includes("holiday") || q.includes("day off")) return chatResponses.leave;
  if (q.includes("expense") || q.includes("cowork") || q.includes("cost") || q.includes("reimburse") || q.includes("allowance")) return chatResponses.expense;
  if (q.includes("address") || q.includes("update") || q.includes("change") || q.includes("details") || q.includes("bank")) return chatResponses.address;
  if (q.includes("promot") || q.includes("eligible") || q.includes("career") || q.includes("growth") || q.includes("raise")) return chatResponses.promotion;
  return chatResponses.default;
}

function formatBotText(text: string): string {
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\n/g, "<br>");
  return formatted;
}

type ChatMsg = { text: string; isBot: boolean };

export default function LandingClient() {
  // ── State ──
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navToggleActive, setNavToggleActive] = useState(false);

  // Dashboard preview
  const [dashPage, setDashPage] = useState("dashboard");
  const [dashUrl, setDashUrl] = useState("derivhr.ai/dashboard");
  const [activeDashCard, setActiveDashCard] = useState<number | null>(null);
  const [activeChartBar, setActiveChartBar] = useState(5);
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);
  const [activeCalEvent, setActiveCalEvent] = useState<number | null>(null);
  const [activeContractFilter, setActiveContractFilter] = useState("All");
  const [activeCtRow, setActiveCtRow] = useState<number | null>(null);
  const [activePersonRow, setActivePersonRow] = useState<number | null>(null);
  const [activeCompRow, setActiveCompRow] = useState<number | null>(null);
  const [activeComplianceItem, setActiveComplianceItem] = useState<number | null>(null);
  const [activeOutputDoc, setActiveOutputDoc] = useState<number | null>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { text: "Hi! I'm your HR assistant. Ask me about leave balance, expense policies, benefits, or anything HR-related. 👋", isBot: true },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Stat counters
  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [stat3, setStat3] = useState(0);
  const statsAnimated = useRef(false);

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const phasesSectionRef = useRef<HTMLDivElement>(null);
  const heroStatsRef = useRef<HTMLDivElement>(null);

  const typingWordRef = useRef<HTMLSpanElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });

  // ── Loader ──
  useEffect(() => {
    const timer = setTimeout(() => setLoaderHidden(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ── Hide scrollbar on body/html for landing page ──
  useEffect(() => {
    document.documentElement.style.scrollbarWidth = "none";
    document.body.style.overflow = "";
    const style = document.createElement("style");
    style.textContent = "html::-webkit-scrollbar{display:none}body{scrollbar-width:none}body::-webkit-scrollbar{display:none}";
    document.head.appendChild(style);
    return () => {
      document.documentElement.style.scrollbarWidth = "";
      style.remove();
    };
  }, []);

  // ── Typing effect (ref-based, matching original script.js exactly) ──
  useEffect(() => {
    if (!loaderHidden) return;
    const el = typingWordRef.current;
    if (!el) return;

    const words = typingWords;
    let currentIndex = 0;
    const typeSpeed = 100;
    const deleteSpeed = 60;
    const holdDuration = 2500;
    const pauseAfterDelete = 400;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function schedule(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    }

    function getNextWord() {
      let next: number;
      do {
        next = Math.floor(Math.random() * words.length);
      } while (next === currentIndex && words.length > 1);
      currentIndex = next;
      return words[currentIndex];
    }

    function deleteWord(cb: () => void) {
      const text = el!.textContent || "";
      if (text.length === 0) { cb(); return; }
      el!.textContent = text.slice(0, -1);
      schedule(() => deleteWord(cb), deleteSpeed);
    }

    function typeWord(word: string, i: number, cb: () => void) {
      if (i > word.length) { cb(); return; }
      el!.textContent = word.slice(0, i);
      schedule(() => typeWord(word, i + 1, cb), typeSpeed);
    }

    function cycle() {
      schedule(() => {
        deleteWord(() => {
          schedule(() => {
            const next = getNextWord();
            typeWord(next, 0, () => {
              cycle();
            });
          }, pauseAfterDelete);
        });
      }, holdDuration);
    }

    // Type the first word immediately
    typeWord(words[0], 0, () => {
      cycle();
    });

    return () => { timers.forEach(clearTimeout); };
  }, [loaderHidden]);

  // ── Custom cursor ──
  useEffect(() => {
    function onMove(e: MouseEvent) {
      cursorPos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    }
    window.addEventListener("mousemove", onMove);

    let raf: number;
    function animateFollower() {
      followerPos.current.x += (cursorPos.current.x - followerPos.current.x) * 0.12;
      followerPos.current.y += (cursorPos.current.y - followerPos.current.y) * 0.12;
      if (followerRef.current) {
        followerRef.current.style.left = followerPos.current.x + "px";
        followerRef.current.style.top = followerPos.current.y + "px";
      }
      raf = requestAnimationFrame(animateFollower);
    }
    raf = requestAnimationFrame(animateFollower);

    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  // ── Scroll: nav, progress bar, parallax orbs, timeline line, nav active link ──
  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      setNavScrolled(scrollY > 60);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);

      // Parallax orbs
      const orbs = wrapperRef.current?.querySelectorAll(".gradient-orb");
      orbs?.forEach((orb, i) => {
        const speed = 0.03 + i * 0.015;
        (orb as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
      });

      // Timeline line
      if (timelineLineRef.current && phasesSectionRef.current) {
        const rect = phasesSectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.top < vh && rect.top + rect.height > 0) {
          const progress = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
          timelineLineRef.current.style.background = `linear-gradient(to bottom, var(--accent) ${progress * 100}%, var(--border) ${progress * 100}%)`;
        }
      }

      // Nav active link highlight
      const sections = wrapperRef.current?.querySelectorAll("section[id]");
      const navLinks = wrapperRef.current?.querySelectorAll(".nav-links a:not(.nav-cta)");
      if (sections && navLinks) {
        const sy = scrollY + 200;
        sections.forEach((section) => {
          const top = (section as HTMLElement).offsetTop;
          const height = (section as HTMLElement).offsetHeight;
          const id = section.getAttribute("id");
          if (sy >= top && sy < top + height) {
            navLinks.forEach((link) => {
              (link as HTMLElement).style.color = "";
              if (link.getAttribute("href") === "#" + id) {
                (link as HTMLElement).style.color = "var(--text)";
              }
            });
          }
        });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Cursor hover effects on interactive elements ──
  useEffect(() => {
    const follower = followerRef.current;
    const wrapper = wrapperRef.current;
    if (!follower || !wrapper) return;

    const interactiveEls = wrapper.querySelectorAll("a, button, .btn, .problem-card, .wow-card, .timeline-card, .principle-card, .feature-mockup");
    const enter = () => follower.classList.add("hovering");
    const leave = () => follower.classList.remove("hovering");

    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, [loaderHidden]);

  // ── Reveal on scroll (IntersectionObserver) ──
  useEffect(() => {
    if (!loaderHidden) return;
    const reveals = wrapperRef.current?.querySelectorAll(".reveal");
    if (!reveals) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loaderHidden]);

  // ── Count-up animation ──
  useEffect(() => {
    if (!loaderHidden || statsAnimated.current) return;
    const el = heroStatsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated.current) {
            statsAnimated.current = true;
            animateCount(setStat1, 90, 2000);
            animateCount(setStat2, 5, 2000);
            animateCount(setStat3, 40, 2000);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaderHidden]);

  function animateCount(setter: (v: number) => void, target: number, duration: number) {
    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ── Card glow & tilt effects ──
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", x + "%");
    card.style.setProperty("--mouse-y", y + "%");

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((e.clientY - rect.top) - centerY) / centerY * -4;
    const rotateY = ((e.clientX - rect.left) - centerX) / centerX * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  }, []);

  // ── Chat ──
  function handleChatSend() {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { text, isBot: false }]);
    setChatInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = getResponse(text);
      setChatMessages((prev) => [...prev, { text: response, isBot: true }]);
      setShowSuggestions(true);
    }, 1000 + Math.random() * 800);
  }

  function handleSuggestionClick(question: string) {
    setChatInput(question);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { text: question, isBot: false }]);
      setChatInput("");
      setShowSuggestions(false);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [...prev, { text: getResponse(question), isBot: true }]);
        setShowSuggestions(true);
      }, 1000 + Math.random() * 800);
    }, 50);
  }

  // Scroll chat to bottom
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatMessages, isTyping, showSuggestions]);

  // ── Smooth anchor scroll ──
  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#") || href === "#") return;
    e.preventDefault();
    const target = wrapperRef.current?.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Close mobile menu
    setMobileOpen(false);
    setNavToggleActive(false);
  }

  // ── Dashboard page switching ──
  function switchDashPage(page: string) {
    setDashPage(page);
    setDashUrl("derivhr.ai/" + page);
  }

  // ── Magnetic button ──
  function handleMagneticMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    e.currentTarget.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  }
  function handleMagneticLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.style.transform = "";
  }

  return (
    <div className="deriv-app landing-page" ref={wrapperRef}>
      {/* ════════ CUSTOM CURSOR ════════ */}
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-follower" ref={followerRef}></div>

      {/* ════════ LOADER ════════ */}
      <div className={`loader${loaderHidden ? " hidden" : ""}`}>
        <div className="loader-inner">
          <div className="loader-bar"></div>
          <span className="loader-text">deriv<span className="accent">HR</span></span>
        </div>
      </div>

      {/* ════════ NAV ════════ */}
      <nav className={`nav${navScrolled ? " scrolled" : ""}`}>
        <a href="#" className="nav-logo" onClick={(e) => handleAnchorClick(e, "#hero")}>deriv<span className="accent">HR</span></a>
        <div className="nav-links">
          <a href="#problem" onClick={(e) => handleAnchorClick(e, "#problem")}>Problem</a>
          <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Features</a>
          <a href="#phases" onClick={(e) => handleAnchorClick(e, "#phases")}>Phases</a>
          <a href="#demo" onClick={(e) => handleAnchorClick(e, "#demo")}>Demo</a>
          <a href="#contact" className="nav-cta" onClick={(e) => handleAnchorClick(e, "#contact")}>Get Started</a>
        </div>
        <button className={`nav-toggle${navToggleActive ? " active" : ""}`} aria-label="Menu" onClick={() => { setNavToggleActive(!navToggleActive); setMobileOpen(!mobileOpen); }}>
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className="scroll-progress" style={{ width: scrollProgress + "%" }}></div>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <a href="#problem" onClick={(e) => handleAnchorClick(e, "#problem")}>Problem</a>
        <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Features</a>
        <a href="#phases" onClick={(e) => handleAnchorClick(e, "#phases")}>Phases</a>
        <a href="#demo" onClick={(e) => handleAnchorClick(e, "#demo")}>Demo</a>
        <a href="#contact" className="nav-cta" onClick={(e) => handleAnchorClick(e, "#contact")}>Get Started</a>
      </div>

      {/* ════════ HERO ════════ */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="pulse-dot"></span> AI-Powered HR Platform
          </div>
          <h1 className="hero-title">
            <span className="reveal">HR operations</span>
            <span className="reveal">become <em className="gradient-text" id="typing-wrapper"><span id="typing-word" ref={typingWordRef}></span></em></span>
          </h1>
          <p className="hero-sub reveal">
            Contracts generate themselves. Queries answer themselves.<br />
            The future of HR is self-service, intelligent, and effortless.
          </p>
          <div className="hero-actions reveal">
            <Link href="/dashboard" className="btn btn-primary" onMouseMove={handleMagneticMove} onMouseLeave={handleMagneticLeave}>
              <span>See it in action</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <a href="#features" className="btn btn-ghost" onClick={(e) => handleAnchorClick(e, "#features")}>Explore features</a>
          </div>

          <div className="hero-stats reveal" ref={heroStatsRef}>
            <div className="stat">
              <span className="stat-number">{stat1}</span><span className="stat-suffix">%</span>
              <span className="stat-label">Less paperwork</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{stat2}</span><span className="stat-suffix">sec</span>
              <span className="stat-label">Avg. query response</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{stat3}</span><span className="stat-suffix">+</span>
              <span className="stat-label">Jurisdictions</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ════════ MARQUEE ════════ */}
      <section className="marquee-section">
        <div className="marquee">
          <div className="marquee-track">
            {["Contract Generation", "Policy Intelligence", "Compliance Tracking", "Multi-Jurisdiction", "Conversational AI", "Smart Onboarding",
              "Contract Generation", "Policy Intelligence", "Compliance Tracking", "Multi-Jurisdiction", "Conversational AI", "Smart Onboarding"].flatMap((t, i) => [
              <span key={`t${i}`}>{t}</span>,
              <span key={`d${i}`} className="marquee-dot">◆</span>,
            ])}
          </div>
        </div>
      </section>

      {/* ════════ PROBLEM ════════ */}
      <section className="section problem-section" id="problem">
        <div className="container">
          <div className="section-header">
            <span className="section-tag reveal">The Problem</span>
            <h2 className="section-title reveal">
              HR teams are drowning<br />in <span className="gradient-text">repetitive tasks.</span>
            </h2>
          </div>
          <div className="problem-grid">
            {[
              { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>, title: "Manual Documents", desc: '"Every hire needs an offer letter, employment contract, NDA, equity docs — each customised manually. It takes <strong>hours per person.</strong>"', stat: "~4 hrs", statLabel: "per new hire" },
              { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, title: "Repeated Questions", desc: '"Employees ask the same questions repeatedly: leave policy, benefits, expense limits. Every question <strong>interrupts someone\'s work.</strong>"', stat: "70%", statLabel: "repeated queries" },
              { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: "Compliance Chaos", desc: '"We track compliance in spreadsheets: work permits, visa renewals, training certifications. It\'s <strong>error-prone and tedious.</strong>"', stat: "32%", statLabel: "risk of missed deadlines" },
              { icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, title: "Workflow Bottlenecks", desc: '"Simple requests like updating an address or changing bank details require an HR ticket and <strong>back-and-forth emails.</strong>"', stat: "3 days", statLabel: "avg. ticket resolution" },
            ].map((card, i) => (
              <div key={i} className="problem-card reveal" data-delay={i * 100} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                <div className="card-glow"></div>
                <div className="problem-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{card.icon}</svg>
                </div>
                <h3>{card.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: card.desc }} />
                <div className="problem-stat">{card.stat} <span>{card.statLabel}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag reveal">The Solution</span>
            <h2 className="section-title reveal">
              AI that handles the work,<br />so <span className="gradient-text">you handle the people.</span>
            </h2>
            <p className="section-sub reveal">Three powerful capabilities working together to make HR operations disappear.</p>
          </div>

          <div className="features-showcase">
            {/* Feature 1: Contract */}
            <div className="feature-row reveal">
              <div className="feature-visual">
                <div className="feature-mockup contract-mockup">
                  <div className="mockup-header">
                    <div className="mockup-dots"><span></span><span></span><span></span></div>
                    <span>contract-generator.ai</span>
                  </div>
                  <div className="mockup-body">
                    <div className="contract-field"><label>Role</label><input type="text" className="field-input" defaultValue="Senior Software Engineer" /></div>
                    <div className="contract-field"><label>Location</label><input type="text" className="field-input" defaultValue="Kuala Lumpur, MY" /></div>
                    <div className="contract-field"><label>Salary</label><input type="text" className="field-input" defaultValue="MYR 180,000 / year" /></div>
                    <div className="contract-output">
                      <div className="output-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <span>Generated Documents</span>
                      </div>
                      {["Employment_Contract_MY.pdf", "NDA_Standard.pdf", "Equity_Grant_Letter.pdf", "Benefits_Summary_MY.pdf"].map((doc, i) => (
                        <div key={i} className={`output-doc${activeOutputDoc === i ? " active" : ""}`} onClick={() => setActiveOutputDoc(i)}>
                          <span className="doc-icon">📄</span> {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-info">
                <span className="feature-number">01</span>
                <h3>Intelligent Document Generation</h3>
                <p>Feed in structured data — role, salary, location — and watch complete employment packages materialise. Legally accurate. Jurisdiction-aware. Version-controlled.</p>
                <ul className="feature-list">
                  {["Contract assembly from templates", "Equity & grant documentation", "Multi-country localisation", "Amendment & renewal tracking"].map((item, i) => (
                    <li key={i}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 2: Chat */}
            <div className="feature-row reverse reveal">
              <div className="feature-visual">
                <div className="feature-mockup chat-mockup">
                  <div className="mockup-header">
                    <div className="mockup-dots"><span></span><span></span><span></span></div>
                    <span>hr-assistant.ai</span>
                    <span className="chat-status-dot"></span>
                  </div>
                  <div className="mockup-body chat-body" ref={chatBodyRef}>
                    {chatMessages.map((msg, i) => (
                      msg.isBot ? (
                        <div key={i} className="chat-message bot-msg">
                          <div className="bot-avatar">AI</div>
                          <div className="bot-content"><span dangerouslySetInnerHTML={{ __html: formatBotText(msg.text) }} /></div>
                        </div>
                      ) : (
                        <div key={i} className="chat-message user-msg-live"><span>{msg.text}</span></div>
                      )
                    ))}
                    {isTyping && (
                      <div className="chat-message bot-msg">
                        <div className="bot-avatar">AI</div>
                        <div className="bot-content"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
                      </div>
                    )}
                    {showSuggestions && (
                      <div className="chat-suggestions-inline">
                        {chatSuggestions.map((s, i) => (
                          <button key={i} className="chat-suggestion" onClick={() => handleSuggestionClick(s.question)}>
                            {s.emoji} {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="chat-input-area">
                    <div className="chat-input-wrapper">
                      <input type="text" className="chat-input" placeholder="Ask anything about HR..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleChatSend(); }} />
                      <button className="chat-send-btn" onClick={handleChatSend}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-info">
                <span className="feature-number">02</span>
                <h3>Conversational HR Assistant</h3>
                <p>An AI assistant that lives where your team works — Slack, Teams, or web. It answers policy questions, processes routine requests, and routes complex issues to the right people.</p>
                <ul className="feature-list">
                  {["Instant policy answers", "Self-service request processing", "Smart escalation routing", "Proactive employee nudges"].map((item, i) => (
                    <li key={i}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3: Compliance */}
            <div className="feature-row reveal">
              <div className="feature-visual">
                <div className="feature-mockup compliance-mockup">
                  <div className="mockup-header">
                    <div className="mockup-dots"><span></span><span></span><span></span></div>
                    <span>compliance-intel.ai</span>
                  </div>
                  <div className="mockup-body">
                    <div className="compliance-header-bar">
                      <h4>Compliance Dashboard</h4>
                      <span className="compliance-status">● All systems monitored</span>
                    </div>
                    <div className="compliance-items">
                      {[
                        { cls: "urgent", title: "Work Permit — Ahmad R.", detail: "Expires in 14 days", badge: "Action Required" },
                        { cls: "warning", title: "Safety Training — EU Team", detail: "3 of 12 incomplete", badge: "Reminder Sent" },
                        { cls: "ok", title: "Data Privacy Cert — All Staff", detail: "100% complete", badge: "Compliant" },
                      ].map((item, i) => (
                        <div key={i} className={`compliance-item ${item.cls}${activeComplianceItem === i ? " active" : ""}`} onClick={() => setActiveComplianceItem(i)}>
                          <div className="ci-left">
                            <span className="ci-indicator"></span>
                            <div>
                              <strong>{item.title}</strong>
                              <span className="ci-detail">{item.detail}</span>
                            </div>
                          </div>
                          <span className={`ci-badge ${item.cls}`}>{item.badge}</span>
                        </div>
                      ))}
                    </div>
                    <div className="compliance-prediction">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      <span><strong>Prediction:</strong> Based on Q2 hiring plans, you&apos;ll need 5 additional visa slots. Start applications by March 15.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-info">
                <span className="feature-number">03</span>
                <h3>Proactive Compliance Intelligence</h3>
                <p>Never miss a deadline again. The AI monitors every permit, certification, and requirement — and alerts you <em>before</em> things expire. It even predicts future needs.</p>
                <ul className="feature-list">
                  {["Automated expiration tracking", "Training compliance monitoring", "Predictive alerts & planning", "Audit-ready evidence trail"].map((item, i) => (
                    <li key={i}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PHASES ════════ */}
      <section className="section phases-section" id="phases" ref={phasesSectionRef}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag reveal">How It Works</span>
            <h2 className="section-title reveal">Three phases to<br /><span className="gradient-text">total transformation.</span></h2>
          </div>
          <div className="timeline">
            <div className="timeline-line" ref={timelineLineRef}></div>
            {[
              { phase: "Phase 1", title: "Document Intelligence", desc: "AI-powered contract generation that turns structured data into complete, legally accurate employment packages — adapted for 40+ jurisdictions.", tags: ["Contracts", "NDAs", "Equity Docs", "Localisation"] },
              { phase: "Phase 2", title: "Conversational AI", desc: "A context-aware HR assistant integrated into Slack & Teams that resolves queries in seconds, processes routine requests, and knows when to escalate.", tags: ["Chatbot", "Self-Service", "Smart Routing", "HRIS Integration"] },
              { phase: "Phase 3", title: "Compliance Intelligence", desc: "Proactive monitoring that tracks every deadline, predicts future needs, and keeps your organisation audit-ready — automatically.", tags: ["Monitoring", "Alerts", "Predictions", "Audit Trail"] },
            ].map((item, i) => (
              <div key={i} className="timeline-item reveal" data-delay={i * 150}>
                <div className="timeline-dot"><span>{i + 1}</span></div>
                <div className="timeline-content">
                  <div className="timeline-card" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                    <span className="phase-label">{item.phase}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="phase-tags">{item.tags.map((t, j) => <span key={j}>{t}</span>)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ WOW ════════ */}
      <section className="section wow-section" id="demo">
        <div className="container">
          <div className="section-header">
            <span className="section-tag reveal">Beyond Expectations</span>
            <h2 className="section-title reveal">What would <span className="gradient-text">blow your mind?</span></h2>
          </div>
          <div className="wow-grid">
            {[
              { emoji: "🔮", title: "Predictive Compliance", desc: '"Based on hiring plans, you\'ll need additional visa slots — start applications now."', large: true },
              { emoji: "🔍", title: "Policy Gap Detection", desc: "AI reads contracts across countries, identifies inconsistencies, recommends standardisation." },
              { emoji: "🤝", title: "Smart Negotiation", desc: "Candidate requests changes? AI pulls market data and generates counter-offer options." },
              { emoji: "✨", title: "Invisible Onboarding", desc: "Offer accepted → contracts, system access, onboarding all generated. Zero manual work." },
              { emoji: "💆", title: "Proactive Wellbeing", desc: "Bot notices you haven't taken leave in months and proactively reminds you of your balance." },
              { emoji: "🧠", title: "Cross-System Intelligence", desc: "Answers questions by pulling from multiple HR systems and synthesising a coherent, personalised response.", large: true },
            ].map((card, i) => (
              <div key={i} className={`wow-card${card.large ? " wow-large" : ""} reveal`} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                <div className="wow-card-glow"></div>
                <div className="wow-icon">{card.emoji}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ DASHBOARD PREVIEW ════════ */}
      <section className="section dashboard-section" id="dashboard">
        <div className="container">
          <div className="section-header">
            <span className="section-tag reveal">Experience</span>
            <h2 className="section-title reveal">One dashboard.<br /><span className="gradient-text">Everything HR.</span></h2>
            <p className="section-sub reveal">Inspired by the tools you already love — Gmail, Calendar, and more — unified into a single intelligent workspace.</p>
          </div>
          <div className="dashboard-preview reveal">
            <div className="dash-chrome">
              <div className="dash-dots">
                <span className="dot-red"></span><span className="dot-yellow"></span><span className="dot-green"></span>
              </div>
              <div className="dash-url">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="currentColor" strokeWidth="1.2" /><path d="M1 7h12" stroke="currentColor" strokeWidth="1.2" /><path d="M7 1c1.7 1.6 2.6 3.7 2.6 6S8.7 11.4 7 13c-1.7-1.6-2.6-3.7-2.6-6S5.3 2.6 7 1z" stroke="currentColor" strokeWidth="1.2" /></svg>
                <span>{dashUrl}</span>
              </div>
            </div>
            <div className="dash-body">
              <div className="dash-sidebar">
                {[
                  { page: "dashboard", icon: <><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></>, label: "Dashboard" },
                  { page: "calendar", icon: <><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M6 1v3M12 1v3M2 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, label: "Calendar" },
                  { page: "contracts", icon: <path d="M3 4h12M3 9h12M3 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />, label: "Contracts" },
                  { page: "people", icon: <><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, label: "People" },
                  { page: "compliance", icon: <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />, label: "Compliance" },
                ].map((nav) => (
                  <div key={nav.page} className={`dash-nav-item${dashPage === nav.page ? " active" : ""}`} onClick={() => switchDashPage(nav.page)}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">{nav.icon}</svg>
                    {nav.label}
                  </div>
                ))}
              </div>

              {/* Dashboard Page */}
              <div className={`dash-page${dashPage === "dashboard" ? " active" : ""}`}>
                <div className="dash-greeting">
                  <h3>Good afternoon, <span className="gradient-text">Team</span></h3>
                  <p>3 items need your attention today</p>
                </div>
                <div className="dash-cards">
                  {[
                    { tag: "Urgent", tagCls: "dc-tag-urgent", time: "2h ago", title: "Visa Renewal — Sarah Kim", desc: "Work visa expires in 14 days. Renewal checklist generated.", action: "Review →" },
                    { tag: "New Hire", tagCls: "dc-tag-new", time: "Today", title: "Contract Ready — Alex Chen", desc: "Employment contract auto-generated. Awaiting review and signature.", action: "Sign →" },
                    { tag: "Reminder", tagCls: "dc-tag-info", time: "Today", title: "Training Compliance", desc: "3 team members haven't completed mandatory security training.", action: "View →" },
                  ].map((card, i) => (
                    <div key={i} className={`dash-card${activeDashCard === i ? " active" : ""}`} onClick={() => setActiveDashCard(i)}>
                      <div className="dc-header"><span className={`dc-tag ${card.tagCls}`}>{card.tag}</span><span className="dc-time">{card.time}</span></div>
                      <h4>{card.title}</h4>
                      <p>{card.desc}</p>
                      <div className="dc-action">{card.action}</div>
                    </div>
                  ))}
                </div>
                <div className="dash-chart-area">
                  <h4>HR Operations — This Quarter</h4>
                  <div className="dash-chart">
                    {[{ h: "85%", label: "Jan" }, { h: "65%", label: "Feb" }, { h: "92%", label: "Mar" }, { h: "78%", label: "Apr" }, { h: "95%", label: "May" }, { h: "88%", label: "Jun" }].map((bar, i) => (
                      <div key={i} className={`chart-bar${activeChartBar === i ? " active" : ""}`} style={{ "--h": bar.h } as React.CSSProperties} onClick={() => setActiveChartBar(i)}><span>{bar.label}</span></div>
                    ))}
                  </div>
                  <p className="chart-label">Automated resolution rate (%)</p>
                </div>
              </div>

              {/* Calendar Page */}
              <div className={`dash-page${dashPage === "calendar" ? " active" : ""}`}>
                <div className="dash-greeting">
                  <h3>Calendar <span className="gradient-text">Overview</span></h3>
                  <p>February 2026</p>
                </div>
                <div className="calendar-grid">
                  <div className="cal-header"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div>
                  <div className="cal-row">{[26, 27, 28, 29, 30].map((d) => <div key={d} className="cal-day dim">{d}</div>)}</div>
                  <div className="cal-row">{[2, 3, 4, 5, 6].map((d) => <div key={d} className={`cal-day${selectedCalDay === d ? " selected" : ""}`} onClick={() => setSelectedCalDay(d)}>{d}</div>)}</div>
                  <div className="cal-row">
                    <div className="cal-day today">9</div>
                    <div className={`cal-day${selectedCalDay === 10 ? " selected" : ""}`} onClick={() => setSelectedCalDay(10)}>10</div>
                    <div className={`cal-day has-event${selectedCalDay === 11 ? " selected" : ""}`} onClick={() => setSelectedCalDay(11)}>11</div>
                    <div className={`cal-day${selectedCalDay === 12 ? " selected" : ""}`} onClick={() => setSelectedCalDay(12)}>12</div>
                    <div className={`cal-day has-event${selectedCalDay === 13 ? " selected" : ""}`} onClick={() => setSelectedCalDay(13)}>13</div>
                  </div>
                  <div className="cal-row">
                    {[16, 17, 18, 19, 20].map((d) => (
                      <div key={d} className={`cal-day${d === 17 ? " has-event" : ""}${selectedCalDay === d ? " selected" : ""}`} onClick={() => setSelectedCalDay(d)}>{d}</div>
                    ))}
                  </div>
                </div>
                <div className="cal-events">
                  <h4>Upcoming Events</h4>
                  {[
                    { color: "var(--accent)", title: "Onboarding — Priya S.", time: "Feb 11 · 10:00 AM" },
                    { color: "var(--warning)", title: "Safety Training Deadline", time: "Feb 13 · All Day" },
                    { color: "var(--danger)", title: "Visa Expiry — Sarah K.", time: "Feb 17 · Action Required" },
                    { color: "var(--success)", title: "Q1 Performance Reviews Open", time: "Feb 20 · All Managers" },
                  ].map((evt, i) => (
                    <div key={i} className={`cal-event-item${activeCalEvent === i ? " active" : ""}`} onClick={() => setActiveCalEvent(i)}>
                      <div className="cal-event-dot" style={{ background: evt.color }}></div>
                      <div><strong>{evt.title}</strong><span>{evt.time}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contracts Page */}
              <div className={`dash-page${dashPage === "contracts" ? " active" : ""}`}>
                <div className="dash-greeting">
                  <h3>Contract <span className="gradient-text">Management</span></h3>
                  <p>12 active contracts this month</p>
                </div>
                <div className="contracts-filters">
                  {["All", "Pending", "Signed", "Expired"].map((f) => (
                    <span key={f} className={`cf-btn${activeContractFilter === f ? " active" : ""}`} onClick={() => setActiveContractFilter(f)}>{f}</span>
                  ))}
                </div>
                <div className="contracts-table">
                  <div className="ct-header"><span>Employee</span><span>Type</span><span>Status</span><span>Date</span></div>
                  {[
                    { name: "Alex Chen", type: "Employment", status: "Pending Signature", statusCls: "ct-pending", date: "Feb 7, 2026" },
                    { name: "Maria Santos", type: "NDA", status: "Signed", statusCls: "ct-signed", date: "Feb 5, 2026" },
                    { name: "James O'Brien", type: "Equity Grant", status: "Signed", statusCls: "ct-signed", date: "Feb 3, 2026" },
                    { name: "Aisha Patel", type: "Amendment", status: "In Review", statusCls: "ct-pending", date: "Feb 1, 2026" },
                    { name: "Liam Nguyen", type: "Employment", status: "Expired", statusCls: "ct-expired", date: "Jan 28, 2026" },
                  ].map((row, i) => (
                    <div key={i} className={`ct-row${activeCtRow === i ? " active" : ""}`} onClick={() => setActiveCtRow(i)}>
                      <span className="ct-name">{row.name}</span>
                      <span>{row.type}</span>
                      <span className={`ct-status ${row.statusCls}`}>{row.status}</span>
                      <span>{row.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* People Page */}
              <div className={`dash-page${dashPage === "people" ? " active" : ""}`}>
                <div className="dash-greeting">
                  <h3>People <span className="gradient-text">Directory</span></h3>
                  <p>247 employees across 8 countries</p>
                </div>
                <div className="people-stats">
                  {[{ num: "247", label: "Total" }, { num: "12", label: "New this month" }, { num: "3", label: "Offboarding" }, { num: "8", label: "Countries" }].map((s, i) => (
                    <div key={i} className="ps-card"><span className="ps-num">{s.num}</span><span className="ps-label">{s.label}</span></div>
                  ))}
                </div>
                <div className="people-list">
                  {[
                    { initials: "AC", color: "#6366f1", name: "Alex Chen", info: "Senior Engineer · Kuala Lumpur", status: "New Hire", statusCls: "ps-new" },
                    { initials: "SK", color: "#ec4899", name: "Sarah Kim", info: "Product Designer · Singapore", status: "Active", statusCls: "ps-active" },
                    { initials: "MS", color: "#10b981", name: "Maria Santos", info: "HR Manager · Lisbon", status: "Active", statusCls: "ps-active" },
                    { initials: "JO", color: "#f59e0b", name: "James O'Brien", info: "Finance Lead · Dublin", status: "Active", statusCls: "ps-active" },
                    { initials: "AP", color: "#8b5cf6", name: "Aisha Patel", info: "Legal Counsel · London", status: "Active", statusCls: "ps-active" },
                  ].map((p, i) => (
                    <div key={i} className={`person-row${activePersonRow === i ? " active" : ""}`} onClick={() => setActivePersonRow(i)}>
                      <div className="person-avatar" style={{ background: p.color }}>{p.initials}</div>
                      <div className="person-info"><strong>{p.name}</strong><span>{p.info}</span></div>
                      <span className={`person-status ${p.statusCls}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Page */}
              <div className={`dash-page${dashPage === "compliance" ? " active" : ""}`}>
                <div className="dash-greeting">
                  <h3>Compliance <span className="gradient-text">Monitor</span></h3>
                  <p>Real-time compliance tracking across all regions</p>
                </div>
                <div className="comp-summary">
                  <div className="comp-stat comp-ok"><span className="comp-stat-num">94%</span><span>Overall Score</span></div>
                  <div className="comp-stat comp-warn"><span className="comp-stat-num">3</span><span>Pending Actions</span></div>
                  <div className="comp-stat comp-danger"><span className="comp-stat-num">1</span><span>Critical Alert</span></div>
                </div>
                <div className="comp-items">
                  {[
                    { cls: "urgent", title: "Work Permit — Ahmad R.", detail: "Expires in 14 days · Malaysia", badge: "Action Required" },
                    { cls: "warning", title: "Safety Training — EU Team", detail: "3 of 12 incomplete · Due Feb 20", badge: "Reminder Sent" },
                    { cls: "ok", title: "Data Privacy Cert — All Staff", detail: "100% complete · Valid until Dec 2026", badge: "Compliant" },
                    { cls: "ok", title: "Labour Law Updates — APAC", detail: "All contracts updated · Verified Jan 2026", badge: "Compliant" },
                  ].map((row, i) => (
                    <div key={i} className={`comp-row ${row.cls}${activeCompRow === i ? " active" : ""}`} onClick={() => setActiveCompRow(i)}>
                      <div className="comp-indicator"></div>
                      <div className="comp-detail"><strong>{row.title}</strong><span>{row.detail}</span></div>
                      <span className={`comp-badge ${row.cls}`}>{row.badge}</span>
                    </div>
                  ))}
                </div>
                <div className="comp-progress-section">
                  <h4>Training Completion by Region</h4>
                  <div className="comp-progress-bars">
                    {[{ label: "APAC", pct: "92%" }, { label: "EU", pct: "75%" }, { label: "Americas", pct: "88%" }].map((bar, i) => (
                      <div key={i} className="cpb-row"><span>{bar.label}</span><div className="cpb-track"><div className="cpb-fill" style={{ width: bar.pct }}></div></div><span>{bar.pct}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PRINCIPLES ════════ */}
      <section className="section principles-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag reveal">Our Principles</span>
            <h2 className="section-title reveal">Built on trust,<br /><span className="gradient-text">designed for humans.</span></h2>
          </div>
          <div className="principles-grid">
            {[
              { num: "01", title: "Human Oversight", desc: "AI generates and assists — humans approve legal documents and sensitive changes. Always." },
              { num: "02", title: "Legal Accuracy", desc: "Generated contracts match approved legal templates for each jurisdiction. No hallucinations." },
              { num: "03", title: "Privacy First", desc: "Employee data handled responsibly and securely. Role-based access. Full audit trails." },
              { num: "04", title: "Graceful Escalation", desc: "When the AI doesn't know, it says so — and routes to the right human expert seamlessly." },
            ].map((p, i) => (
              <div key={i} className="principle-card reveal" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                <div className="card-glow"></div>
                <div className="principle-number">{p.num}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="section cta-section" id="contact">
        <div className="cta-bg">
          <div className="gradient-orb orb-cta-1"></div>
          <div className="gradient-orb orb-cta-2"></div>
        </div>
        <div className="container">
          <div className="cta-content reveal">
            <h2>Ready to make HR<br /><span className="gradient-text">invisible?</span></h2>
            <p>Join the future of self-service HR operations. Less paperwork, more people work.</p>
            <div className="cta-actions">
              <a href="#contact" className="btn btn-primary btn-lg" onClick={(e) => e.preventDefault()} onMouseMove={handleMagneticMove} onMouseLeave={handleMagneticLeave}>
                <span>Request a Demo</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a href="#contact" className="btn btn-ghost btn-lg" onClick={(e) => e.preventDefault()}>Talk to Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#hero" className="nav-logo" onClick={(e) => handleAnchorClick(e, "#hero")}>deriv<span className="accent">HR</span></a>
              <p>AI-powered self-service HR operations platform. Making HR invisible since 2026.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Platform</h4>
                <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Document Generation</a>
                <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>HR Assistant</a>
                <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Compliance Intelligence</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#contact" onClick={(e) => e.preventDefault()}>About</a>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Careers</a>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Privacy</a>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Terms</a>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Security</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Deriv HR. All rights reserved.</span>
            <div className="footer-socials">
              <a href="#contact" aria-label="Twitter" onClick={(e) => e.preventDefault()}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
              <a href="#contact" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a>
              <a href="#contact" aria-label="GitHub" onClick={(e) => e.preventDefault()}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
