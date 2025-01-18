'use client'

import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import Fuse from 'fuse.js'
import toast, { Toaster } from 'react-hot-toast'
import { Search, Settings, HelpCircle, User, Upload, Download, Share2, Trash2, Grid, List, Building, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadManager, type ExperienceItem, type ParsedResult } from '@/utils/fileUploadManager'

export default function PDFManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [parsedResults, setParsedResults] = useState<ParsedResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExperienceItem[]>([]);

  const fetchExperiences = useCallback(async () => {
    try {
      const response = await fetch('/data/experiences.json');
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error loading experiences:', error);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

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
          // Upload and parse the file immediately
          const result = await FileUploadManager.uploadAndParseResume(file);
          allResults.push(result);
        } catch (error: any) {
          console.error('Error processing file:', file.name, error);
          const errorMessage = error.message || 'Failed to process file';
          alert(`Error processing ${file.name}: ${errorMessage}`);
        }
      }
      
      // After all files are processed, refresh the experiences from JSON
      if (allResults.length > 0) {
        setParsedResults(allResults);
        // Fetch the updated experiences from JSON file
        await fetchExperiences();
      }
      
      // Show success message
      alert('Files processed successfully!');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload file(s)';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize Fuse instance
  const fuse = new Fuse(experiences, {
    keys: ['role', 'organization', 'location', 'achievements'],
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

  // Function to group experiences by time
  const groupExperiencesByTime = useCallback((experiences: ExperienceItem[]) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const groups: { [key: string]: ExperienceItem[] } = {
      'Today': [],
      'Yesterday': [],
      'Earlier this week': [],
      'Earlier this month': [],
      'Older': []
    };

    experiences.forEach(exp => {
      const uploadDate = exp.uploaded_at ? new Date(exp.uploaded_at) : new Date();
      
      if (uploadDate.toDateString() === now.toDateString()) {
        groups['Today'].push(exp);
      } else if (uploadDate.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(exp);
      } else if (uploadDate > lastWeek) {
        groups['Earlier this week'].push(exp);
      } else if (uploadDate > lastMonth) {
        groups['Earlier this month'].push(exp);
      } else {
        groups['Older'].push(exp);
      }
    });

    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-right" />
      {/* Navigation Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold">PDFManager</span>
          
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for files by name, date, or keyword"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 relative ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
          />
          <label
            htmlFor="file-upload"
            className="mx-auto w-fit block cursor-pointer"
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isUploading ? 'animate-bounce' : ''} ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <h3 className="text-lg font-medium mb-1">
              {isUploading ? 'Uploading...' : 'Drag & Drop your PDF files here'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Please wait...' : 'Or click to upload'}
            </p>
          </label>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="older">Older</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="name">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="size">Size (Largest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="list" onValueChange={(value) => setViewMode(value as 'list' | 'grid')}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* File Display Area */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">Experiences</div>
          
          <Tabs value={viewMode}>
            {/* List View */}
            <TabsContent value="list" className="mt-0">
              <ScrollArea className="max-h-screen">
                <div className="rounded-lg border bg-background">
                  {experiences.length > 0 ? (
                    Object.entries(groupExperiencesByTime(searchQuery ? searchResults : experiences)).map(([timeGroup, groupExps]) => (
                      groupExps.length > 0 && (
                        <div key={timeGroup}>
                          <div className="px-4 py-2 bg-muted/50">
                            <h3 className="text-sm font-medium text-muted-foreground">{timeGroup}</h3>
                          </div>
                          {groupExps.map((exp, index) => (
                            <div 
                              key={`${timeGroup}-${index}`}
                              className="p-4 hover:bg-muted/50 transition-colors duration-200 border-b last:border-b-0"
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

                                  <div className={`transition-all duration-300 ${expandedItems[index] ? 'opacity-100' : 'opacity-80'}`}>
                                    <div className="space-y-2">
                                      {exp.achievements?.map((achievement, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start text-sm group cursor-pointer"
                                          onClick={() => {
                                            navigator.clipboard.writeText(achievement)
                                              .then(() => toast.success('Achievement copied to clipboard!'))
                                              .catch(() => toast.error('Failed to copy achievement'));
                                          }}
                                        >
                                          <span className="inline-block w-1 h-1 bg-primary rounded-full mt-2 mr-3 group-hover:scale-110 transition-transform"></span>
                                          <span className="text-muted-foreground group-hover:text-foreground transition-colors flex-1">{achievement}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }))}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {expandedItems[index] ? 
                                      <ChevronUp className="h-4 w-4" /> : 
                                      <ChevronDown className="h-4 w-4" />
                                    }
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No experiences found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Grid View */}
            <TabsContent value="grid" className="mt-0">
              <ScrollArea className="max-h-screen">
                {experiences.length > 0 ? (
                  Object.entries(groupExperiencesByTime(searchQuery ? searchResults : experiences)).map(([timeGroup, groupExps]) => (
                    groupExps.length > 0 && (
                      <div key={timeGroup} className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">{timeGroup}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupExps.map((exp, index) => (
                            <div 
                              key={`${timeGroup}-${index}`}
                              className="p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors duration-200"
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                  <h2 className="text-lg font-medium text-foreground">{exp.role}</h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }))}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {expandedItems[index] ? 
                                      <ChevronUp className="h-4 w-4" /> : 
                                      <ChevronDown className="h-4 w-4" />
                                    }
                                  </Button>
                                </div>

                                <Badge variant="secondary" className="rounded-sm font-normal">{exp.date_range}</Badge>
                                
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Building className="mr-2 h-4 w-4" />
                                    <span>{exp.organization}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{exp.location}</span>
                                  </div>
                                </div>

                                <div className={`transition-all duration-300 ${expandedItems[index] ? 'opacity-100' : 'opacity-80'}`}>
                                  <div className="space-y-2">
                                    {exp.achievements?.map((achievement, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start text-sm group cursor-pointer"
                                        onClick={() => {
                                          navigator.clipboard.writeText(achievement)
                                            .then(() => toast.success('Achievement copied to clipboard!'))
                                            .catch(() => toast.error('Failed to copy achievement'));
                                        }}
                                      >
                                        <span className="inline-block w-1 h-1 bg-primary rounded-full mt-2 mr-3 group-hover:scale-110 transition-transform"></span>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors flex-1">{achievement}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="col-span-full p-8 text-center border rounded-lg">
                    <p className="text-muted-foreground">No experiences found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
