import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  const html = `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0b1021; color: #e8edf5; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; background: #0f172a; border: 1px solid #1c2740; border-radius: 12px; padding: 24px;">
        <p style="font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: #9fb0c5; margin: 0 0 8px;">StudyPilot</p>
        <h1 style="font-size: 24px; margin: 0 0 12px; color: #e8edf5;">Welcome to StudyPilot</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #c7d2e4; margin: 0 0 16px;">
          You’re in. Build focused flashcards, quizzes, and plans without distractions. Start with a calm, exam-ready workspace.
        </p>
        <div style="margin: 20px 0;">
          <a
            href="https://studypilot.online"
            style="display: inline-block; padding: 12px 18px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;"
          >
            Go to StudyPilot
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.6; color: #9fb0c5; margin: 0;">
          If you have any questions, reach us at support@studypilot.online.
        </p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: email,
    subject: "Welcome to StudyPilot 🚀",
    html
  });
}
