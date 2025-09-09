import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  formatValue = (val) => val.toString(),
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  const spring = useSpring(value, {
    duration,
    bounce: 0.25,
  });
  
  const animatedValue = useTransform(spring, (latest) => Math.round(latest));
  
  useEffect(() => {
    const unsubscribe = animatedValue.onChange((latest) => {
      setDisplayValue(latest);
    });
    
    return unsubscribe;
  }, [animatedValue]);
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span 
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: value !== displayValue ? 1.05 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {formatValue(displayValue)}
    </motion.span>
  );
};