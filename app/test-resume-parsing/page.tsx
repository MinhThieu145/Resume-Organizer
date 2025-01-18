'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ExperienceItem {
    role: string;
    organization: string;
    location: string;
    date_range: string;
    achievements: string[];
}

interface ProjectItem {
    project_name: string;
    role: string;
    date_range: string;
    details: string[];
}

interface ResumeOutput {
    experience: ExperienceItem[];
    projects: ProjectItem[];
}

interface ParsedResult {
    fileName: string;
    fileSize: number;
    rawContent: string;
    structuredContent: ResumeOutput;
}

export default function TestResumeParsing() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ParsedResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
    const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

    useEffect(() => {
        // Fetch experiences from JSON file
        fetch('/data/experiences.json')
            .then(response => response.json())
            .then(data => setExperiences(data))
            .catch(error => console.error('Error loading experiences:', error));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/resume-parsing', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to parse resume');
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Resume Parser Test</h1>
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <Input 
                                type="file" 
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                            />
                            <Button 
                                onClick={handleUpload}
                                disabled={!file || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : 'Upload'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle>Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-6">
                                {experiences.length > 0 ? (
                                    experiences.map((exp, index) => (
                                        <div 
                                            key={index} 
                                            className="p-4 bg-white hover:bg-gray-50/50 transition-colors duration-200 border-b last:border-b-0"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <h2 className="text-lg font-medium text-foreground">{exp.role}</h2>
                                                        <Badge variant="secondary" className="rounded-sm font-normal">{exp.date_range}</Badge>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                                        <div className="flex items-center">
                                                            <Building className="mr-2 h-4 w-4" />
                                                            <span>{exp.organization}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="mr-2 h-4 w-4" />
                                                            <span>{exp.location}</span>
                                                        </div>
                                                    </div>

                                                    <div className={`transition-all duration-300 overflow-hidden ${expandedItems[index] ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
                                                        <div className="space-y-2">
                                                            {exp.achievements?.map((achievement, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-start text-sm group"
                                                                >
                                                                    <span className="inline-block w-1 h-1 bg-primary rounded-full mt-2 mr-3 group-hover:scale-110 transition-transform"></span>
                                                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{achievement}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }))}
                                                    className="text-muted-foreground hover:text-foreground -mr-2"
                                                >
                                                    {expandedItems[index] ? 
                                                        <ChevronUp className="h-4 w-4" /> : 
                                                        <ChevronDown className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground italic">No experience data available</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {result && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">File Information</h2>
                                    <p><strong>Name:</strong> {result.fileName}</p>
                                    <p><strong>Size:</strong> {formatFileSize(result.fileSize)}</p>
                                </div>
                                
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Experience</h2>
                                    <div className="space-y-4">
                                        {result.structuredContent?.experience?.length > 0 ? (
                                            result.structuredContent.experience.map((exp, index) => (
                                                <div
                                                    key={index}
                                                    className="border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-sm bg-white"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-3 flex-1">
                                                            <h2 className="text-xl font-medium text-black">{exp.role}</h2>
                                                            
                                                            <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                                                                <div className="flex items-center">
                                                                    <Building className="mr-2 h-4 w-4" />
                                                                    <span>{exp.organization}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <MapPin className="mr-2 h-4 w-4" />
                                                                    <span>{exp.location}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                    <span>{exp.date_range}</span>
                                                                </div>
                                                            </div>

                                                            <div className={`mt-4 transition-all duration-300 overflow-hidden ${expandedItems[index] ? 'max-h-[1000px]' : 'max-h-24'}`}>
                                                                <h3 className="text-md font-medium text-black mb-2">Key Achievements</h3>
                                                                <ul className="space-y-2">
                                                                    {exp.achievements?.map((achievement, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="flex items-start text-sm"
                                                                        >
                                                                            <span className="inline-block w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                                                                            <span className="text-gray-600">{achievement}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }))}
                                                            className="p-2 text-gray-400 hover:text-black transition-colors duration-200"
                                                            aria-label="Toggle expand"
                                                        >
                                                            {expandedItems[index] ? 
                                                                <ChevronUp className="h-5 w-5" /> : 
                                                                <ChevronDown className="h-5 w-5" />
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No experience data available</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Projects</h2>
                                    <div className="space-y-4">
                                        {result.structuredContent?.projects?.length > 0 ? (
                                            result.structuredContent.projects.map((project, index) => (
                                                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                                                    <p><strong>Project Name:</strong> {project.project_name}</p>
                                                    <p><strong>Role:</strong> {project.role}</p>
                                                    <p><strong>Date Range:</strong> {project.date_range}</p>
                                                    <div className="mt-2">
                                                        <strong>Details:</strong>
                                                        <ul className="list-disc pl-5">
                                                            {project.details?.map((detail, idx) => (
                                                                <li key={idx}>{detail}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No project data available</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Raw Content</h2>
                                    <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] whitespace-pre-wrap">
                                        {result.rawContent || 'No raw content available'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
