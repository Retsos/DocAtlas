export function GreeceFlagIcon({
  className = "h-5 w-7",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={`${className} rounded-sm`}
      aria-hidden="true"
    >
      <rect width="24" height="16" fill="#0D5EAF" />
      <rect y="1.78" width="24" height="1.78" fill="#fff" />
      <rect y="5.33" width="24" height="1.78" fill="#fff" />
      <rect y="8.89" width="24" height="1.78" fill="#fff" />
      <rect y="12.44" width="24" height="1.78" fill="#fff" />
      <rect width="10.67" height="8.89" fill="#0D5EAF" />
      <rect x="4.44" width="1.78" height="8.89" fill="#fff" />
      <rect y="3.56" width="10.67" height="1.78" fill="#fff" />
    </svg>
  );
}

export function UKFlagIcon({ className = "h-5 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={`${className} rounded-sm`}
      aria-hidden="true"
    >
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.4" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}
