"use client";

import { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

const HOLD_MS = 2200;
const FADE_MS = 600;

export function SplashScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), HOLD_MS);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`${styles.overlay} ${exiting ? styles.exiting : ""}`}>
      <div className={styles.stack}>
        <div className={styles.logo}>
          <svg className={styles.ring} width="132" height="132" viewBox="0 0 132 132">
            <circle cx="66" cy="66" r="62" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
            <circle
              cx="66"
              cy="66"
              r="62"
              fill="none"
              stroke="#2A6FDB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="70 320"
            />
          </svg>
          <div className={styles.tile}>
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className={styles.house} d="M4 10.4 12 4l8 6.4V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.6z" />
              <path
                className={styles.heart}
                d="M12 17.6c-1.7-1.15-2.9-2.15-2.9-3.4a1.55 1.55 0 0 1 2.9-.78 1.55 1.55 0 0 1 2.9.78c0 1.25-1.2 2.25-2.9 3.4z"
                fill="#fff"
                stroke="none"
              />
            </svg>
          </div>
        </div>
        <div>
          <div className={styles.word}>SLSH</div>
          <div className={styles.tag}>Smooth · Live · Sweet · Home</div>
        </div>
        <div className={styles.dots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
