import { adminAuth } from "@/lib/firebase/admin";
import { resend } from "@/lib/email/resend";

export async function sendVerifyEmail(email: string) {
  if (!adminAuth) {
    throw new Error("Firebase admin is not configured");
  }

  const link = await adminAuth.generateEmailVerificationLink(email, {
    url: "https://studypilot.online/verified"
  });

  await resend.emails.send({
    from: "StudyPilot Support <support@studypilot.online>",
    to: [email],
    subject: "Verify your email",
    html: `
      <p>Welcome to StudyPilot.</p>
      <p>Please verify your email to continue.</p>
      <p><a href="${link}">Verify email</a></p>
    `
  });
}
