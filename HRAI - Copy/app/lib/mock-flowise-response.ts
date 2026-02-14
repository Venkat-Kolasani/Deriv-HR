/**
 * Mock Flowise Response Generator
 * Demonstrates how to parse and transform Flowise API responses
 */

import type { CompatibilityScore } from "./flowise";

interface ScorecardData {
    overall_score: number;
    competencies: Record<string, number>;
    strengths: string[];
    concerns: string[];
    red_flags: string[];
    bias_flags: string[];
    summary: string;
}

/**
 * Simulates the Flowise API response structure
 */
export function generateMockFlowiseResponse(rawJsonString: string) {
    // Parse the raw JSON string from Flowise
    const compatibilityData: CompatibilityScore = JSON.parse(rawJsonString);

    // // Transform CompatibilityScore into ScorecardData format
    // const transformedScorecard: ScorecardData = {
    //     overall_score: compatibilityData.score / 10,
    //     competencies: {
    //         "Technical Skills": compatibilityData["Technical Skills"] / 10,
    //         "Communication": compatibilityData["Communication"] / 10,
    //         "Leadership": compatibilityData["Leadership"] / 10,
    //         "Culture Fit": compatibilityData["Culture Fit"] / 10,
    //     },
    //     strengths: compatibilityData["Key Strength"] || [],
    //     concerns: compatibilityData["Concerns"] || [],
    //     red_flags: [],
    //     bias_flags: compatibilityData["Bias Detection"] || [],
    //     summary: `Overall compatibility score of ${compatibilityData.score}/10. ${compatibilityData["Key Strength"]?.[0] || ""} However, ${compatibilityData["Concerns"]?.[0] || "some concerns were noted."}`
    // };

    return compatibilityData;
}

/**
 * Example usage with the provided JSON
 */
export function getMockScorecardData(): CompatibilityScore {
    const rawResponse = `{
  "score": 8,
  "Key Strength": [
    "Excellent communication skills, which are crucial for any marketing role.",
    "Strong analytical and problem-solving abilities demonstrated in her engineering career, which could transfer to market research and strategy analysis.",
    "Proactive and growth-minded, showing a commitment to continuous learning.",
    "Demonstrated collaborative spirit and leadership potential."
  ],
  "Concerns": [
    "No direct experience in digital marketing, content creation, or digital marketing strategy.",
    "Academic background is in Computer Science, not Marketing or Communications as required.",
    "Lack of proficiency in specific digital marketing software like Adobe Creative Cloud (Photoshop, InDesign, Illustrator).",
    "Significant mismatch in salary expectations ($115,000-130,000) versus the job's offered range ($70,000-$90,000).",
    "Her primary career focus and interest are in financial technology, not the clean energy or sustainability industry.",
    "Overqualified in terms of seniority and technical leadership for a specialist digital marketing role."
  ],
  "Technical Skills": 5,
  "Communication": 95,
  "Leadership": 90,
  "Culture Fit": 85,
  "Bias Detection": [
    "Potential 'overqualification bias' as her extensive experience as a Senior Software Engineer/Tech Lead might be seen as a negative for a specialist role, even though her general soft skills are high."
  ]
}`;

    return generateMockFlowiseResponse(rawResponse);
}

/**
 * Pretty print the parsed scorecard data
 */
export function displayParsedData() {
    const scorecard = getMockScorecardData();
    
    console.log("=== PARSED SCORECARD DATA ===\n");
    console.log(`Overall Score: ${scorecard.overall_score}/10\n`);
    
    console.log("Competencies:");
    Object.entries(scorecard.competencies).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}/10`);
    });
    
    console.log("\nStrengths:");
    scorecard.strengths.forEach((strength, i) => {
        console.log(`  ${i + 1}. ${strength}`);
    });
    
    console.log("\nConcerns:");
    scorecard.concerns.forEach((concern, i) => {
        console.log(`  ${i + 1}. ${concern}`);
    });
    
    console.log("\nBias Flags:");
    scorecard.bias_flags.forEach((flag, i) => {
        console.log(`  ${i + 1}. ${flag}`);
    });
    
    console.log(`\nSummary:\n${scorecard.summary}`);
    
    return scorecard;
}

/**
 * Mock compensation analysis data
 */
export interface CompensationAnalysis {
    label: string;
    baseSalary: number;
    signingBonus: number;
    equity: string;
    totalComp: number;
    acceptanceProbability: number;
    justification: string;
    pros: string[];
    rationale: string;
    negotiation_playbook: string;
}

/**
 * Returns mock compensation analysis data
 */
export function getMockCompensationData(): CompensationAnalysis {
    return {
        label: "Recommended Offer",
        baseSalary: 118000,
        signingBonus: 10000,
        equity: "20,000 USD in Restricted Stock Units (RSUs) vesting over 4 years",
        totalComp: 128000,
        acceptanceProbability: 80,
        justification: "This offer provides a competitive base salary at the 75th percentile of market data, a substantial signing bonus, and equity, placing the total compensation within the candidate's expected range.",
        pros: [
            "Meets candidate's expected salary range ($115,000-$130,000) with a total compensation of $128,000.",
            "Competitive base salary of $118,000, aligning with the P75 of market benchmarks for a Senior Software Engineer.",
            "Attractive signing bonus of $10,000 provides immediate value and helps bridge the gap from previous salary.",
            "Recognizes the candidate's 7 years of experience, strong AI review score (0.8), and positive attributes.",
            "The compensation package is well within the company's internal salary band for Senior Software Engineers in Malaysia."
        ],
        rationale: "The proposed compensation package is strategically designed to align with Sarah Chen's experience and strong profile, placing her at the 75th percentile of the market for a Senior Software Engineer. By offering a competitive base salary alongside a significant signing bonus, we aim to meet her salary expectations and secure her acceptance. This structure acknowledges her value while remaining within our established internal compensation framework.",
        negotiation_playbook: "Highlight the strength of the total compensation package, emphasizing the base salary's position at the 75th percentile of market data, which reflects her extensive experience and leadership potential. Clearly articulate the immediate financial benefit of the signing bonus and the long-term growth potential through equity. If the candidate pushes for a higher base salary, reiterate the overall value of the package and underscore the company's commitment to competitive compensation and career development opportunities."
    };
}
