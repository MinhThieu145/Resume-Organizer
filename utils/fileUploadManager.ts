import axios from 'axios';

export interface ExperienceItem {
  role: string;
  organization: string;
  location: string;
  date_range: string;
  achievements: string[];
  uploaded_at?: string; // ISO string format
}

export interface ParsedResult {
  fileName: string;
  fileSize: number;
  rawContent: string;
  structuredContent: {
    experience: ExperienceItem[];
    projects: {
      project_name: string;
      role: string;
      date_range: string;
      details: string[];
    }[];
  };
}

export class FileUploadManager {
  static async uploadAndParseResume(file: File): Promise<ParsedResult> {
    if (!file.type.includes('pdf')) {
      throw new Error('Please upload PDF files only');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume-parsing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading and parsing file:', error);
      throw error;
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
