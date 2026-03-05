// services/osv.service.ts
export async function queryOSV(packages: Array<{name: string, version: string}>, ecosystem: string = 'npm') {
    try {
        const response = await fetch('https://api.osv.dev/v1/querybatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                queries: packages.map(pkg => ({
                    package: {
                        name: pkg.name,
                        ecosystem: ecosystem
                    },
                    version: pkg.version
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`OSV API error: ${response.status}`);
        }

        const data = await response.json();

        // معالجة النتائج
        const vulnerabilities: any[] = [];

        if (data.results) {
            data.results.forEach((result: any, index: number) => {
                if (result.vulns && result.vulns.length > 0) {
                    result.vulns.forEach((vuln: any) => {
                        // استخراج الـ severity من OSV
                        let severity = 'MEDIUM';
                        if (vuln.severity && vuln.severity.length > 0) {
                            const sev = vuln.severity[0];
                            if (sev.score) {
                                if (sev.score >= 9.0) severity = 'CRITICAL';
                                else if (sev.score >= 7.0) severity = 'HIGH';
                                else if (sev.score >= 4.0) severity = 'MEDIUM';
                                else severity = 'LOW';
                            } else if (sev.type === 'CVSS_V3') {
                                severity = sev.score || 'MEDIUM';
                            }
                        }

                        // استخراج النسخة الآمنة
                        let fixedVersion = null;
                        if (vuln.ranges) {
                            for (const range of vuln.ranges) {
                                if (range.events) {
                                    for (const event of range.events) {
                                        if (event.fixed) {
                                            fixedVersion = event.fixed;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        vulnerabilities.push({
                            packageName: packages[index].name,
                            version: packages[index].version,
                            cveId: vuln.id,
                            severity: severity,
                            title: vuln.summary || `Vulnerability in ${packages[index].name}`,
                            description: vuln.details || 'No description available',
                            summary: vuln.summary || 'No summary available',
                            fixedVersion: fixedVersion,
                            recommendation: fixedVersion 
                                ? `Update to version ${fixedVersion}`
                                : `Check for updates for ${packages[index].name}`,
                            cvssScore: typeof severity === 'number' ? severity : 
                                      severity === 'CRITICAL' ? 9.5 :
                                      severity === 'HIGH' ? 8.0 :
                                      severity === 'MEDIUM' ? 5.5 : 2.5
                        });
                    });
                }
            });
        }

        return vulnerabilities;

    } catch (error) {
        console.error('❌ OSV batch error:', error);
        return [];
    }
}