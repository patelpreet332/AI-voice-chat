export function ChatHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-3 group cursor-default">
        <div className="w-8 h-8 rounded-lg premium-gradient shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300" />
        <h1 className="text-xl font-bold tracking-tight text-white">
          Smt-dev<span className="text-primary text-glow">.</span>
        </h1>
      </div>
    </header>
  );
}
