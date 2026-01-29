'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

import { calendarEvents, CalendarEvent } from '@/lib/data';

const typeColors = {
  meeting: { bg: 'bg-[#00e5ff]/10', text: 'text-[#00e5ff]', dot: 'bg-[#00e5ff]' },
  personal: { bg: 'bg-[#bf5af2]/10', text: 'text-[#bf5af2]', dot: 'bg-[#bf5af2]' },
  deadline: { bg: 'bg-[#ff5722]/10', text: 'text-[#ff5722]', dot: 'bg-[#ff5722]' },
  golf: { bg: 'bg-[#30d158]/10', text: 'text-[#30d158]', dot: 'bg-[#30d158]' },
};

function formatEventDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
}

export function CalendarWidget() {
  const hasEvents = calendarEvents.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#ff5722]/10">
            <Calendar className="w-4 h-4 text-[#ff5722]" />
          </div>
          <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
            Upcoming
          </h2>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {format(new Date(), 'MMM d')}
        </span>
      </div>

      {hasEvents ? (
        <div className="space-y-3">
          {calendarEvents.slice(0, 5).map((event, index) => {
            const colors = typeColors[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`p-3 rounded-xl ${colors.bg} border border-white/[0.03]`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {event.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span>{formatEventDate(event.start)} • {format(event.start, 'h:mm a')}</span>
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
          <p className="text-sm text-[var(--text-muted)]">No upcoming events</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">
            Calendar syncs when connected
          </p>
        </div>
      )}
    </motion.div>
  );
}
