import React from 'react';

interface MeltingTextProps {
  text?: string;
  className?: string;
}

export const MeltingText: React.FC<MeltingTextProps> = ({
  text = 'Melting',
  className = '',
}) => {
  // Realistic droplet drip points located at the natural bottom tips of "Melting"
  const drops = [
    { id: 1, left: '8%', delay: '0.2s', duration: '3.4s', size: 'w-[4px] h-[7px]' },
    { id: 2, left: '23%', delay: '1.9s', duration: '3.9s', size: 'w-[3px] h-[6px]' },
    { id: 3, left: '46%', delay: '0.8s', duration: '3.6s', size: 'w-[4px] h-[8px]' },
    { id: 4, left: '62%', delay: '2.8s', duration: '4.2s', size: 'w-[3.5px] h-[7px]' },
    { id: 5, left: '78%', delay: '1.4s', duration: '3.8s', size: 'w-[4px] h-[7.5px]' },
    { id: 6, left: '92%', delay: '2.3s', duration: '3.5s', size: 'w-[3px] h-[6px]' },
  ];

  return (
    <span className={`relative inline-block select-none overflow-visible align-baseline ${className}`}>
      {/* 1. Base Crystalline Ice Typography with Multi-Tone Glacier Gradient */}
      <span className="relative z-10 inline-block font-display italic tracking-normal text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#cbf0fa] to-[#5cbddc] drop-shadow-[0_0_24px_rgba(126,200,227,0.55)] animate-iceThawCycle">
        {text}
      </span>

      {/* 2. Liquid Caustic Water Sheen Wave (Shimmering across the letterforms) */}
      <span
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none font-display italic tracking-normal text-transparent bg-clip-text bg-[length:220%_100%] bg-gradient-to-r from-transparent via-white/85 to-transparent animate-causticSheen"
      >
        {text}
      </span>

      {/* 3. Deep Ice Atmospheric Luminescence Bloom */}
      <span
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none font-display italic tracking-normal text-[#7ec8e3]/35 blur-md animate-iceGlowPulse"
      >
        {text}
      </span>

      {/* 4. Sub-zero Glacial Condensation Mist at Baseline */}
      <div
        aria-hidden="true"
        className="absolute -bottom-3 left-[-10%] right-[-10%] h-10 pointer-events-none bg-radial from-[#7ec8e3]/25 via-[#7ec8e3]/5 to-transparent blur-md animate-glacierMist"
      />

      {/* 5. Physical Water Droplet Drips System */}
      <div
        aria-hidden="true"
        className="absolute bottom-[2px] left-0 right-0 h-0 pointer-events-none overflow-visible z-30"
      >
        {drops.map((drop) => (
          <span
            key={drop.id}
            style={{
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
            }}
            className={`absolute top-0 -translate-x-1/2 ${drop.size} rounded-full bg-gradient-to-b from-white via-[#bcebf7] to-[#5cbddc] shadow-[0_0_10px_rgba(188,235,247,0.95)] animate-waterDrip`}
          />
        ))}
      </div>
    </span>
  );
};
