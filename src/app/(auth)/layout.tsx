export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-steel-950 via-steel-900 to-brand-900/20" />
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  );
}
