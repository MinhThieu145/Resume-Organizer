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

// Get all stored experiences
export async function getAllExperiences(): Promise<Experience[]> {
    const response = await fetch('/data/experiences.json');
    if (!response.ok) {
        return [];
    }
    return response.json();
}

// Get all stored projects
export async function getAllProjects(): Promise<Project[]> {
    const response = await fetch('/data/projects.json');
    if (!response.ok) {
        return [];
    }
    return response.json();
}

// Delete an experience by matching its properties
export async function deleteExperience(expToDelete: Experience): Promise<void> {
    const response = await fetch('/api/experience/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expToDelete),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete experience');
    }
}

// Delete a project by matching its properties
export async function deleteProject(projToDelete: Project): Promise<void> {
    const response = await fetch('/api/project/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projToDelete),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
    }
}

// Store new experiences if they're unique
export async function storeExperiences(experiences: Omit<Experience, 'uploaded_at'>[]): Promise<void> {
    const response = await fetch('/api/resume-parsing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to store experiences');
    }
}

// Store new projects if they're unique
export async function storeProjects(projects: Project[]): Promise<void> {
    const response = await fetch('/api/resume-parsing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projects }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to store projects');
    }
}
