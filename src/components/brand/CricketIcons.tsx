/**
 * Authentic Professional Cricket Icons & Marks
 * Crisp, scalable SVG vector graphics designed exclusively for Mahi Crick Pro
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Authentic Cricket Bat Icon (Willow blade, wrapped rubber handle, grip splice)
 */
export const CricketBatIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M18.8 3.2C19.2 2.8 19.8 2.8 20.2 3.2L20.8 3.8C21.2 4.2 21.2 4.8 20.8 5.2L16.2 9.8L14.2 7.8L18.8 3.2Z"
      fill="#F59E0B"
      stroke="#D97706"
      strokeWidth="0.8"
    />
    <path
      d="M14.2 7.8L16.2 9.8L8.8 17.2C7.9 18.1 6.6 18.8 5.4 19.2L3.2 19.8C2.8 19.9 2.5 19.5 2.6 19.2L3.2 17C3.6 15.8 4.3 14.5 5.2 13.6L14.2 7.8Z"
      fill="#FDE68A"
      stroke="#B45309"
      strokeWidth="1"
    />
    <line x1="8.5" y1="12.5" x2="10" y2="14" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
    <line x1="10.5" y1="10.5" x2="12" y2="12" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/**
 * Authentic Cricket Ball Icon (Red leather, white stitched raised seam)
 */
export const CricketBallIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="12" cy="12" r="9.5" fill="#DC2626" stroke="#991B1B" strokeWidth="1.2" />
    {/* Raised White Seam */}
    <path
      d="M5.5 6C9 9.5 15 14.5 18.5 18"
      stroke="#FEF08A"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeDasharray="2 1.5"
    />
    <path
      d="M7 4.5C10.5 8 16.5 13 20 16.5"
      stroke="#FFFFFF"
      strokeWidth="0.8"
      strokeOpacity="0.8"
    />
  </svg>
);

/**
 * Three Stumps & Bails on Crease
 */
export const WicketsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Ground Crease */}
    <line x1="3" y1="21" x2="21" y2="21" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
    {/* 3 Stumps */}
    <rect x="6.5" y="6" width="2" height="15" rx="0.8" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />
    <rect x="11" y="5.5" width="2" height="15.5" rx="0.8" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />
    <rect x="15.5" y="6" width="2" height="15" rx="0.8" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />
    {/* 2 Bails */}
    <rect x="5.5" y="4.2" width="6" height="1.6" rx="0.8" fill="#FEF08A" stroke="#B45309" strokeWidth="0.6" />
    <rect x="12.5" y="4.2" width="6" height="1.6" rx="0.8" fill="#FEF08A" stroke="#B45309" strokeWidth="0.6" />
  </svg>
);

/**
 * Man of the Match Golden Trophy with Laurel Wreath
 */
export const MotmTrophyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="goldCup" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.6" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
    {/* Cup Bowl */}
    <path
      d="M7 4H17V9.5C17 12.5 14.8 15 12 15C9.2 15 7 12.5 7 9.5V4Z"
      fill="url(#goldCup)"
      stroke="#78350F"
      strokeWidth="0.8"
    />
    {/* Handles */}
    <path
      d="M7 6H4.5C3.7 6 3 6.7 3 7.5V8.5C3 10.4 4.6 12 6.5 12H7"
      stroke="#F59E0B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17 6H19.5C20.3 6 21 6.7 21 7.5V8.5C21 10.4 19.4 12 17.5 12H17"
      stroke="#F59E0B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Stem & Base */}
    <path d="M12 15V18.5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="7.5" y="18.5" width="9" height="3" rx="1.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.8" />
    {/* Star inside cup */}
    <polygon
      points="12,6.5 12.8,8 14.5,8.2 13.2,9.4 13.6,11 12,10.2 10.4,11 10.8,9.4 9.5,8.2 11.2,8"
      fill="#FEF08A"
    />
  </svg>
);

/**
 * Tournament Championship Trophy Cup
 */
export const TournamentCupIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M6 3H18V10C18 13.3 15.3 16 12 16C8.7 16 6 13.3 6 10V3Z"
      fill="#3B82F6"
      stroke="#60A5FA"
      strokeWidth="1.2"
    />
    <path
      d="M6 5H3.5C2.7 5 2 5.7 2 6.5C2 8.7 3.8 10.5 6 10.5"
      stroke="#60A5FA"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18 5H20.5C21.3 5 22 5.7 22 6.5C22 8.7 20.2 10.5 18 10.5"
      stroke="#60A5FA"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M12 16V19" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 19H17V21.5H7V19Z" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1" />
    {/* Shield emblem on cup */}
    <path d="M12 7L14 9V11.5L12 13L10 11.5V9L12 7Z" fill="#FBBF24" />
  </svg>
);

/**
 * Boundary 4 Badge
 */
export const BoundaryFourIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5" />
    <path
      d="M15.5 16.5H13.5V14H8.5V11.5L13.5 6.5H15.5V12.2H17V14H15.5V16.5ZM13.5 12.2V8.8L10.2 12.2H13.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Maximum Six Badge
 */
export const MaximumSixIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#7E22CE" stroke="#C084FC" strokeWidth="1.5" />
    <path
      d="M15.5 8.2V6.5H10.5C9.4 6.5 8.5 7.4 8.5 8.5V14.5C8.5 15.6 9.4 16.5 10.5 16.5H14C15.1 16.5 16 15.6 16 14.5V12.5C16 11.4 15.1 10.5 14 10.5H10.5V8.5H15.5V8.2ZM10.5 14.5V12.5H14V14.5H10.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Toss Coin Icon
 */
export const TossCoinIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="12" cy="12" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" stroke="#FEF08A" strokeWidth="1" strokeDasharray="3 2" />
    <text x="12" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">
      ₹
    </text>
  </svg>
);

/**
 * PDF Document Download Icon
 */
export const PdfIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
      fill="#DC2626"
      stroke="#B91C1C"
      strokeWidth="1.2"
    />
    <path d="M14 2V8H20" fill="#991B1B" />
    <path d="M8 14H10C10.6 14 11 13.6 11 13C11 12.4 10.6 12 10 12H8V16H9" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M13 12V16M13 14H15" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
