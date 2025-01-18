import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { LlamaParseReader } from "llamaindex";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import 'dotenv/config';
import { storeExperiences, storeProjects } from '@/utils/resumeStorage';

// Define structured output interfaces
const ExperienceSchema = z.object({
    role: z.string(),
    organization: z.string(),
    location: z.string(),
    date_range: z.string(),
    achievements: z.array(z.string())
});

const ProjectSchema = z.object({
    project_name: z.string(),
    role: z.string(),
    date_range: z.string(),
    details: z.array(z.string())
});

const ResumeSchema = z.object({
    experience: z.array(ExperienceSchema),
    projects: z.array(ProjectSchema)
});

type ResumeOutput = z.infer<typeof ResumeSchema>;

interface ParsedExperience extends z.infer<typeof ExperienceSchema> {
    uploaded_at: string;
}

interface ResponseData {
    fileName: string;
    fileSize: number;
    rawContent: string;
    structuredContent: {
        experience: ParsedExperience[];
        projects: z.infer<typeof ProjectSchema>[];
    };
}

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are an expert assistant for parsing resumes. Your task is to extract and organize the Experience and Projects sections from a provided resume document. Follow these guidelines:

1. Include Only Relevant Sections:
   - Extract the Work Experience and Activities sections under their respective headings:
     - Work Experience: Include job titles, organizations, locations, dates, and bullet points detailing accomplishments.
     - Activities: Only include items that describe projects (e.g., software development challenges or internships), their descriptions, and outcomes.

2. Structured Output:
   - Format the extracted information under two main headings:
     - Experience
     - Projects
   - Within each heading, maintain chronological order (as presented) and organize details as follows:
     - Experience:
       - Role (e.g., "Summer Analyst – Business Intelligence")
       - Organization (e.g., "Goldman Sachs")
       - Location (e.g., "Salt Lake City, Utah")
       - Date Range (e.g., "Jun 2024 – Aug 2024")
       - Achievements (bulleted list with proper indentation and detailed description of each point)
     - Projects:
       - Project Name (e.g., "IMC Prosperity Challenge")
       - Role (e.g., "Software Developer")
       - Date Range (e.g., "Apr 2024")
       - Details (bulleted list describing contributions, technologies used, and outcomes)

3. Preserve Details and Formatting:
   - Keep technical details, metrics (e.g., "reduced manual workload by 120 hours annually"), and tools used (e.g., Python, Tableau, AWS).
   - Do not omit numbers, tools, or specific contributions from the accomplishments.`;

async function parseResume(resumeText: string): Promise<ResumeOutput> {
    try {
        console.log('Sending request to OpenAI with text length:', resumeText.length);
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: resumeText }
            ],
            response_format: zodResponseFormat(ResumeSchema, "resume"),
            temperature: 0.0
        });

        console.log('Raw OpenAI response:', JSON.stringify(completion.choices[0]?.message, null, 2));
        
        const parsed = completion.choices[0]?.message?.parsed;
        if (!parsed || !('experience' in parsed) || !('projects' in parsed)) {
            console.error('Invalid parsed result:', parsed);
            return { experience: [], projects: [] };
        }
        
        const result = parsed as ResumeOutput;
        console.log('Parsed result:', JSON.stringify(result, null, 2));
        return result;
    } catch (apiError) {
        console.error('OpenAI API error:', apiError);
        return { experience: [], projects: [] };
    }
}

export async function POST(request: Request) {
    try {
        console.log('Starting resume parsing process...');
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.log('No file provided');
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        console.log(`Processing file: ${file.name} (${file.size} bytes)`);

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file temporarily
        const tempDir = path.join(process.cwd(), 'tmp');
        const tempPath = path.join(tempDir, file.name);
        
        try {
            await writeFile(tempPath, buffer);
        } catch (error) {
            console.log('Creating temporary directory...');
            // Create tmp directory if it doesn't exist
            await mkdir(tempDir, { recursive: true });
            await writeFile(tempPath, buffer);
        }

        console.log('Starting LlamaParse processing...');
        // Parse the resume using LlamaParse
        const reader = new LlamaParseReader({ resultType: "markdown" });
        const documents = await reader.loadData(tempPath);

        // Clean up the temporary file
        await unlink(tempPath);
        console.log('Temporary file cleaned up');

        // Extract the parsed content
        const parsedContent = documents[0]?.text || '';
        console.log('LlamaParse processing completed. Content length:', parsedContent.length);
        if (parsedContent.length === 0) {
            console.error('No content extracted from document');
            throw new Error('No content extracted from document');
        }

        console.log('Starting OpenAI processing...');
        // Process with OpenAI
        const structuredContent = await parseResume(parsedContent);
        console.log('OpenAI response received and parsed');
        console.log('Structured content:', JSON.stringify(structuredContent, null, 2));

        if (structuredContent.experience.length === 0 && structuredContent.projects.length === 0) {
            console.warn('No experience or projects extracted from the resume');
        }

        // Store the parsed data
        await Promise.all([
            storeExperiences(structuredContent.experience),
            storeProjects(structuredContent.projects)
        ]);

        // Update frontend interface to match this structure
        const response: ResponseData = {
            fileName: file.name,
            fileSize: file.size,
            rawContent: parsedContent,
            structuredContent: {
                experience: structuredContent.experience.map((experience) => ({ ...experience, uploaded_at: new Date().toISOString() })),
                projects: structuredContent.projects
            }
        };
        console.log('Sending response to frontend');

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error processing file:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json(
            { error: 'Error processing file', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
