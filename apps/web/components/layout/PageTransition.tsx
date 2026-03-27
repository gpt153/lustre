'use client';

import { useEffect, useState } from 'react';
import styles from './PageTransition.module.css';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={isVisible ? styles.pageEnter : styles.pageHidden}>
      {children}
    </div>
  );
}
