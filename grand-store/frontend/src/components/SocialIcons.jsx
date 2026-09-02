import React from 'react';

const SvgIcon = ({ children, size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

export const FacebookIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </SvgIcon>
);

export const TwitterIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </SvgIcon>
);

export const InstagramIcon = (props) => (
  <SvgIcon {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </SvgIcon>
);

export const YoutubeIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </SvgIcon>
);

export const PinterestIcon = (props) => (
  <SvgIcon {...props}>
    <line x1="12" y1="22" x2="12" y2="22" />
    <path d="M12 2C6.48 2 2 6.48 2 12a9.98 9.98 0 0 0 4.25 8.2c-.1-.7-.2-1.78.04-2.55.21-.68 1.35-4.32 1.35-4.32s-.34-.69-.34-1.71c0-1.6.93-2.8 2.08-2.8 1.04 0 1.54.78 1.54 1.72 0 1.04-.66 2.6-.99 4.04-.28 1.21.6 2.2 1.8 2.2 2.16 0 3.82-2.28 3.82-5.57 0-2.92-2.1-4.96-5.1-4.96-3.48 0-5.52 2.61-5.52 5.3 0 1.04.4 2.16.9 2.77.1.12.11.23.08.35-.09.38-.3 1.22-.34 1.4-.05.21-.18.25-.4.15-1.5-.7-2.44-2.9-2.44-4.67 0-3.8 2.76-7.3 7.98-7.3 4.18 0 7.42 2.98 7.42 6.96 0 4.16-2.62 7.5-6.26 7.5-1.22 0-2.37-.64-2.76-1.39 0 0-.6 2.3-.75 2.87-.27 1.02-.99 2.3-1.48 3.08A9.98 9.98 0 0 0 12 22z" />
  </SvgIcon>
);

export const TiktokIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </SvgIcon>
);
