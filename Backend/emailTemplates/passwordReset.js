// Simple, dependency-free HTML email template for the password reset flow
module.exports = function passwordResetTemplate({ firstName, resetUrl }) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #4F46E5;">Reset your password</h2>
    <p>Hi ${firstName || 'there'},</p>
    <p>We received a request to reset your Expense Tracker password. Click the button below to choose a new one. This link expires shortly for your security.</p>
    <p style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: #4F46E5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reset Password
        </a>
    </p>
    <p style="color: #64748B; font-size: 13px;">
        If you didn't request this, you can safely ignore this email — your password will remain unchanged.
    </p>
    <p style="color: #94A3B8; font-size: 12px; word-break: break-all;">${resetUrl}</p>
    </div>`;
};