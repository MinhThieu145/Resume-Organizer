'use client'

import { useState, useCallback, useEffect } from 'react'
import Fuse from 'fuse.js'
import { Toaster } from 'react-hot-toast'
import { FileUploadManager, type ExperienceItem, type ParsedResult } from '@/utils/fileUploadManager'
import { ProjectItem } from '@/types'
import { groupItemsByTime } from '@/utils/time-grouping'
import { Header } from '@/components/header'
import { UploadArea } from '@/components/upload-area'
import { ContentFilters } from '@/components/content-filters'
import { ContentView } from '@/components/content/content-view'
import { getAllExperiences, getAllProjects } from '@/utils/resumeStorage'

export default function PDFManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [parsedResults, setParsedResults] = useState<ParsedResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExperienceItem[] | ProjectItem[]>([]);
  const [contentType, setContentType] = useState<'experience' | 'project'>('experience');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [loadedExperiences, loadedProjects] = await Promise.all([
          getAllExperiences(),
          getAllProjects()
        ]);
        setExperiences(loadedExperiences);
        setProjects(loadedProjects);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  const fetchExperiences = useCallback(async () => {
    try {
      const response = await fetch('/data/experiences.json');
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error loading experiences:', error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/data/projects.json');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
    fetchProjects();
  }, [fetchExperiences, fetchProjects]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await handleFileUpload(files);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    await handleFileUpload(files);
  }, []);

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const allResults: ParsedResult[] = [];
      
      for (const file of files) {
        try {
          const result = await FileUploadManager.uploadAndParseResume(file);
          allResults.push(result);
        } catch (error: any) {
          console.error('Error processing file:', file.name, error);
          const errorMessage = error.message || 'Failed to process file';
          alert(`Error processing ${file.name}: ${errorMessage}`);
        }
      }
      
      if (allResults.length > 0) {
        setParsedResults(allResults);
        await fetchExperiences();
      }
      
      alert('Files processed successfully!');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload file(s)';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const refreshData = useCallback(async () => {
    const newExperiences = await getAllExperiences();
    const newProjects = await getAllProjects();
    setExperiences(newExperiences);
    setProjects(newProjects);
  }, []);

  // Initialize Fuse instance based on content type
  const fuse = contentType === 'experience' 
    ? new Fuse(experiences, {
        keys: ['role', 'organization', 'location', 'achievements'],
        threshold: 0.3,
        includeScore: true,
      })
    : new Fuse(projects, {
        keys: ['project_name', 'role', 'details'],
        threshold: 0.3,
        includeScore: true,
      });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = fuse.search(query);
    setSearchResults(results.map(result => result.item));
  };

  const handleToggleExpand = (index: number) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-right" />
      
      <Header
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <main className="container mx-auto px-4 py-8">
        <UploadArea
          isDragging={isDragging}
          isUploading={isUploading}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
        />

        <ContentFilters
          contentType={contentType}
          onContentTypeChange={(checked) => setContentType(checked ? 'project' : 'experience')}
          onViewModeChange={setViewMode}
        />

        <ContentView
          contentType={contentType}
          viewMode={viewMode}
          experiences={searchQuery ? (searchResults as ExperienceItem[]) : experiences}
          projects={searchQuery ? (searchResults as ProjectItem[]) : projects}
          groupedExperiences={groupItemsByTime(searchQuery ? (searchResults as ExperienceItem[]) : experiences)}
          expandedItems={expandedItems}
          onToggleExpand={handleToggleExpand}
          onItemDeleted={refreshData}
        />
      </main>
    </div>
  )
}
