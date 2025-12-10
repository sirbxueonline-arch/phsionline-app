export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
