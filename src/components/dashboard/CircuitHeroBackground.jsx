import React from 'react';

const CIRCUIT_ART = {
  suzuka: {
    viewBox: '0 0 960 640',
    path: 'M242 468C208 445 178 406 167 364C156 323 162 281 186 246C208 214 244 193 282 193C324 193 357 219 368 257C378 292 369 326 340 355C319 376 295 396 283 423C270 451 273 481 290 507C310 537 347 557 389 564C436 572 485 564 525 540C563 518 588 484 595 445C602 406 592 367 563 332C541 304 511 284 480 265C448 246 425 222 422 191C418 158 435 129 464 111C499 89 544 89 586 106C629 124 670 155 707 200C744 245 767 297 773 352C779 402 770 448 744 490C718 533 677 567 622 590C565 613 503 620 445 611C387 603 335 579 294 543C274 526 256 501 242 468Z',
    startFinish: { x: 454, y: 115, width: 22, height: 52, angle: -12 },
  },
  generic: {
    viewBox: '0 0 960 640',
    path: 'M191 430C173 377 181 321 214 273C248 222 304 186 381 166C461 145 542 146 623 170C698 193 755 233 793 291C828 345 837 401 818 460C798 520 755 564 687 592C620 620 543 628 457 615C371 603 301 573 247 526C223 505 204 472 191 430Z',
    startFinish: { x: 676, y: 198, width: 24, height: 56, angle: 18 },
  },
};

function normalize(value = '') {
  return value.toString().toLowerCase();
}

function resolveCircuitKey(...candidates) {
  const text = candidates.filter(Boolean).map(normalize).join(' ');

  if (text.includes('suzuka') || text.includes('japan') || text.includes('japanese grand prix')) {
    return 'suzuka';
  }

  return 'generic';
}

function StartFinish({ marker }) {
  if (!marker) return null;

  const { x, y, width, height, angle } = marker;
  const half = width / 2;
  const left = x - half;

  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <rect x={left} y={y - height / 2} width={width} height={height} rx="5" fill="rgba(255,255,255,0.92)" opacity="0.96" />
      <rect x={left} y={y - height / 2} width={half} height={height / 2} rx="4" fill="#E10600" />
      <rect x={x} y={y - height / 2} width={half} height={height / 2} rx="4" fill="#11111A" />
      <rect x={left} y={y} width={half} height={height / 2} rx="4" fill="#11111A" />
      <rect x={x} y={y} width={half} height={height / 2} rx="4" fill="#E10600" />
    </g>
  );
}

export default function CircuitHeroBackground({ meetingName, location, country }) {
  const key = resolveCircuitKey(meetingName, location, country);
  const art = CIRCUIT_ART[key] || CIRCUIT_ART.generic;

  return (
    <div className="dashboard__hero-track" aria-hidden="true">
      <svg
        className="dashboard__hero-track-svg"
        viewBox={art.viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" result="blur" />
          </filter>
          <linearGradient id="trackStroke" x1="180" y1="120" x2="790" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.78" />
            <stop offset="0.52" stopColor="#F2DCE0" stopOpacity="0.52" />
            <stop offset="1" stopColor="#E10600" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="trackInner" x1="220" y1="158" x2="760" y2="548" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <path className="dashboard__hero-track-shadow" d={art.path} />
        <path className="dashboard__hero-track-glow" d={art.path} filter="url(#trackGlow)" />
        <path className="dashboard__hero-track-line" d={art.path} />
        <path className="dashboard__hero-track-line dashboard__hero-track-line--inner" d={art.path} />
        <path className="dashboard__hero-track-line dashboard__hero-track-line--guide" d={art.path} />
        <StartFinish marker={art.startFinish} />

        <circle cx="780" cy="102" r="7" className="dashboard__hero-track-dot" />
        <circle cx="822" cy="138" r="5" className="dashboard__hero-track-dot dashboard__hero-track-dot--muted" />
        <circle cx="862" cy="176" r="4" className="dashboard__hero-track-dot dashboard__hero-track-dot--muted" />

        <path d="M610 116H760" className="dashboard__hero-track-accent" />
        <path d="M662 556H848" className="dashboard__hero-track-ground" />
        <path d="M638 584H824" className="dashboard__hero-track-ground dashboard__hero-track-ground--dashed" />

        <path d={art.path} stroke="url(#trackStroke)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path d={art.path} stroke="url(#trackInner)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
      </svg>
    </div>
  );
}
