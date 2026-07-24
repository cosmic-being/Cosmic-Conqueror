import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSettings } from '../lib/useSettings';

export function Announcements() {
  const { settings } = useSettings();
  const announcements = [
    {
      id: 1,
      title: `Welcome to ${settings.semester}!`,
      content: 'All the study materials for the new semester will be uploaded here. Check back regularly for updates.',
      date: 'Oct 10, 2023',
      isNew: true
    },
    {
      id: 2,
      title: 'Discrete Math Assignment 1 Uploaded',
      content: 'The first assignment for Discrete Mathematics for AI has been uploaded to the respective course page.',
      date: 'Oct 15, 2023',
      isNew: false
    }
  ];

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Bell className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Announcements</h1>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement, i) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-8 rounded-[24px] border border-card-border shadow-sm relative overflow-hidden"
          >
            {announcement.isNew && (
              <div className="absolute top-0 right-0 bg-accent text-background text-xs font-bold px-3 py-1 rounded-bl-xl">
                NEW
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="font-medium text-primary">{announcement.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{announcement.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{announcement.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
