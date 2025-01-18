import fs from 'fs/promises';
import path from 'path';

// Types for our storage
export interface Experience {
    role: string;
    date_range: string;
    organization: string;
    location: string;
    achievements: string[];
    uploaded_at: string; // ISO string format
}

export interface Project {
    project_name: string;
    role: string;
    date_range: string;
    details: string[];
}

// File paths for our JSON storage
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const EXPERIENCES_FILE = path.join(DATA_DIR, 'experiences.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Read JSON file or return empty array if file doesn't exist
async function readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return [];
    }
}

// Write data to JSON file
async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Check if an experience is exactly the same
function isUniqueExperience(newExp: Experience, existingExps: Experience[]): boolean {
    return !existingExps.some(exp => 
        exp.role === newExp.role &&
        exp.organization === newExp.organization &&
        exp.location === newExp.location &&
        exp.date_range === newExp.date_range &&
        exp.achievements.length === newExp.achievements.length &&
        exp.achievements.every((achievement, index) => 
            achievement === newExp.achievements[index]
        )
        // Intentionally not comparing uploaded_at
    );
}

// Check if a project is exactly the same
function isUniqueProject(newProj: Project, existingProjs: Project[]): boolean {
    return !existingProjs.some(proj => 
        proj.project_name === newProj.project_name &&
        proj.role === newProj.role &&
        proj.date_range === newProj.date_range &&
        proj.details.length === newProj.details.length &&
        proj.details.every((detail, index) => 
            detail === newProj.details[index]
        )
    );
}

// Store new experiences if they're unique
export async function storeExperiences(experiences: Omit<Experience, 'uploaded_at'>[]): Promise<void> {
    await ensureDataDir();
    const existingExperiences = await readJsonFile<Experience>(EXPERIENCES_FILE);
    
    const experiencesWithDate = experiences.map(exp => ({
        ...exp,
        uploaded_at: new Date().toISOString()
    }));

    const newExperiences = experiencesWithDate.filter(exp => 
        isUniqueExperience(exp, existingExperiences)
    );
    
    if (newExperiences.length > 0) {
        await writeJsonFile(EXPERIENCES_FILE, [...existingExperiences, ...newExperiences]);
        console.log(`Stored ${newExperiences.length} new experiences`);
    }
}

// Store new projects if they're unique
export async function storeProjects(projects: Project[]): Promise<void> {
    await ensureDataDir();
    const existingProjects = await readJsonFile<Project>(PROJECTS_FILE);
    
    const newProjects = projects.filter(proj => 
        isUniqueProject(proj, existingProjects)
    );
    
    if (newProjects.length > 0) {
        await writeJsonFile(PROJECTS_FILE, [...existingProjects, ...newProjects]);
        console.log(`Stored ${newProjects.length} new projects`);
    }
}

// Get all stored experiences
export async function getAllExperiences(): Promise<Experience[]> {
    await ensureDataDir();
    return readJsonFile<Experience>(EXPERIENCES_FILE);
}

// Get all stored projects
export async function getAllProjects(): Promise<Project[]> {
    await ensureDataDir();
    return readJsonFile<Project>(PROJECTS_FILE);
}
