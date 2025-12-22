export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.14),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
