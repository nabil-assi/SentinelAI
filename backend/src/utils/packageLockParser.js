"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractVersionsFromPackageLock = extractVersionsFromPackageLock;
exports.extractDependencies = extractDependencies;
function extractVersionsFromPackageLock(packageLockJson) {
    var versions = {};
    try {
        if (packageLockJson.packages) {
            Object.entries(packageLockJson.packages).forEach(function (_a) {
                var path = _a[0], info = _a[1];
                if (path !== '' && info.version) {
                    var name_1 = path.split('node_modules/').pop() || path;
                    versions[name_1] = info.version;
                }
            });
        }
        else if (packageLockJson.dependencies) {
            function walkDeps(deps) {
                Object.entries(deps).forEach(function (_a) {
                    var name = _a[0], info = _a[1];
                    versions[name] = info.version;
                    if (info.dependencies) {
                        walkDeps(info.dependencies);
                    }
                });
            }
            walkDeps(packageLockJson.dependencies);
        }
        return versions;
    }
    catch (error) {
        console.error('Error parsing package-lock.json:', error);
        return {};
    }
}
function extractDependencies(packageLockJson) {
    var dependencies = [];
    try {
        if (packageLockJson.packages) {
            Object.entries(packageLockJson.packages).forEach(function (_a) {
                var path = _a[0], info = _a[1];
                if (path === '')
                    return;
                var name = path.split('node_modules/').pop() || path;
                if (info.version) {
                    dependencies.push({
                        name: name,
                        version: info.version,
                        dev: info.dev || false
                    });
                }
            });
        }
        else if (packageLockJson.dependencies) {
            function walkDeps(deps) {
                Object.entries(deps).forEach(function (_a) {
                    var name = _a[0], info = _a[1];
                    dependencies.push({
                        name: name,
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
        var unique_1 = new Map();
        dependencies.forEach(function (dep) {
            var key = "".concat(dep.name, "@").concat(dep.version);
            if (!unique_1.has(key)) {
                unique_1.set(key, dep);
            }
        });
        return Array.from(unique_1.values());
    }
    catch (error) {
        console.error('Error extracting dependencies:', error);
        return [];
    }
}
