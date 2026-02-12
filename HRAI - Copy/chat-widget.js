/* ═══════════════════════════════════════════
   DERIV HR — Chat Widget (Global Overlay)
   Context-aware AI assistant
   ═══════════════════════════════════════════ */

(function () {

  // ── INJECT HTML ────────────────────────
  const chatHTML = `
    <button class="chat-fab" id="chat-fab">
      <svg class="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      <svg class="fab-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div class="chat-window" id="chat-window">
      <div class="chat-header">
        <div class="chat-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div class="chat-header-info">
          <strong>derivHR Assistant</strong>
          <span>Online</span>
        </div>
        <span class="chat-context-badge" id="chat-context-badge">General</span>
      </div>

      <div class="chat-messages" id="chat-messages">
        <div class="chat-msg bot">
          <div class="chat-msg-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
          <div class="chat-msg-bubble">Hi Ahmad! I'm your HR assistant. I can answer questions about <strong>leave policies</strong>, <strong>contracts</strong>, <strong>compliance</strong>, and more. How can I help?</div>
        </div>
        <div class="chat-suggestions" id="chat-suggestions">
          <button class="chat-suggestion" data-q="What is the notice period?">Notice period?</button>
          <button class="chat-suggestion" data-q="How many annual leave days do I get?">Annual leave?</button>
          <button class="chat-suggestion" data-q="What is the EPF contribution rate?">EPF rates?</button>
          <button class="chat-suggestion" data-q="Tell me about Sarah Kim's visa expiry">Visa expiry?</button>
        </div>
        <div class="chat-typing" id="chat-typing">
          <div class="chat-typing-dots"><span></span><span></span><span></span></div>
        </div>
      </div>

      <div class="chat-input-bar">
        <input type="text" id="chat-input" placeholder="Ask me anything about HR...">
        <button class="chat-send-btn" id="chat-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  // ── ELEMENTS ───────────────────────────
  const fab = document.getElementById('chat-fab');
  const win = document.getElementById('chat-window');
  const msgs = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const typing = document.getElementById('chat-typing');
  const contextBadge = document.getElementById('chat-context-badge');
  const suggestionsEl = document.getElementById('chat-suggestions');

  // ── DETECT PAGE CONTEXT ────────────────
  const path = window.location.pathname.toLowerCase();
  let pageContext = 'General';
  if (path.includes('dashboard')) pageContext = 'Dashboard';
  else if (path.includes('people')) pageContext = 'People';
  else if (path.includes('calendar')) pageContext = 'Calendar';
  else if (path.includes('contract')) pageContext = 'Contracts';
  else if (path.includes('compliance')) pageContext = 'Compliance';
  else if (path.includes('analytics')) pageContext = 'Analytics';
  else if (path.includes('settings')) pageContext = 'Settings';

  contextBadge.textContent = pageContext;

  // ── TOGGLE ─────────────────────────────
  fab.addEventListener('click', () => {
    fab.classList.toggle('open');
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
      setTimeout(() => input.focus(), 300);
    }
  });

  // ── SEND MESSAGE ───────────────────────
  function sendMessage(text) {
    if (!text.trim()) return;

    // Hide suggestions after first message
    if (suggestionsEl) suggestionsEl.style.display = 'none';

    // User bubble
    addMessage('user', text);
    input.value = '';

    // Show typing
    typing.classList.add('visible');
    msgs.scrollTop = msgs.scrollHeight;

    // Simulate AI response
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      typing.classList.remove('visible');
      const response = getResponse(text);
      addMessage('bot', response);
      msgs.scrollTop = msgs.scrollHeight;
    }, delay);
  }

  function addMessage(type, html) {
    const avatarContent = type === 'bot'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
      : 'AR';

    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${type}`;
    msgEl.innerHTML = `
      <div class="chat-msg-avatar">${avatarContent}</div>
      <div class="chat-msg-bubble">${html}</div>
    `;
    typing.parentNode.insertBefore(msgEl, typing);
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  // Suggestion clicks
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });

  // ── AI RESPONSE ENGINE ─────────────────
  // Context-aware responses using Firebase data with rule-based fallbacks
  function getResponse(query) {
    const q = query.toLowerCase();
    const db = window.DB || {};
    const employees = db.employees || {};
    const compliance = db.compliance || {};
    const alerts = db.alerts || [];
    const chat = db.chatAssistant || {};
    const faqs = (chat.knowledgeBase && chat.knowledgeBase.faqs) || [];

    // Try FAQ match first
    const faqMatch = faqs.find(f => {
      const fq = f.question.toLowerCase();
      const words = fq.split(/\s+/).filter(w => w.length > 3);
      return words.filter(w => q.includes(w)).length >= 2;
    });
    if (faqMatch && !q.includes('visa') && !q.includes('sarah') && !q.includes('alex') && !q.includes('training')) {
      return faqMatch.answer;
    }

    // Notice period
    if (q.includes('notice period') || q.includes('notice')) {
      if (pageContext === 'Contracts') {
        return `Based on the contract you're viewing, the notice period depends on length of service:<br><br>
        <strong>• &lt; 2 years:</strong> 1 month<br>
        <strong>• 2–5 years:</strong> 2 months<br>
        <strong>• &gt; 5 years:</strong> 3 months<br><br>
        During probation, notice is <strong>1 week</strong>. This follows the <strong>Malaysian Employment Act 1955</strong>.`;
      }
      return `Under Deriv's policy (Malaysian Employment Act 1955):<br><br>
      <strong>• &lt; 2 years service:</strong> 1 month notice<br>
      <strong>• 2–5 years:</strong> 2 months<br>
      <strong>• &gt; 5 years:</strong> 3 months<br>
      <strong>• During probation:</strong> 1 week<br><br>
      Note: UK and Germany have different statutory requirements.`;
    }

    // Annual leave
    if (q.includes('annual leave') || q.includes('leave days') || q.includes('holiday')) {
      return `Deriv grants <strong>18 days</strong> annual leave per year (pro-rated for new joiners). Key details:<br><br>
      <strong>• Carry forward:</strong> Max 5 days to next year<br>
      <strong>• Sick leave:</strong> 14 days paid<br>
      <strong>• Hospitalization:</strong> 60 days<br>
      <strong>• Compassionate:</strong> 3 days<br>
      <strong>• Marriage:</strong> 3 days (one-time)<br><br>
      Public holidays follow local jurisdiction (Malaysia: 11 gazetted days).`;
    }

    // EPF / pension
    if (q.includes('epf') || q.includes('pension') || q.includes('provident fund') || q.includes('contribution')) {
      return `For Malaysian employees:<br><br>
      <strong>• EPF Employee:</strong> 11% of monthly wages<br>
      <strong>• EPF Employer:</strong> 12% of monthly wages<br>
      <strong>• SOCSO:</strong> Employment Injury + Invalidity Scheme<br><br>
      For UK staff, <strong>National Insurance</strong> applies instead. Singapore uses <strong>CPF</strong> (Employee 20%, Employer 17%).`;
    }

    // Visa / Sarah Kim — pull from Firebase
    if (q.includes('visa') || q.includes('sarah') || q.includes('work permit')) {
      const sarah = employees['emp-002'];
      const vt = compliance.visaTimeline;
      const expiry = sarah && sarah.workPermit ? sarah.workPermit.expiryDate : '2026-02-23';
      const daysLeft = Math.max(0, Math.ceil((new Date(expiry) - new Date()) / 86400000));
      const permitType = sarah && sarah.workPermit ? sarah.workPermit.type : 'Employment Pass';

      return `⚠️ <strong>Urgent Alert:</strong> ${sarah ? sarah.name : 'Sarah Kim'}'s ${permitType} (Singapore) expires on <strong>${expiry}</strong> — that's <strong>${daysLeft} days away</strong>.<br><br>
      <strong>Recommended action:</strong><br>
      1. Initiate renewal application immediately<br>
      2. Prepare supporting documents (employment letter, financial records)<br>
      3. Budget processing time: ~10 business days<br><br>
      <a href="compliance.html?alert=visa-sarah" style="color:var(--accent);text-decoration:underline">→ View in Compliance Dashboard</a>`;
    }

    // Contract — pull from Firebase
    if (q.includes('contract') && (q.includes('alex') || q.includes('error') || q.includes('clause'))) {
      const alex = employees['emp-001'];
      return `📄 <strong>Contract Issue — ${alex ? alex.name : 'Alex Chen'}:</strong><br><br>
      The employment agreement references <strong>outdated EPF contribution rates</strong> (pre-2026 schedule). The correct rate is <strong>Employee 11%, Employer 12%</strong>.<br><br>
      <strong>Action needed:</strong> Update clause §6 before signing deadline (Feb 15).<br><br>
      <a href="contract-generator.html" style="color:var(--accent);text-decoration:underline">→ Regenerate contract with correct clauses</a>`;
    }

    // Training — pull from Firebase
    if (q.includes('training') || q.includes('safety') || q.includes('eu team')) {
      const tracker = compliance.trainingTracker;
      let overdueNames = 'Tom Weber, and others';
      if (tracker && tracker[0]) {
        overdueNames = tracker[0].overdueEmployees ? tracker[0].overdueEmployees.join(', ') : overdueNames;
      }
      return `⚠️ <strong>Safety Training — EU Team:</strong><br><br>
      <strong>3 of 12</strong> EU employees haven't completed mandatory workplace safety training. Deadline: <strong>Feb 20, 2026</strong>.<br><br>
      Pending employees:<br>
      ${overdueNames.split(', ').map(n => '• ' + n).join('<br>')}<br><br>
      <a href="compliance.html?alert=training-eu" style="color:var(--accent);text-decoration:underline">→ Send reminder via Compliance page</a>`;
    }

    // Overtime
    if (q.includes('overtime') || q.includes('ot')) {
      return `Overtime applies to <strong>non-exempt employees only</strong>:<br><br>
      <strong>• Weekdays:</strong> 1.5× hourly rate<br>
      <strong>• Rest days:</strong> 2× hourly rate<br>
      <strong>• Public holidays:</strong> 3× hourly rate<br><br>
      This follows the Malaysian Employment Act 1955, Part IV.`;
    }

    // Remote work
    if (q.includes('remote') || q.includes('work from home') || q.includes('wfh') || q.includes('hybrid')) {
      return `Deriv's remote work policy:<br><br>
      <strong>• Hybrid:</strong> 2 days/week WFH for eligible roles<br>
      <strong>• Full remote:</strong> Requires VP-level approval<br>
      <strong>• Equipment:</strong> Company provides laptop & peripherals<br><br>
      Check with your department head for role eligibility.`;
    }

    // Probation
    if (q.includes('probation')) {
      return `Probation period at Deriv:<br><br>
      <strong>• Duration:</strong> 3 months for all new hires<br>
      <strong>• Notice during probation:</strong> 1 week<br>
      <strong>• Extension:</strong> Can be extended by 1–3 months if needed<br>
      <strong>• Benefits:</strong> Full benefits from Day 1 except equity vesting`;
    }

    // Maternity / paternity
    if (q.includes('maternity') || q.includes('paternity') || q.includes('parental')) {
      return `Parental leave by jurisdiction:<br><br>
      <strong>🇲🇾 Malaysia:</strong> Maternity 98 days, Paternity 7 days<br>
      <strong>🇬🇧 UK:</strong> Maternity 52 weeks, Paternity 2 weeks<br>
      <strong>🇸🇬 Singapore:</strong> Maternity 16 weeks (govt-paid), Paternity 2 weeks<br><br>
      All fully paid per local statutory requirements.`;
    }

    // Compliance score — pull from Firebase
    if (q.includes('compliance') && (q.includes('score') || q.includes('status'))) {
      const score = compliance.overallScore || 94;
      const breakdown = compliance.scoreBreakdown || {};
      let breakdownHtml = '';
      for (const key in breakdown) {
        const item = breakdown[key];
        breakdownHtml += `• ${item.label}: <strong>${item.score}%</strong> (${item.issues} issues)<br>`;
      }
      return `Current compliance status:<br><br>
      <strong>Overall Score: ${score}%</strong><br><br>
      ${breakdownHtml}<br>
      Visa quota remaining: <strong>${compliance.visaQuota ? compliance.visaQuota.availableQuota : 2}</strong> slots`;
    }

    // Headcount — pull from Firebase
    if (q.includes('headcount') || q.includes('how many employees') || q.includes('team size')) {
      const company = db.company || {};
      const depts = company.departments || [];
      let deptHtml = depts.map(d => `• ${d.name}: ${d.headcount}`).join('<br>');
      return `Current headcount: <strong>${company.totalEmployees || 247} employees</strong><br><br>
      ${deptHtml}<br><br>
      <strong>+${company.newThisMonth || 10}</strong> new this month. Attrition rate: <strong>${company.attritionRate || 4.2}%</strong>.`;
    }

    // Visa quota
    if (q.includes('quota') || q.includes('hiring')) {
      const vq = compliance.visaQuota || {};
      return `Visa quota status:<br><br>
      <strong>• Total quota:</strong> ${vq.currentQuota || 12}<br>
      <strong>• Used:</strong> ${vq.usedQuota || 10}<br>
      <strong>• Available:</strong> ${vq.availableQuota || 2}<br>
      <strong>• Q3 hiring target:</strong> ${vq.q3HiringTarget || 8}<br>
      <strong>• Predicted shortfall:</strong> ${vq.predictedShortfall || 6} slots<br><br>
      ⚠️ ${vq.recommendation || 'Apply for more visa slots to meet hiring targets.'}`;
    }

    // Default / fallback — use page-specific suggestions from Firebase
    const pageKey = pageContext.toLowerCase().replace(/\s+/g, '');
    const pageSuggestions = (chat.pageContext && chat.pageContext[pageKey] && chat.pageContext[pageKey].suggestedQuestions) || [];
    const suggestHtml = pageSuggestions.length
      ? pageSuggestions.map(s => `• ${s}`).join('<br>')
      : '• Leave policies & entitlements<br>• Notice periods & termination<br>• EPF/pension contributions<br>• Active compliance alerts<br>• Specific employee cases';

    return `I understand you're asking about "<strong>${query}</strong>". Based on Deriv's HR policies and the ${pageContext} context, I'd recommend checking with the relevant department head or reviewing the employee handbook.<br><br>
    You can also try asking me about:<br>
    ${suggestHtml}`;
  }

})();
