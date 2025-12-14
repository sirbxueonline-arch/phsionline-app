export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
