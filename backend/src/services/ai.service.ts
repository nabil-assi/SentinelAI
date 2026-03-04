import Groq from "groq-sdk";
import type { NVDVulnerability, AIAnalysisResult } from "../types/index.ts";

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
                executiveSummary: "No vulnerabilities detected in your dependencies.",
                technicalSummary: "All dependencies are up to date with no known CVEs.",
                remediationPlan: "Continue regular updates and monitoring."
            };
        }

        console.log(`🤖 Analyzing ${vulnerabilities.length} vulnerabilities with AI...`);
        
        // تأكد من وجود كلمة JSON في الـ messages
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are a Senior Cyber Security Researcher. 
                    You will be given REAL vulnerabilities from NVD database.
                    
                    You MUST return a VALID JSON object with the following structure.
                    
                    RULES:
                    1. Prioritize CRITICAL and HIGH severity first
                    2. Write clear recommendations for developers
                    3. Explain business impact in simple terms
                    4. DO NOT add new CVEs, only analyze the ones provided
                    5. Be specific about fixed versions when available
                    
                    The JSON structure must be exactly:
                    {
                        "prioritizedVulnerabilities": [
                            {
                                "libraryName": "string",
                                "cveId": "string",
                                "severity": "CRITICAL | HIGH | MEDIUM | LOW",
                                "title": "string",
                                "description": "string",
                                "recommendation": "string"
                            }
                        ],
                        "executiveSummary": "string",
                        "technicalSummary": "string",
                        "remediationPlan": "string"
                    }`
                },
                {
                    role: "user",
                    content: `Here is the JSON data containing vulnerabilities found in our Node.js API dependencies. Please analyze them and return a JSON response:

${JSON.stringify(vulnerabilities, null, 2)}

Remember: Your response must be valid JSON format.`
                }
            ]
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("AI returned empty response");

        // محاولة parse الـ JSON
        try {
            const parsed = JSON.parse(content);
            return parsed;
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", content.substring(0, 200));
            throw new Error("AI returned invalid JSON");
        }

    } catch (error) {
        console.error("🤖 AI analysis error:", error);
        
        // Return fallback analysis
        console.log("⚠️ Using fallback analysis due to AI error");
        
        return {
            prioritizedVulnerabilities: vulnerabilities.map(v => ({
                libraryName: v.libraryName,
                cveId: v.cveId,
                severity: mapCvssToSeverity(v.cvssScore),
                title: `${v.cveId} in ${v.libraryName}`,
                description: v.summary.substring(0, 200),
                recommendation: v.fixedVersion 
                    ? `Update to version ${v.fixedVersion} or later`
                    : `Check for updates for ${v.libraryName}`
            })),
            executiveSummary: `Found ${vulnerabilities.length} vulnerabilities in dependencies.`,
            technicalSummary: `Vulnerabilities found: ${vulnerabilities.length}`,
            remediationPlan: "Update affected packages to latest versions."
        };
    }
}

function mapCvssToSeverity(score: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
    if (score >= 9.0) return "CRITICAL";
    if (score >= 7.0) return "HIGH";
    if (score >= 4.0) return "MEDIUM";
    return "LOW";
}