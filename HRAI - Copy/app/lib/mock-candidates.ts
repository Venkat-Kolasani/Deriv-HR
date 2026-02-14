/**
 * Mock candidate profiles with realistic interview feedback for demo purposes.
 */

export interface CandidateProfile {
    id: string;
    name: string;
    role: string;
    department: string;
    experience: number;
    location: string;
    status: string;
    skills: string[];
    resumeReview: string;
    telephonicInterview: string;
    culturalFit: string;
    referenceCheck: string;
    previousSalary?: number;
    expectedSalaryRange?: { min: number; max: number };
}

export const MOCK_CANDIDATES: CandidateProfile[] = [
    {
        id: "cand-001",
        name: "Sarah Chen",
        role: "Senior Software Engineer",
        department: "Engineering",
        experience: 7,
        location: "Malaysia",
        status: "Interview Complete",
        skills: ["Python", "React", "System Design", "AWS", "Team Leadership"],
        previousSalary: 95000,
        expectedSalaryRange: { min: 115000, max: 130000 },
        resumeReview: `Sarah holds a BSc in Computer Science from University of Malaya (First Class Honours) and has 7 years of progressive experience. Currently a Tech Lead at a fintech startup where she led a team of 6 engineers to build a real-time trading platform handling 50K transactions/sec. Her resume highlights strong proficiency in Python, React, TypeScript, and AWS. She contributed to 3 open-source projects and has published a paper on distributed systems at ICSOC 2024. Her resume is well-structured and projects demonstrate increasing scope of responsibility. One concern: she's had 3 roles in 5 years which may indicate a pattern, though each move was to a higher position.`,
        telephonicInterview: `Sarah was articulate and enthusiastic during the 45-minute phone screen. She clearly explained her current architecture decisions and trade-offs. When asked about the trading platform, she described the event-driven architecture using Kafka and Redis with impressive detail. She asked thoughtful questions about our tech stack and team culture. Communication was excellent — she structured her answers well and was concise. She mentioned she's specifically interested in Deriv because of our focus on financial technology. Salary expectation: USD 115,000-130,000. Available to start in 4 weeks. Energy level was high throughout. Minor note: she seemed slightly hesitant when discussing conflict resolution scenarios.`,
        culturalFit: `Panel of 3 interviewers (Engineering Manager, Product Lead, HR). Sarah demonstrated strong alignment with our values. She spoke passionately about mentoring junior developers at her current role and shared specific examples of pair programming sessions she organized. When presented with the "disagree and commit" scenario, she gave a nuanced answer about balancing conviction with team cohesion. She values transparency and continuous learning. The team felt she would integrate well. She asked about our D&I initiatives and remote work policies, showing genuine interest in the company culture. One interviewer noted she might be overqualified for some aspects of the role but her enthusiasm was genuine. Overall impression: collaborative, growth-minded, strong communicator.`,
        referenceCheck: `Reference 1 (Former CTO at FinanceHub): "Sarah is one of the strongest engineers I've worked with. She took ownership of our payment processing system and reduced latency by 40%. She's a natural leader who earns respect through competence, not authority. I'd rehire her in a heartbeat."

Reference 2 (Team Lead at DataFlow Inc): "Sarah mentored two junior developers who are now mid-level engineers. She's excellent at breaking down complex problems. She can be quite direct in code reviews, which some found challenging initially, but her feedback is always constructive. She left on excellent terms — we were sad to see her go."

Reference 3 (University Professor): "Outstanding student who consistently demonstrated analytical thinking. Her capstone project on distributed consensus algorithms was one of the best I've supervised in 15 years."`,
    },
    {
        id: "cand-002",
        name: "Marcus Thompson",
        role: "Marketing Manager",
        department: "Marketing",
        experience: 6,
        location: "United Kingdom",
        status: "Interview Complete",
        skills: ["Brand Strategy", "Content Marketing", "Google Analytics", "HubSpot", "Stakeholder Management"],
        previousSalary: 78000,
        expectedSalaryRange: { min: 85000, max: 100000 },
        resumeReview: `Marcus has an MBA from London Business School and 6 years in marketing and brand management. Currently a Marketing Manager at a consumer goods company managing campaigns with £1.5M annual budget. His resume shows strong experience in content strategy, social media marketing, and brand positioning. He has zero software engineering experience — no programming languages listed, no CS coursework, no technical projects. His technical skills are limited to marketing tools: HubSpot, Google Analytics, Canva, and basic Excel. Resume is well-written and polished but entirely irrelevant for a software engineering role. He listed "interest in technology" under hobbies but has no demonstrable technical competency.`,
        telephonicInterview: `Marcus was pleasant and articulate during the call. However, when asked basic software engineering questions, he could not answer any. He did not know what an API is, could not explain the difference between frontend and backend, and was unfamiliar with any programming language. When asked why he applied for a Senior Software Engineer role, he said he "wants to transition into tech" but has not taken any concrete steps — no bootcamp, no self-study, no side projects. He asked if the role involved "managing engineers" which suggests he may have misunderstood the position. Communication skills are excellent but entirely non-technical. Salary expectation: USD 85,000-100,000. Available in 2 weeks.`,
        culturalFit: `Panel found Marcus likeable and personable. He has strong interpersonal skills and would be a good cultural fit for a non-technical role. However, the engineering panel members felt the interview was largely a waste of time — he could not participate in any whiteboard exercise, could not discuss technical architecture, and had no understanding of software development lifecycle. When asked about pair programming, he thought it meant "working in pairs on presentations." Cultural fit score: 4/10 for engineering role (8/10 for a marketing role). The panel unanimously recommended redirecting him to the Marketing department.`,
        referenceCheck: `Reference 1 (CMO at ConsumerBrands Ltd): "Marcus is an outstanding marketing professional. His campaigns consistently exceed ROI targets. He's creative, data-driven in the marketing sense, and a strong team leader. However, I would not recommend him for a technical engineering role — his strengths are firmly in marketing and brand strategy."

Reference 2 (Former Manager at BrandAgency): "Marcus is one of the best marketing managers I've hired. He's excellent at client relationships and creative direction. He has mentioned wanting to move into tech but hasn't shown any progress toward that goal. He would thrive in a marketing leadership position."

Both references explicitly cautioned against placing Marcus in a software engineering role.`,
    },
    {
        id: "cand-003",
        name: "Aisha Rahman",
        role: "Data Scientist",
        department: "Engineering",
        experience: 4,
        location: "Singapore",
        status: "Interview Complete",
        skills: ["Machine Learning", "Python", "TensorFlow", "Statistical Modeling", "NLP"],
        previousSalary: 88000,
        expectedSalaryRange: { min: 105000, max: 120000 },
        resumeReview: `Aisha has a Master's in Data Science from NUS (Dean's List) and 4 years of experience. Currently at a hedge fund building ML models for risk assessment. Her resume highlights a fraud detection model that saved $3.2M and an NLP pipeline for sentiment analysis processing 100K tweets/day. She's published 2 papers in NeurIPS workshops (impressive for her experience level). Strong in Python, TensorFlow, PyTorch, SQL. Her GitHub shows active contributions and clean code practices. She also completed the Google Cloud ML Engineer certification. Slightly concerned about pure data science focus — the role requires some production engineering, and her resume is heavy on research/modeling vs. deployment experience.`,
        telephonicInterview: `Aisha was impressive technically but somewhat quiet in delivery. She explained complex ML concepts clearly when prompted but didn't elaborate voluntarily — interviewer had to ask follow-up questions to draw out details. When discussing her fraud detection model, her technical depth was exceptional. She understood precision-recall trade-offs deeply and could explain business impact. She expressed strong interest in applying ML to financial technology. Salary expectation: USD 105,000-120,000. Notice period: 2 months at current employer. One notable moment: she got genuinely excited discussing our potential use cases for AI in trading, showing authentic passion for the domain. Communication style is more introverted but very precise.`,
        culturalFit: `Panel found Aisha technically brilliant but had mixed signals on cultural fit. She was thoughtful and gave considered answers but took long pauses before responding, which some interpreted as hesitation. When asked about teamwork, she described successful collaborations but her examples focused more on independent contributions to team goals rather than deeply collaborative work. One interviewer noted she lit up discussing technical challenges but was more reserved during casual conversation. She asked insightful questions about the ML infrastructure and research culture. Panel scored cultural fit: 6.5/10 with a note that she may simply need a warm-up period and would thrive in a supportive team. Her values align well with the company mission.`,
        referenceCheck: `Reference 1 (Head of Data Science at HedgeTech): "Aisha is the most talented junior data scientist I've managed. Her models are production-quality from day one. She's quiet in large meetings but is incredibly effective in small groups and 1-on-1. She needs autonomy to do her best work — micromanagement would be a mistake. She's absolutely worth the investment."

Reference 2 (PhD Supervisor at NUS): "Exceptional research talent. Her thesis work on adversarial robustness in financial ML was publishable quality. She's self-driven and sets high standards. She can be a perfectionist which sometimes slows initial delivery, but final output is always excellent."

No red flags from either reference. Strong technical endorsement with note about communication style.`,
    },
    {
        id: "cand-004",
        name: "Raj Patel",
        role: "Senior Software Engineer",
        department: "Engineering",
        experience: 8,
        location: "Malaysia",
        status: "Interview Complete",
        skills: ["Java", "Kubernetes", "Microservices", "PostgreSQL", "Kafka", "System Design"],
        previousSalary: 110000,
        expectedSalaryRange: { min: 125000, max: 145000 },
        resumeReview: `Raj has a BTech in Computer Science from IIT Bombay and 8 years of backend engineering experience. Currently a Senior Engineer at a major payment gateway where he architected a microservices platform processing 2M transactions/day. His resume is deeply technical: Java, Kubernetes, PostgreSQL, Kafka, Redis, gRPC, and Terraform are all listed with production experience. He has 3 AWS certifications (Solutions Architect, Developer, DevOps). He contributed to Apache Kafka's open-source project (2 merged PRs). He led a migration from monolith to microservices that reduced deployment time from 2 hours to 15 minutes. Resume is excellent — well-structured, quantitative, and directly relevant. Only gap: limited frontend experience (basic React only).`,
        telephonicInterview: `Raj was confident, articulate, and deeply technical. He walked through his payment platform architecture in impressive detail — event sourcing, CQRS patterns, circuit breakers, and exactly how they achieved 99.99% uptime. He explained his approach to performance optimization (reducing payment latency from 800ms to 120ms through query optimization and caching). He was enthusiastic about Deriv's trading platform challenges and drew parallels to his payment processing experience. He asked sharp questions about our deployment pipeline, on-call culture, and technical debt strategy. Salary expectation: USD 125,000-145,000. Available in 6 weeks (current project handover). Communication was clear and structured. He spoke about mentoring junior engineers with genuine passion.`,
        culturalFit: `Panel was very impressed. Raj demonstrated strong collaborative values — he described establishing code review standards at his current company and running weekly architecture discussions. When presented with the conflict scenario, he shared a real example of disagreeing with his CTO about a technology choice, how he presented data-driven arguments, and ultimately accepted the team decision while documenting his concerns. The panel appreciated his maturity. He asked about team structure, growth paths, and how Deriv handles technical decisions. Cultural fit score: 8.5/10. One interviewer noted he can be a perfectionist about code quality, which might slow initial delivery but ensures long-term maintainability. Overall: excellent engineering culture fit.`,
        referenceCheck: `Reference 1 (Engineering Director at PaymentFlow): "Raj is one of the most capable backend engineers I've managed in 20 years. His microservices architecture is now the template for all new projects. He's a force multiplier — the junior engineers he mentored are now mid-seniors. He has extremely high standards which occasionally creates friction with 'move fast' cultures, but his output quality is exceptional. I tried everything to retain him."

Reference 2 (Tech Lead at previous company): "Raj transformed our deployment pipeline. He's the person you want architecting your most critical systems. He's thoughtful, methodical, and production-obsessed. He speaks at conferences (KubeCon, Kafka Summit) which shows his community engagement. Only note: he can sometimes over-engineer solutions for smaller problems."

Both references gave unqualified strong recommendations for a senior engineering role.`,
    },
    {
        id: "cand-005",
        name: "Priya Menon",
        role: "HR Recruiter",
        department: "Human Resources",
        experience: 5,
        location: "Malaysia",
        status: "Interview Complete",
        skills: ["Talent Acquisition", "Employee Relations", "HRIS Systems", "Employer Branding", "Onboarding"],
        previousSalary: 52000,
        expectedSalaryRange: { min: 60000, max: 75000 },
        resumeReview: `Priya has a BA in Human Resource Management from University of Malaya and 5 years of HR experience. Currently a Senior Recruiter at a tech company where she manages end-to-end recruitment for engineering teams — she has successfully filled 40+ engineering positions. Her resume is focused entirely on HR functions: talent acquisition, employer branding, onboarding program design, and HRIS management. She lists "basic Excel," "PowerPoint," and "BambooHR" as her technical skills. There is zero software engineering content on her resume — no programming languages, no technical projects, no CS education. She mentions "passion for tech industry" but this refers to recruiting FOR tech companies, not doing technical work herself. Resume is professional but completely irrelevant for an engineering role.`,
        telephonicInterview: `Priya was friendly and professional on the call. However, the conversation quickly revealed a fundamental mismatch. She could not define basic programming concepts — when asked about her experience with any programming language, she said "I've been meaning to learn Python." She has no understanding of software architecture, databases, or web development. When asked technical screening questions she uses to evaluate engineering candidates, she admitted she relies on hiring managers and technical panels for those assessments. She was honest about the mismatch and said she applied because "I want to transition into tech from HR." Salary expectation: USD 60,000-75,000. Available immediately. She mentioned enrolling in a beginner Python course on Coursera.`,
        culturalFit: `Panel struggled with this interview. Priya is clearly an excellent HR professional — warm, organized, great at reading people. However, in an engineering context, she could not participate meaningfully. She could not join the whiteboard design exercise, could not discuss system trade-offs, and had no opinion on code review practices beyond "they seem important." The panel's engineering members scored her 3/10 for engineering cultural fit but informally noted she'd be excellent in an HR role. When asked how she'd contribute to the engineering team, she described organizing team events and improving documentation — valuable but not engineering work. One panelist suggested she'd be perfect for our open Talent Acquisition Lead role. Cultural fit score: 3/10 for engineering, estimated 8/10 for HR.`,
        referenceCheck: `Reference 1 (HR Director at TechRecruit Co): "Priya is an exceptional recruiter. She has an instinct for matching candidates to roles and her offer acceptance rate is 92%. She's organized, empathetic, and candidates love working with her. She's mentioned wanting to move into a technical role, but I believe her strengths are firmly in people operations. She would be an outstanding HR leader."

Reference 2 (Hiring Manager she supported): "Priya filled 12 critical engineering positions for my team last year, all within timeline. She's excellent at understanding what engineers need even though she's not one herself. She screens for soft skills brilliantly. I'd recommend her for any HR or talent acquisition leadership role without hesitation."

Both references explicitly noted she is not an engineer and should not be placed in an engineering role, while strongly endorsing her for HR positions.`,
    },
];

/** Salary benchmark data for compensation module */
export const SALARY_BENCHMARKS: Record<string, Record<string, { p25: number; p50: number; p75: number; p90: number }>> = {
    "Senior Software Engineer": {
        Malaysia: { p25: 85000, p50: 100000, p75: 118000, p90: 140000 },
        "United Kingdom": { p25: 95000, p50: 115000, p75: 135000, p90: 160000 },
        Singapore: { p25: 90000, p50: 110000, p75: 130000, p90: 155000 },
        Germany: { p25: 88000, p50: 105000, p75: 125000, p90: 148000 },
    },
    "Product Manager": {
        Malaysia: { p25: 70000, p50: 85000, p75: 100000, p90: 120000 },
        "United Kingdom": { p25: 80000, p50: 95000, p75: 115000, p90: 135000 },
        Singapore: { p25: 75000, p50: 90000, p75: 108000, p90: 128000 },
        Germany: { p25: 72000, p50: 88000, p75: 105000, p90: 125000 },
    },
    "Data Scientist": {
        Malaysia: { p25: 78000, p50: 95000, p75: 112000, p90: 132000 },
        "United Kingdom": { p25: 88000, p50: 105000, p75: 125000, p90: 148000 },
        Singapore: { p25: 85000, p50: 102000, p75: 120000, p90: 142000 },
        Germany: { p25: 82000, p50: 98000, p75: 118000, p90: 138000 },
    },
    "DevOps Engineer": {
        Malaysia: { p25: 75000, p50: 90000, p75: 108000, p90: 128000 },
        "United Kingdom": { p25: 85000, p50: 100000, p75: 120000, p90: 142000 },
        Singapore: { p25: 80000, p50: 96000, p75: 115000, p90: 135000 },
        Germany: { p25: 78000, p50: 94000, p75: 112000, p90: 132000 },
    },
    "UX Designer": {
        Malaysia: { p25: 60000, p50: 75000, p75: 90000, p90: 108000 },
        "United Kingdom": { p25: 70000, p50: 85000, p75: 102000, p90: 120000 },
        Singapore: { p25: 65000, p50: 80000, p75: 96000, p90: 115000 },
        Germany: { p25: 62000, p50: 78000, p75: 94000, p90: 112000 },
    },
    "Engineering Manager": {
        Malaysia: { p25: 100000, p50: 120000, p75: 145000, p90: 170000 },
        "United Kingdom": { p25: 115000, p50: 138000, p75: 165000, p90: 195000 },
        Singapore: { p25: 108000, p50: 130000, p75: 155000, p90: 185000 },
        Germany: { p25: 105000, p50: 125000, p75: 150000, p90: 178000 },
    },
    "Marketing Manager": {
        Malaysia: { p25: 55000, p50: 68000, p75: 82000, p90: 98000 },
        "United Kingdom": { p25: 65000, p50: 78000, p75: 95000, p90: 112000 },
        Singapore: { p25: 60000, p50: 73000, p75: 88000, p90: 105000 },
        Germany: { p25: 58000, p50: 70000, p75: 85000, p90: 100000 },
    },
    "HR Recruiter": {
        Malaysia: { p25: 40000, p50: 52000, p75: 65000, p90: 78000 },
        "United Kingdom": { p25: 48000, p50: 60000, p75: 75000, p90: 90000 },
        Singapore: { p25: 45000, p50: 58000, p75: 70000, p90: 85000 },
        Germany: { p25: 42000, p50: 55000, p75: 68000, p90: 82000 },
    },
};

/** In-house salary ranges for current employees in similar positions */
export const INHOUSE_SALARY_RANGES: Record<string, Record<string, { min: number; median: number; max: number; sampleSize: number }>> = {
    "Senior Software Engineer": {
        Malaysia: { min: 82000, median: 98000, max: 135000, sampleSize: 12 },
        "United Kingdom": { min: 92000, median: 112000, max: 155000, sampleSize: 8 },
        Singapore: { min: 88000, median: 108000, max: 150000, sampleSize: 10 },
        Germany: { min: 85000, median: 102000, max: 145000, sampleSize: 7 },
    },
    "Product Manager": {
        Malaysia: { min: 68000, median: 83000, max: 115000, sampleSize: 6 },
        "United Kingdom": { min: 78000, median: 93000, max: 130000, sampleSize: 5 },
        Singapore: { min: 73000, median: 88000, max: 125000, sampleSize: 4 },
        Germany: { min: 70000, median: 86000, max: 120000, sampleSize: 5 },
    },
    "Data Scientist": {
        Malaysia: { min: 75000, median: 92000, max: 128000, sampleSize: 9 },
        "United Kingdom": { min: 85000, median: 103000, max: 145000, sampleSize: 6 },
        Singapore: { min: 82000, median: 100000, max: 138000, sampleSize: 7 },
        Germany: { min: 80000, median: 96000, max: 135000, sampleSize: 5 },
    },
    "DevOps Engineer": {
        Malaysia: { min: 72000, median: 88000, max: 125000, sampleSize: 8 },
        "United Kingdom": { min: 82000, median: 98000, max: 138000, sampleSize: 6 },
        Singapore: { min: 78000, median: 94000, max: 132000, sampleSize: 7 },
        Germany: { min: 75000, median: 90000, max: 128000, sampleSize: 5 },
    },
    "Frontend Developer": {
        Malaysia: { min: 65000, median: 80000, max: 110000, sampleSize: 15 },
        "United Kingdom": { min: 75000, median: 90000, max: 125000, sampleSize: 10 },
        Singapore: { min: 70000, median: 85000, max: 118000, sampleSize: 12 },
        Germany: { min: 68000, median: 82000, max: 115000, sampleSize: 9 },
    },
    "UX Designer": {
        Malaysia: { min: 58000, median: 72000, max: 98000, sampleSize: 5 },
        "United Kingdom": { min: 68000, median: 82000, max: 112000, sampleSize: 4 },
        Singapore: { min: 63000, median: 77000, max: 105000, sampleSize: 4 },
        Germany: { min: 60000, median: 75000, max: 102000, sampleSize: 3 },
    },
};

/** Company policies for contract generation */
export const COMPANY_POLICIES = {
    name: "Deriv Group",
    probationPeriod: "3 months",
    noticePeriod: {
        duringProbation: "1 week",
        lessThan2Years: "1 month",
        twoToFiveYears: "2 months",
        moreThan5Years: "3 months",
    },
    benefits: {
        annualLeave: 18,
        sickLeave: 14,
        hospitalizationLeave: 60,
        remoteWorkDays: 2,
        medicalInsurance: "Full coverage for employee + dependents",
        dentalOptical: "Annual allocation of USD 500",
        learningBudget: "USD 2,000/year for courses and conferences",
    },
    equity: {
        vestingSchedule: "4-year vesting with 1-year cliff",
        standardGrant: "Based on role level and performance",
    },
};
