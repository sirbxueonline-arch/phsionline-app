"use client";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of terms",
      body:
        "By using StudyPilot, you agree to these terms. If you do not agree, please do not use the service."
    },
    {
      title: "Who can use StudyPilot",
      body:
        "StudyPilot is for students and parents preparing for exams. You must be able to create an account and comply with local laws."
    },
    {
      title: "User responsibilities",
      body:
        "Use StudyPilot for legitimate learning. Do not misuse the service, disrupt others, or attempt to harm the platform."
    },
    {
      title: "Content ownership",
      body:
        "You own the content you add. We process it to deliver study materials, but we do not claim ownership of your notes or generated items."
    },
    {
      title: "Service availability",
      body:
        "We aim for reliable access but cannot guarantee uptime. Features may change or be limited."
    },
    {
      title: "Account termination",
      body:
        "We may suspend or terminate accounts that violate these terms. You can delete your account at any time."
    },
    {
      title: "Changes to terms",
      body:
        "We may update these terms to improve clarity or reflect product changes. We will post updates here with a revised date."
    },
    {
      title: "Contact",
      body:
        "Questions? Reach us at support@studypilot.online."
    }
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-text-primary">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Terms of Service</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Clear terms for focused study.</h1>
        <p className="text-text-muted">
          Plain language so you know how StudyPilot works.
        </p>
      </header>

      <section className="mt-10 space-y-8 text-base leading-relaxed text-text-primary">
        {sections.map((section) => (
          <article key={section.title} className="space-y-2">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="text-text-muted">{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
