import { useSettings } from '../lib/useSettings';

export function Footer() {
  const { settings } = useSettings();
  
  return (
    <footer className="border-t border-card-border/50 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-bold text-xs">
              {settings.title.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              {settings.title}
            </span>
          </div>
          <p className="text-muted-foreground mb-6">{settings.footerText}</p>
          <p className="text-sm text-muted-foreground\/70">
            Built using React + Firebase.
          </p>
          <p className="text-sm text-muted-foreground\/70 flex items-center gap-1 mt-1">
            Designed with <span className="text-red-500">❤️</span> for learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
