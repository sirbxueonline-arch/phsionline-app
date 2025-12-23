import { adminAuth } from "@/lib/firebase/admin";
import { resend } from "@/lib/email/resend";

export async function sendResetEmail(email: string) {
  if (!adminAuth) {
    throw new Error("Firebase admin is not configured");
  }

  const fallbackSiteUrl = "https://studypilot.online";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
  const link = await adminAuth.generatePasswordResetLink(email, {
    url: `${siteUrl.replace(/\/$/, "")}/reset`
  });

  let resetUrl = link;
  try {
    const url = new URL(link);
    const oobCode = url.searchParams.get("oobCode");
    if (oobCode) {
      const base = siteUrl.replace(/\/$/, "");
      resetUrl = `${base}/reset?oobCode=${encodeURIComponent(oobCode)}&mode=resetPassword`;
    }
  } catch (err) {
    console.warn("Failed to parse reset link, falling back to default", err);
  }

  const html = `
  <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fb; color: #0b1021; padding: 32px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);">
      <div style="text-align: center; margin-bottom: 12px;">
        <img src="${siteUrl.replace(/\/$/, "")}/logo.png" alt="StudyPilot logo" width="48" height="48" style="display:block; margin:0 auto 8px;" />
        <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #64748b; margin: 0;">StudyPilot</p>
      </div>
      <h1 style="font-size: 22px; margin: 0 0 12px; color: #0b1021; text-align:center;">Reset your password</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #324158; margin: 0 0 16px; text-align:center;">
        Tap the button below to choose a new password. This link expires soon to keep your account safe.
      </p>
      <div style="margin: 24px 0; text-align:center;">
        <a
          href="${resetUrl}"
          style="display: inline-block; padding: 12px 18px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;"
        >
          Reset password
        </a>
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 8px; text-align:center;">
        If the button does not work, copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color: #7c3aed;">${resetUrl}</a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 12px 0 0; text-align:center;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: [email],
    subject: "Reset your password",
    html
  });
}
