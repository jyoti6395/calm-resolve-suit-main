import logo from "@/assets/logo.png";

export function Logo({ size = 72, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {animated && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring"
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}
      <div className="relative rounded-2xl bg-white p-2 shadow-elevated">
        <img
          src={logo}
          alt="AdviseTech"
          style={{ width: size - 16, height: size - 16 }}
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return <img src={logo} alt="AdviseTech" className={className} />;
}
