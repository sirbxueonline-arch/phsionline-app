"use client";

export default function PrivacyPage() {
  const sections = [
    {
      title: "What we collect",
      items: [
        "Account info: email, name if provided",
        "Usage data: how you use StudyPilot features",
        "Study content: notes you add and generated items"
      ]
    },
    {
      title: "What we do not collect",
      items: ["We do not sell your data", "We do not track unrelated activity outside StudyPilot"]
    },
    {
      title: "How we use data",
      items: [
        "To create and improve your study materials",
        "To keep the service reliable and secure",
        "To understand feature usage and improve the product"
      ]
    },
    {
      title: "Cookies",
      items: ["We use minimal, functional cookies for authentication and basic performance."]
    },
    {
      title: "Third-party services",
      items: ["Authentication and hosting providers that help us run StudyPilot"]
    },
    {
      title: "Your rights",
      items: ["Access your data", "Request deletion of your account and data", "Contact us with questions"]
    },
    {
      title: "Contact",
      items: ["Reach us at privacy@studypilot.online."]
    }
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-text-primary">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Privacy Policy</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Your data, handled with care.</h1>
        <p className="text-text-muted">Short, clear statements about how we treat your information.</p>
      </header>

      <section className="mt-10 space-y-8 text-base leading-relaxed text-text-primary">
        {sections.map((section) => (
          <article key={section.title} className="space-y-2">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <ul className="space-y-1 text-text-muted">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
