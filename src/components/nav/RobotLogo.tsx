export function HubLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="46" height="46" rx="11" fill="#0B0C10" stroke="#2A2F3A" strokeWidth="1.5" />
      <circle cx="16" cy="39" r="2.5" fill="#4D8AF0" />
      <circle cx="26" cy="39" r="2.5" fill="#4D8AF0" />
      <rect x="10" y="31" width="22" height="6" rx="2" fill="#4D8AF0" />
      <line x1="21" y1="32" x2="14" y2="20" stroke="#F0509A" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="14" y1="20" x2="28" y2="12" stroke="#F0509A" strokeWidth="4.2" strokeLinecap="round" />
      <circle cx="21" cy="32" r="3.2" fill="#F0509A" />
      <circle cx="14" cy="20" r="3.2" fill="#F0509A" />
      <circle cx="28" cy="12" r="3.6" fill="#F0509A" />
      <circle cx="28" cy="12" r="1.4" fill="#0B0C10" />
      <line x1="33.5" y1="10" x2="38.5" y2="10" stroke="#4D8AF0" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="36" y1="7.5" x2="36" y2="12.5" stroke="#4D8AF0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function RobotLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#0a0a0a" />
      <line x1="16" y1="4" x2="16" y2="7.5" stroke="#ec4899" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="3.4" r="1.5" fill="#ec4899" />
      <line x1="8" y1="13" x2="5.5" y2="13" stroke="#ec4899" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="24" y1="13" x2="26.5" y2="13" stroke="#ec4899" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="8" y="8.5" width="16" height="13" rx="4" stroke="#ec4899" strokeWidth="1.8" />
      <circle cx="12.6" cy="15" r="1.6" fill="#ec4899" />
      <circle cx="19.4" cy="15" r="1.6" fill="#ec4899" />
      <line x1="12.3" y1="18.4" x2="19.7" y2="18.4" stroke="#ec4899" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
