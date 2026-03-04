import axios from "axios";
import { NVDVulnerability } from "../types/index.js";

const NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // ساعة واحدة

// تأخير بين الطلبات (500ms)
const DELAY_BETWEEN_REQUESTS = 500;

export async function queryNVD(
    packageName: string,
    version: string,
    retryCount = 0
): Promise<NVDVulnerability[]> {
    const cacheKey = `${packageName}@${version}`;
    
    try {
        // التحقق من الكاش
        const cached = CACHE.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`✅ Cache hit for ${packageName}@${version}`);
            return cached.data;
        }

        console.log(`🔍 Querying NVD for ${packageName}@${version} (attempt ${retryCount + 1})`);
        
        const res = await axios.get(NVD_API, {
            params: {
                keywordSearch: `${packageName} ${version}`,
                resultsPerPage: 50
            },
            timeout: 10000,
            headers: {
                'User-Agent': 'SentinelAI-Security-Scanner/1.0'
            }
        });

        const vulnerabilities = res.data.vulnerabilities || [];
        
        const results = vulnerabilities
            .map((v: any) => {
                const cve = v.cve;
                const metrics = cve.metrics?.cvssMetricV31?.[0] || 
                               cve.metrics?.cvssMetricV30?.[0] ||
                               cve.metrics?.cvssMetricV2?.[0];

                if (!metrics) return null;

                let fixedVersion = null;
                const descriptions = cve.descriptions || [];
                const description = descriptions[0]?.value || "";
                
                const fixedMatch = description.match(/fixed in (?:version )?(\d+\.\d+\.\d+)/i) ||
                                 description.match(/patched in (?:version )?(\d+\.\d+\.\d+)/i) ||
                                 description.match(/upgrade to (\d+\.\d+\.\d+)/i);
                
                if (fixedMatch) {
                    fixedVersion = fixedMatch[1];
                }

                return {
                    libraryName: packageName,
                    currentVersion: version,
                    cveId: cve.id,
                    cvssScore: metrics.cvssData.baseScore,
                    cvssVector: metrics.cvssData.vectorString,
                    summary: description.substring(0, 500),
                    fixedVersion
                };
            })
            .filter(Boolean);

        // تخزين في الكاش
        CACHE.set(cacheKey, { data: results, timestamp: Date.now() });
        
        return results;
        
    } catch (err) {
        if (axios.isAxiosError(err)) {
            // Rate limiting - 429 Too Many Requests
            if (err.response?.status === 429) {
                console.log(`⚠️ Rate limited for ${packageName}@${version}`);
                
                if (retryCount < 3) { // حاول 3 مرات كحد أقصى
                    const waitTime = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
                    console.log(`⏳ Waiting ${waitTime/1000} seconds before retry ${retryCount + 1}/3...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return queryNVD(packageName, version, retryCount + 1);
                } else {
                    console.log(`❌ Skipping ${packageName}@${version} after 3 retries`);
                    return [];
                }
            }
            
            // أخطاء أخرى
            console.error(`NVD error for ${packageName}:`, err.message);
        } else {
            console.error(`Unknown error for ${packageName}:`, err);
        }
        
        return [];
    }
}

// دالة لمسح الكاش
export function clearCache() {
    CACHE.clear();
    console.log("🧹 NVD cache cleared");
}