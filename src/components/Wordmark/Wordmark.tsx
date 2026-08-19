interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <span
      className={`font-[family-name:var(--font-wordmark)] leading-none font-normal tracking-wide text-[#5fd8c4] [-webkit-text-stroke:1.5px_#0e3a17] [paint-order:stroke_fill] [text-shadow:0_0_2px_rgba(14,58,23,0.5),0_0_6px_rgba(63,156,44,0.3)] ${className}`}
    >
      Rick &amp; Morty
    </span>
  );
}
