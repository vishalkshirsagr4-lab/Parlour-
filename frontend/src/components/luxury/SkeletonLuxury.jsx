export default function SkeletonLuxury({ className = '', rounded = 'rounded-3xl' }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/10 ${rounded} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

