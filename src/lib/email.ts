import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn("⚠️ RESEND_API_KEY is missing. Emails will not be sent.");
}

const resend = new Resend(resendApiKey);

// Default sender email - needs to be verified in Resend
// User mentioned setting up 'vulntrack.org', so we assume a default like 'noreply@vulntrack.org' or 'system@vulntrack.org'
// We will make this configurable or default to "onboarding@resend.dev" for testing if domain not ready, 
// but user said "fully created domain", so let's use a real one.
const FROM_EMAIL = process.env.EMAIL_FROM || 'VulnTrack System <system@vulntrack.org>';

export async function sendEmail({
    to,
    subject,
    html,
    text
}: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}) {
    if (!resendApiKey) {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
        console.log(`[MOCK EMAIL] HTML Preview: ${html.substring(0, 100)}...`);
        return { success: true, mock: true };
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
            text, // Optional plaintext alternative
        });

        if (data.error) {
            console.error("Resend API Error:", data.error);
            return { success: false, error: data.error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: "Failed to send email" };
    }
}
