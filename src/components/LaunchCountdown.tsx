'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const launchDate = new Date('2026-02-15T00:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
      <div className="relative">
        <div 
          className="font-mono text-2xl sm:text-4xl md:text-6xl font-bold text-white tabular-nums"
          style={{
            textShadow: '0 0 20px rgba(255, 87, 34, 0.8), 0 0 40px rgba(255, 87, 34, 0.4), 0 0 60px rgba(255, 87, 34, 0.2)',
          }}
        >
          {mounted ? String(value).padStart(2, '0') : '--'}
        </div>
      </div>
      <div className="font-mono text-[10px] sm:text-xs md:text-sm text-[var(--text-muted)] tracking-wider uppercase mt-1 sm:mt-2">
        {label}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-2xl mb-8"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.15) 0%, rgba(139, 0, 139, 0.15) 50%, rgba(0, 229, 255, 0.1) 100%)',
        border: '1px solid rgba(255, 87, 34, 0.3)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#ff5722]/40"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '100%',
              opacity: 0 
            }}
            animate={{ 
              y: '-100%',
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Glow effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, #ff5722, transparent 70%)',
        }}
      />

      <div className="relative p-4 sm:p-8 md:p-10">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-[#ff5722]" />
          </motion.div>
          <h2 
            className="font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-wider uppercase"
            style={{
              background: 'linear-gradient(90deg, #ff5722, #ff9800, #ffd60a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255, 87, 34, 0.5)',
            }}
          >
            DRIZZLE V2 LAUNCH
          </h2>
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="text-base sm:text-xl"
          >
            🚀
          </motion.div>
        </motion.div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 overflow-x-auto">
          <TimeBlock value={timeLeft.days} label="Days" />
          <div className="text-xl sm:text-3xl md:text-5xl text-[#ff5722]/50 font-light">:</div>
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <div className="text-xl sm:text-3xl md:text-5xl text-[#ff5722]/50 font-light">:</div>
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <div className="text-xl sm:text-3xl md:text-5xl text-[#ff5722]/50 font-light">:</div>
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>

        {/* Subtitle */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-mono text-xs text-[var(--text-muted)] tracking-widest uppercase">
            February 15, 2026 • The Future of Drip
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
