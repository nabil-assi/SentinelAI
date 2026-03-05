import { DependencyInfo } from "../types/index.ts";  

export function extractVersionsFromPackageLock(packageLockJson: any): Record<string, string> {
    const versions: Record<string, string> = {};

    try {
        if (packageLockJson.packages) {
            Object.entries(packageLockJson.packages).forEach(([path, info]: [string, any]) => {
                if (path !== '' && info.version) {
                    const name = path.split('node_modules/').pop() || path;
                    versions[name] = info.version;
                }
            });
        }
        else if (packageLockJson.dependencies) {
            function walkDeps(deps: any) {
                Object.entries(deps).forEach(([name, info]: [string, any]) => {
                    versions[name] = info.version;
                    if (info.dependencies) {
                        walkDeps(info.dependencies);
                    }
                });
            }
            walkDeps(packageLockJson.dependencies);
        }

        return versions;
    } catch (error) {
        console.error('Error parsing package-lock.json:', error);
        return {};
    }
}

export function extractDependencies(packageLockJson: any): DependencyInfo[] {
    const dependencies: DependencyInfo[] = [];

    try {
        if (packageLockJson.packages) {
            Object.entries(packageLockJson.packages).forEach(([path, info]: [string, any]) => {
                if (path === '') return;

                const name = path.split('node_modules/').pop() || path;

                if (info.version) {
                    dependencies.push({
                        name,
                        version: info.version,
                        dev: info.dev || false
                    });
                }
            });
        }
        else if (packageLockJson.dependencies) {
            function walkDeps(deps: any) {
                Object.entries(deps).forEach(([name, info]: [string, any]) => {
                    dependencies.push({
                        name,
                        version: info.version,
                        dev: info.dev
                    });

                    if (info.dependencies) {
                        walkDeps(info.dependencies);
                    }
                });
            }
            walkDeps(packageLockJson.dependencies);
        }

        const unique = new Map();
        dependencies.forEach(dep => {
            const key = `${dep.name}@${dep.version}`;
            if (!unique.has(key)) {
                unique.set(key, dep);
            }
        });

        return Array.from(unique.values());

    } catch (error) {
        console.error('Error extracting dependencies:', error);
        return [];
    }
}