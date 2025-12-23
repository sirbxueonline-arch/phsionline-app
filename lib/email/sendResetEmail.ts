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

  await resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: [email],
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
    `
  });
}
