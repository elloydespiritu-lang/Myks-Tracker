import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Myks Tracker - Money to the Moon Logo"
    >
      <defs>
        {/* Deep space background gradient */}
        <radialGradient id="deepSpace" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#2d3748' }} />
          <stop offset="100%" style={{ stopColor: '#1a202c' }} />
        </radialGradient>

        {/* Golden metallic gradient for the rocket */}
        <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fef08a' }} />
          <stop offset="50%" style={{ stopColor: '#facc15' }} />
          <stop offset="100%" style={{ stopColor: '#ca8a04' }} />
        </linearGradient>

        {/* Gradient for the rocket's fiery exhaust */}
        <linearGradient id="rocketFire" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa' }} />
          <stop offset="100%" style={{ stopColor: '#2563eb' }} />
        </linearGradient>
        
        {/* Filter for a subtle, deep drop shadow */}
        <filter id="rocketShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx="15" fill="url(#deepSpace)" />
      
      {/* Stars */}
      <circle cx="15" cy="20" r="1.2" fill="white" opacity="0.8"/>
      <circle cx="85" cy="60" r="1" fill="white" opacity="0.7"/>
      <circle cx="60" cy="15" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="30" cy="80" r="1" fill="white" opacity="0.9"/>
      <circle cx="90" cy="90" r="0.6" fill="white" opacity="0.5"/>
      <circle cx="10" cy="50" r="0.7" fill="white" opacity="0.8"/>

      {/* The Moon */}
      <g transform="translate(65, 15)">
        <circle cx="0" cy="0" r="14" fill="#e2e8f0" />
        <circle cx="-5" cy="-3" r="4" fill="#94a3b8" opacity="0.2" />
        <circle cx="4" cy="5" r="2.5" fill="#94a3b8" opacity="0.2" />
        <circle cx="6" cy="-4" r="1.5" fill="#94a3b8" opacity="0.15" />
      </g>

      {/* Rocket Group */}
      <g transform="translate(10, -5) rotate(-20 50 50)" filter="url(#rocketShadow)">
        
        {/* Rocket Fire */}
        <path d="M 45,85 C 40,95 60,95 55,85 L 50,70 Z" fill="url(#rocketFire)" />
        
        {/* Rocket Body (Currency Symbol) */}
        <path 
            d="M 50,15 
               C 65,15 65,30 50,30 
               C 35,30 35,45 50,45 
               L 50,75 
               C 35,75 35,60 50,60 
               C 65,60 65,45 50,45"
            fill="none"
            stroke="url(#goldMetal)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};