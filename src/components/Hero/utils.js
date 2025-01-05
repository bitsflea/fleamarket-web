import { FIXED_COLORS } from './constants';

export const generatePlanets = () => {
  return Array.from({ length: 5 }).map((_, id) => {
    const initialSize = Math.random() * 140 + 35;
    const blur = initialSize > 150 ? "blur-lg" : initialSize > 100 ? "blur-md" : "blur-sm";
    const opacity = initialSize > 150 ? "opacity-60" : initialSize > 100 ? "opacity-60" : "opacity-70";
    const color = FIXED_COLORS[Math.floor(Math.random() * FIXED_COLORS.length)];
    
    return {
      id,
      size: initialSize,
      blur,
      opacity,
      color,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 200 : 800),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 200 : 600),
    };
  });
};