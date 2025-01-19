import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const expToDelete = await request.json();
        const dataDir = path.join(process.cwd(), 'public', 'data');
        const experiencesPath = path.join(dataDir, 'experiences.json');

        // Read current experiences
        const experiencesContent = await readFile(experiencesPath, 'utf-8');
        const experiences = JSON.parse(experiencesContent);

        // Filter out the experience to delete
        const filteredExperiences = experiences.filter((exp: any) => 
            !(exp.role === expToDelete.role && 
              exp.organization === expToDelete.organization && 
              exp.date_range === expToDelete.date_range)
        );

        // Write back the filtered experiences
        await writeFile(experiencesPath, JSON.stringify(filteredExperiences, null, 2), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting experience:', error);
        return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
    }
}
