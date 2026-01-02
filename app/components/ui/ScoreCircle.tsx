const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-[80px] h-[80px]">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="#f5f5f5"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="currentColor" 
          className="text-black"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-sm text-[var(--color-text-primary)]">{`${score}`}</span>
        
      </div>
    </div>
  );
};

export default ScoreCircle;