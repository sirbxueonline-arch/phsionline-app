import { resend } from "@/lib/email/resend";

export async function sendVerifyCodeEmail(email: string, code: string, siteUrl?: string) {
  const baseSite = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://studypilot.online").replace(/\/$/, "");
  const html = `
  <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fb; color: #0b1021; padding: 32px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);">
      <div style="text-align: center; margin-bottom: 12px;">
        <img src="${baseSite}/logo.png" alt="StudyPilot logo" width="48" height="48" style="display:block; margin:0 auto 8px;" />
        <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #64748b; margin: 0;">StudyPilot</p>
      </div>
      <h1 style="font-size: 22px; margin: 0 0 12px; color: #0b1021; text-align:center;">Verify your email</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #324158; margin: 0 0 12px; text-align:center;">
        Enter the code below to confirm your email and unlock your StudyPilot workspace.
      </p>
      <div style="margin: 20px auto; text-align:center; font-size: 26px; font-weight: 700; letter-spacing: 0.24em; color: #0b1021; background: #f4f5fb; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 14px 12px; max-width: 260px;">
        ${code}
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 12px 0 0; text-align:center;">
        If you did not create an account, you can ignore this email.
      </p>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: [email],
    subject: "Your StudyPilot verification code",
    html
  });
}
