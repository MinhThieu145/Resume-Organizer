import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const projToDelete = await request.json();
        const dataDir = path.join(process.cwd(), 'public', 'data');
        const projectsPath = path.join(dataDir, 'projects.json');

        // Read current projects
        const projectsContent = await readFile(projectsPath, 'utf-8');
        const projects = JSON.parse(projectsContent);

        // Filter out the project to delete
        const filteredProjects = projects.filter((proj: any) => 
            !(proj.project_name === projToDelete.project_name && 
              proj.role === projToDelete.role && 
              proj.date_range === projToDelete.date_range)
        );

        // Write back the filtered projects
        await writeFile(projectsPath, JSON.stringify(filteredProjects, null, 2), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
