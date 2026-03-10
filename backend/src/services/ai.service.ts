import Groq from "groq-sdk";
import { NVDVulnerability, AIAnalysisResult } from "../types/index";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeWithAI(
    vulnerabilities: NVDVulnerability[]
): Promise<AIAnalysisResult> {
    try {
        if (vulnerabilities.length === 0) {
            return {
                prioritizedVulnerabilities: [],
                executiveSummary: "Security posture is excellent. No known CVEs detected.",
                technicalSummary: "Zero-day monitoring active. All core dependencies are clean.",
                remediationPlan: "Maintain current patch management lifecycle."
            };
        }

        console.log(`🛡️  Senior Researcher analyzing ${vulnerabilities.length} threats...`);

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // تقليل العشوائية لضمان دقة التحليل التقني
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `"You are a destructive security auditor. Your goal is to reduce the attack surface.
                     If you see a library that is obsolete or built-in to Node.js/Express, 
                     you MUST explicitly tell the user to DELETE it and what code to use instead. 
                     Stop being polite and stop just saying 'update".


                    CRITICAL RULES:
                    1. BEYOND UPDATING: Do not just say "Update library". 
                    2. LEGACY DETECTION: If a library is obsolete (e.g., body-parser, request, moment.js), recommend REPLACING it with native Node.js APIs or modern alternatives.
                    3. ATTACK VECTOR: Briefly explain HOW an attacker could exploit this in a real-world Node.js environment.
                    4. ALTERNATIVES: Suggest a specific alternative library if the current one is notorious for vulnerabilities.
                    
                    The JSON structure MUST be exactly:
                    {
                        "prioritizedVulnerabilities": [
                            {
                                "libraryName": "string",
                                "cveId": "string",
                                "severity": "CRITICAL | HIGH | MEDIUM | LOW",
                                "title": "string",
                                "description": "Explain the exploit mechanism (e.g., Prototype Pollution, RCE)",
                                "recommendation": "Step-by-step fix or code change",
                                "alternativeLibrary": "string | null" // e.g., "Use express.json() instead of body-parser"
                            }
                        ],
                        "executiveSummary": "High-level risk assessment for stakeholders",
                        "technicalSummary": "Deep dive into the attack surface and patterns found",
                        "remediationPlan": "Strategic roadmap to clean the codebase"
                    }`
                },
                {
                    role: "user",
                    content: `Analyze these vulnerabilities found in our Node.js stack. If you see libraries like 'body-parser', 'qs', or 'lodash', look for native or lighter alternatives:

                    ${JSON.stringify(vulnerabilities, null, 2)}`
                }
            ]
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("AI returned empty response");

        return JSON.parse(content);

    } catch (error) {
        console.error("🚨 Senior Researcher Analysis Failed:", error);
        // Fallback remains as backup
        return {
            prioritizedVulnerabilities: vulnerabilities.map(v => ({
                libraryName: v.libraryName,
                cveId: v.cveId,
                severity: mapCvssToSeverity(v.cvssScore),
                title: `Emergency: ${v.libraryName} threat`,
                description: "AI analysis failed, but NVD data indicates immediate attention needed.",
                recommendation: `Manual audit required for version ${v.fixedVersion || 'latest'}`,
                alternativeLibrary: null
            })),
            executiveSummary: "Automated analysis failed. Manual intervention required.",
            technicalSummary: "System encountered an error during deep-packet analysis of vulnerabilities.",
            remediationPlan: "Verify NVD sources manually and apply emergency patches."
        };
    }
}

function mapCvssToSeverity(score: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
    if (score >= 9.0) return "CRITICAL";
    if (score >= 7.0) return "HIGH";
    if (score >= 4.0) return "MEDIUM";
    return "LOW";
}