export const styles = {
    container: `
        font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        max-width: 600px;
        margin: 40px auto;
        padding: 40px;
        background-color: #ffffff;
        color: #333333;
        line-height: 1.6;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    `,
    header: `
        padding-bottom: 24px;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 32px;
        text-align: center;
    `,
    logo: `
        font-size: 28px;
        font-weight: 800;
        color: #000000;
        text-decoration: none;
        letter-spacing: -0.5px;
    `,
    h2: `
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 16px;
        color: #111827;
    `,
    text: `
        font-size: 16px;
        color: #4b5563;
        margin-bottom: 24px;
    `,
    button: `
        display: inline-block;
        background-color: #000000;
        color: #ffffff;
        padding: 14px 28px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        margin: 24px 0;
        text-align: center;
        transition: background-color 0.2s;
    `,
    footer: `
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
        font-size: 14px;
        color: #9ca3af;
        text-align: center;
    `
};

const commonFooter = `
    <div style="${styles.footer}">
        <p style="margin: 0 0 8px 0;">VulnTrack Security Platform</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} VulnTrack. All rights reserved.</p>
    </div>
`;

export function getInvitationEmail(inviteLink: string) {
    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${styles.logo}">VulnTrack</a>
            </div>
            <h2 style="${styles.h2}">You've been invited to join the team</h2>
            <p style="${styles.text}">An administrator has invited you to collaborate on handling security vulnerabilities in VulnTrack.</p>
            <p style="${styles.text}">Click the button below to accept your invitation and create your account:</p>
            
            <div style="text-align: center;">
                <a href="${inviteLink}" style="${styles.button}">Accept Invitation</a>
            </div>
            
            <p style="${styles.text}; font-size: 14px; color: #6b7280; margin-top: 24px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
            </p>
            
            <p style="${styles.text}; font-size: 14px; color: #ef4444; margin-top: 16px;">
                This invitation will expire in 24 hours.
            </p>
            
            ${commonFooter}
        </div>
    `;
}

export function getPasswordResetEmail(resetLink: string) {
    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${styles.logo}">VulnTrack</a>
            </div>
            <h2 style="${styles.h2}">Reset your password</h2>
            <p style="${styles.text}">We received a request to reset the password for your VulnTrack account.</p>
            <p style="${styles.text}">Click the button below to set a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" style="${styles.button}">Reset Password</a>
            </div>
            
            <p style="${styles.text}; font-size: 14px; color: #6b7280; margin-top: 24px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
            </p>
            
            <p style="${styles.text}; font-size: 14px; color: #6b7280; margin-top: 16px;">
                If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
            </p>
            
            ${commonFooter}
        </div>
    `;
}

export function getAssignmentEmail(vulnerabilityTitle: string, vulnerabilityId: string) {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vulnerabilities/${vulnerabilityId}`;
    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${styles.logo}">VulnTrack</a>
            </div>
            <h2 style="${styles.h2}">New Assignment</h2>
            <p style="${styles.text}">You have been assigned to remediate the following vulnerability:</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-weight: 600; color: #1f2937;">${vulnerabilityTitle}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">ID: ${vulnerabilityId}</p>
            </div>
            
            <p style="${styles.text}">Please review the details and start the remediation process.</p>
            
            <div style="text-align: center;">
                <a href="${link}" style="${styles.button}">View Vulnerability</a>
            </div>
            
            ${commonFooter}
        </div>
    `;
}
