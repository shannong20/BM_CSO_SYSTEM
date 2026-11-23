'use client';

import React, { useId } from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

/**
 * Custom SVG emblem for CSOTrack (Province of La Union · Sangguniang Panlalawigan).
 * Combines a civic shield, interlocking community arches, and a gold accreditation star.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 40, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const shieldGradId = `csotrack-shield-${uid}`;
  const goldGradId = `csotrack-gold-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={shieldGradId} x1="4" y1="3" x2="36" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#266B4E" />
          <stop offset="100%" stopColor="#0E2B1F" />
        </linearGradient>
        <linearGradient id={goldGradId} x1="12" y1="8" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Outer civic shield */}
      <path
        d="M20 3L34 8.2V19.5C34 27.9 27.9 34.8 20 37.5C12.1 34.8 6 27.9 6 19.5V8.2L20 3Z"
        fill={`url(#${shieldGradId})`}
        stroke="#6EE7B7"
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />

      {/* Inner subtle crest border */}
      <path
        d="M20 6L31 10.1V19.3C31 26.1 26.2 31.8 20 34.1C13.8 31.8 9 26.1 9 19.3V10.1L20 6Z"
        stroke="#A4E0B8"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      {/* Interlocking community 'C' arc */}
      <path
        d="M24.8 14.5C23.5 13.3 21.8 12.6 19.9 12.6C15.9 12.6 12.7 15.8 12.7 19.8C12.7 23.8 15.9 27 19.9 27C22.2 27 24.3 25.9 25.6 24.2"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Gold accreditation ribbon / check */}
      <path
        d="M17.2 19.7L19.6 22.1L26.2 15.5"
        stroke={`url(#${goldGradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Provincial star accent */}
      <circle cx="20" cy="9.2" r="1.4" fill="#FCD34D" />
    </svg>
  );
};
