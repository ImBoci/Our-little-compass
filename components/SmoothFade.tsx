"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SmoothFadeProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function SmoothFade({ children, delay = 0, className }: SmoothFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
