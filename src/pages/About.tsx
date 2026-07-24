import { useSettings } from '../lib/useSettings';

export function About() {
  const { settings } = useSettings();
  
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">About {settings.title}</h1>
      
      <div className="prose prose-lg text-muted-foreground">
        <p className="mb-6">
          Welcome to {settings.title}, a centralized study material repository built exclusively for {settings.semester} students.
        </p>
        
        <p className="mb-6">
          This platform was created to solve the common problem of scattered study materials. Instead of searching through multiple WhatsApp groups, drive links, and emails, everything you need for this semester is organized in one clean, accessible location.
        </p>
        
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Features</h2>
        <ul className="list-disc pl-6 space-y-2 mb-8">
          <li>Organized by course and category</li>
          <li>Instant search and filtering</li>
          <li>Fast, responsive design</li>
          <li>No login required for browsing</li>
        </ul>
      </div>
    </div>
  );
}
