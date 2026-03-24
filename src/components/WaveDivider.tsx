const WaveDivider = ({ flip = false, className = "" }: { flip?: boolean; className?: string }) => (
  <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="w-full h-[60px] md:h-[100px]"
    >
      {/* Back wave — slow drift */}
      <path
        d="M0,64 C240,120 480,0 720,64 C960,128 1200,0 1440,64 L1440,120 L0,120 Z"
        className="fill-current text-[hsl(var(--ocean-mid))]"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -60,4; 0,0"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>

      {/* Mid wave — medium sway */}
      <path
        d="M0,80 C320,20 640,110 960,60 C1120,35 1280,80 1440,80 L1440,120 L0,120 Z"
        className="fill-current text-[hsl(var(--ocean-to))]"
        opacity="0.6"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 50,-3; 0,0"
          dur="6s"
          repeatCount="indefinite"
        />
      </path>

      {/* Front wave — gentle bob */}
      <path
        d="M0,96 C180,70 420,110 720,85 C1020,60 1260,100 1440,90 L1440,120 L0,120 Z"
        className="fill-current text-background"
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -40,2; 0,0"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
);

export default WaveDivider;
