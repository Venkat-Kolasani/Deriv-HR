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
        role: "Product Manager",
        department: "Product",
        experience: 5,
        location: "United Kingdom",
        status: "Interview Complete",
        skills: ["Product Strategy", "Agile", "Data Analysis", "Stakeholder Management", "User Research"],
        previousSalary: 82000,
        expectedSalaryRange: { min: 95000, max: 110000 },
        resumeReview: `Marcus has an MBA from London Business School and 5 years of product management experience. Currently a Product Manager at a SaaS company managing a portfolio with £2M ARR. His resume shows a transition from business analyst to product management, which demonstrates versatility. He's launched 4 major features with positive metrics (30% increase in user engagement, 25% reduction in churn). He lists certifications in Scrum and Data Analytics. Resume is clean but could be more quantitative in some areas. His LinkedIn shows active thought leadership with articles on product-led growth. Gap: limited experience in financial services/fintech domain specifically.`,
        telephonicInterview: `Marcus was personable and well-prepared for the call. He had clearly researched Deriv and our product suite. He spoke about his approach to product discovery using dual-track agile and shared how he balances customer requests with strategic priorities. He was honest about his learning curve in fintech but framed it as motivation. He demonstrated strong analytical thinking when discussing A/B testing frameworks. Communication was very clear and structured — used the STAR method naturally. One concern: when pressed on technical depth, he was less confident discussing API architectures, though he acknowledged this and said he relies on strong engineering partnerships. Salary expectation: USD 95,000-110,000. Available immediately.`,
        culturalFit: `Panel interview went well. Marcus has a warm, engaging personality. He shared stories about cross-functional collaboration and managing stakeholder conflicts. When asked about failure, he openly discussed a product launch that missed targets and what he learned. The team appreciated his honesty. He seems genuinely collaborative rather than ego-driven. However, one interviewer felt his answers were sometimes too "textbook" and wanted to see more unconventional thinking. He asked great questions about the product roadmap and decision-making autonomy. Cultural fit score from panel: 7.5/10. Note: he mentioned his partner is relocating to KL, which adds personal motivation for the move.`,
        referenceCheck: `Reference 1 (VP Product at SaaSCorp): "Marcus is dependable and thorough. He runs excellent sprint ceremonies and stakeholders trust him. He's not the most visionary PM I've worked with, but his execution is consistently strong. He's great at managing up and keeping leadership informed."

Reference 2 (Engineering Lead): "Working with Marcus was smooth. He writes clear PRDs and respects engineering estimates. He sometimes over-commits to delivery dates which creates pressure, but he's learning to buffer more. He's a team player who brings donuts to retros."

Both references confirmed no performance issues and would recommend him for a product role.`,
    },
    {
        id: "cand-003",
        name: "Aisha Rahman",
        role: "Data Scientist",
        department: "Engineering",
        experience: 4,
        location: "Singapore",
        status: "Shortlisted",
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
