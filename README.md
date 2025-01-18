# Resume Organizer

A modern web application built with Next.js that helps organize, parse, and search through resumes efficiently. This application provides an intuitive interface for managing resume documents with advanced search capabilities.

## Features

- PDF Resume Upload and Processing
- Advanced Resume Search with Fuse.j    
- AI-Powered Resume Parsing
- Experience and Project Management
- Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 15.1.5
- **UI**: Tailwind CSS, shadcn/ui
- **Search**: Fuse.js
- **AI Integration**: OpenAI, LlamaIndex
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with custom animations

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/MinhThieu145/Resume-Organizer.git
cd Resume-Organizer/front-end
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable UI components
- `/utils` - Utility functions and helpers
- `/public` - Static assets and sample data
- `/lib` - Shared utilities and configurations

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
