'use client';

import { useState } from 'react';
import Fuse from 'fuse.js';

// Sample data for testing
const sampleData = [
  { title: 'Software Engineer', skills: ['JavaScript', 'React', 'Node.js'] },
  { title: 'Frontend Developer', skills: ['HTML', 'CSS', 'React', 'TypeScript'] },
  { title: 'Backend Developer', skills: ['Python', 'Django', 'PostgreSQL'] },
  { title: 'Full Stack Developer', skills: ['JavaScript', 'Python', 'React', 'Django'] },
  { title: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS'] },
];

export default function TestFuseSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Initialize Fuse instance
  const fuse = new Fuse(sampleData, {
    keys: ['title', 'skills'],
    threshold: 0.3, // Lower threshold means more strict matching
    includeScore: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = fuse.search(query);
    setSearchResults(results);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Fuse.js Search Demo</h1>
      
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by title or skills..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <h2 className="text-lg font-semibold">{result.item.title}</h2>
              <p className="text-sm text-gray-600">
                Skills: {result.item.skills.join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                Match score: {(1 - (result.score || 0)).toFixed(2)}
              </p>
            </div>
          ))
        ) : searchQuery ? (
          <p className="text-gray-600">No results found</p>
        ) : (
          <p className="text-gray-600">Start typing to search...</p>
        )}
      </div>
    </div>
  );
}
