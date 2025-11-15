"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

export function HeroParallax({ onCTAClick }: { onCTAClick?: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "-20vh"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);

  return (
    <section ref={ref} className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/window.svg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">Eco-Friendly Water Bottle</h1>
        <p className="max-w-xl text-white/90 mb-6">Hydrate sustainably with durable, stylish bottles made for everyday performance.</p>
        <button onClick={onCTAClick} className="px-6 py-3 rounded-md bg-white text-black font-medium motion-safe:hover:opacity-90">Get Yours</button>
      </div>
    </section>
  );
}
