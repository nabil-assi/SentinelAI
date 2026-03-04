import axios from "axios";
import { prisma } from "../lib/prisma.ts";  // أضف .ts

export async function fetchPackageJson(projectId: string): Promise<any> {
    const project = await prisma.project.findUnique({ 
        where: { id: projectId } 
    });
    
    if (!project || !project.repoUrl) {
        throw new Error("Target Repository not found.");
    }

    const rawUrl = project.repoUrl
        .replace("github.com", "raw.githubusercontent.com")
        .replace(/\/$/, "") + "/main/package.json";
    
    const response = await axios.get(rawUrl, { timeout: 10000 });
    return response.data;
}

export async function fetchPackageLockJson(projectId: string): Promise<any | null> {
    try {
        const project = await prisma.project.findUnique({ 
            where: { id: projectId } 
        });
        
        if (!project || !project.repoUrl) {
            return null;
        }

        const rawUrl = project.repoUrl
            .replace("github.com", "raw.githubusercontent.com")
            .replace(/\/$/, "") + "/main/package-lock.json";
        
        const response = await axios.get(rawUrl, { timeout: 10000 });
        return response.data;
    } catch (error) {
        console.log("Package-lock.json not found in repository");
        return null;
    }
}