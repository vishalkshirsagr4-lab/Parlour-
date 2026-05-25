export default function PageBackground({ children }) {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-luxury-dark dark:text-white">
      {/* Minimal, clean white background with very subtle ambient tint */}
      <div className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 w-[40rem] h-[40rem] -translate-x-1/2 bg-rose-pink/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] bg-purple-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-rose-pink/5 dark:from-gray-950 dark:via-gray-950 dark:to-rose-pink/10" />
      </div>
      {children}
    </div>
  )
}

