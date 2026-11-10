export function K9Dog({ size = 120 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="animate-bounce-dog"
      >
        {/* Left ear */}
        <g className="origin-bottom-right animate-ear-left" style={{ transformOrigin: "38px 35px" }}>
          <ellipse cx="32" cy="30" rx="10" ry="18" fill="#0d9459" transform="rotate(-15 32 30)" />
          <ellipse cx="33" cy="33" rx="6" ry="12" fill="#16b870" transform="rotate(-15 33 33)" />
        </g>
        {/* Right ear */}
        <g className="origin-bottom-left animate-ear-right" style={{ transformOrigin: "82px 35px" }}>
          <ellipse cx="88" cy="30" rx="10" ry="18" fill="#0d9459" transform="rotate(15 88 30)" />
          <ellipse cx="87" cy="33" rx="6" ry="12" fill="#16b870" transform="rotate(15 87 33)" />
        </g>
        {/* Head */}
        <circle cx="60" cy="50" r="28" fill="#16b870" />
        <circle cx="60" cy="50" r="28" fill="none" stroke="#0d9459" strokeWidth="1.5" />
        {/* Snout */}
        <ellipse cx="60" cy="65" rx="18" ry="14" fill="#3bd68b" />
        {/* Eyes */}
        <g className="animate-blink-eyes" style={{ transformOrigin: "48px 45px" }}>
          <circle cx="48" cy="45" r="5" fill="#042c1e" />
          <circle cx="49" cy="44" r="1.5" fill="white" />
        </g>
        <g className="animate-blink-eyes" style={{ transformOrigin: "72px 45px", animationDelay: "0.1s" }}>
          <circle cx="72" cy="45" r="5" fill="#042c1e" />
          <circle cx="73" cy="44" r="1.5" fill="white" />
        </g>
        {/* Nose */}
        <ellipse cx="60" cy="60" rx="6" ry="5" fill="#042c1e" className="animate-nose-sniff" style={{ transformOrigin: "60px 60px" }} />
        {/* Tongue */}
        <g className="animate-pant-tongue" style={{ transformOrigin: "60px 72px" }}>
          <ellipse cx="60" cy="74" rx="4" ry="6" fill="#ef4444" />
        </g>
        {/* Body hint */}
        <ellipse cx="60" cy="100" rx="22" ry="8" fill="#0d9459" opacity="0.15" />
        {/* Tail */}
        <g className="animate-tail-wag" style={{ transformOrigin: "88px 55px" }}>
          <path d="M 85 55 Q 100 40 105 30" stroke="#0d9459" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function WalkingPaws({ count = 3 }: { count?: number }) {
  const paws = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      {paws.map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-6 w-6 text-primary-400 animate-paw-walk"
          style={{ animationDelay: `${i * 0.5}s` }}
          fill="currentColor"
        >
          <circle cx="6" cy="8" r="3" />
          <circle cx="12" cy="6" r="3" />
          <circle cx="18" cy="8" r="3" />
          <ellipse cx="12" cy="16" rx="5" ry="4" />
        </svg>
      ))}
    </div>
  );
}
