export function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      {/* Top-left indigo blob */}
      <div className="absolute rounded-full -top-[10%] left-[6%] w-[420px] h-[420px] bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)] blur-[32px] transform-gpu" />
      
      {/* Bottom-right green blob */}
      <div className="absolute rounded-full -bottom-[8%] right-[2%] w-[360px] h-[360px] bg-[radial-gradient(circle,rgba(34,197,94,0.10)_0%,transparent_70%)] blur-[28px] transform-gpu" />
      
      {/* Mid amber accent */}
      <div className="absolute rounded-full top-[38%] right-[20%] w-[240px] h-[240px] bg-[radial-gradient(circle,rgba(245,158,11,0.07)_0%,transparent_70%)] blur-[24px] transform-gpu" />

      {/* Dot Grid */}
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle,rgba(148,163,184,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />

      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.028] [background-size:64px_64px]"
        style={{ backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAADFBMVEUAAAD///////////84wDuoAAAABHRSTlMAgICAfBFTMAAAADNJREFUeNpjYBgFgx8AAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAPsABAABAAF/AAAAAElFTkSuQmCC")` }}
      />
    </div>
  );
}