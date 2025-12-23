import { adminAuth } from "@/lib/firebase/admin";
import { resend } from "@/lib/email/resend";

export async function sendResetEmail(email: string) {
  if (!adminAuth) {
    throw new Error("Firebase admin is not configured");
  }

  const link = await adminAuth.generatePasswordResetLink(email, {
    url: "https://studypilot.online/reset-complete"
  });

  await resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: [email],
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password.</p>
      <p><a href="${link}">Reset password</a></p>
    `
  });
}
