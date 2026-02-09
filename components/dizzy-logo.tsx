export function DizzyLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#F5AFAF" />
      <circle cx="20" cy="20" r="11" fill="#FCF8F8" />
      <circle cx="20" cy="20" r="7" fill="#F9DFDF" />
      <circle cx="20" cy="20" r="3.5" fill="#F5AFAF" />
    </svg>
  )
}
