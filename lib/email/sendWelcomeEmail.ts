import { Resend } from "resend";

export async function sendWelcomeEmail(email: string, name?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const resend = new Resend(apiKey);

  const displayName = name?.trim() || "there";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://studypilot.online"}/dashboard`;

  const html = `
  <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fb; color: #0b1021; padding: 32px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);">
      <div style="text-align: center; margin-bottom: 12px;">
        <img src="https://studypilot.online/logo.png" alt="StudyPilot logo" width="48" height="48" style="display:block; margin:0 auto 8px;" />
        <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #64748b; margin: 0;">StudyPilot</p>
      </div>
      <h1 style="font-size: 24px; margin: 0 0 12px; color: #0b1021; text-align:center;">Welcome, ${displayName}</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #324158; margin: 0 0 16px; text-align:center;">
        You're in. Build focused flashcards, quizzes, and plans without distractions. Start with a calm, exam-ready workspace.
      </p>
      <div style="margin: 24px 0; text-align:center;">
        <a
          href="${dashboardUrl}"
          style="display: inline-block; padding: 12px 18px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;"
        >
          Go to your dashboard
        </a>
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0; text-align:center;">
        If you have any questions, reach us at support@studypilot.online.
      </p>
    </div>
  </div>
`;

  return resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: email,
    subject: "Welcome to StudyPilot",
    html
  });
}
