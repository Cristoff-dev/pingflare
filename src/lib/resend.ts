import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOutageAlert(
  serviceName: string,
  serviceUrl: string,
  statusCode: number
) {
  try {
    await resend.emails.send({
      from: "Pingflare <alerts@pingflare.com>",
      to: process.env.ALERT_EMAIL_ADDRESS!,
      subject: `🚨 OUTAGE DETECTED: ${serviceName}`,
      html: `
        <h2>Critical Service Outage</h2>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>URL:</strong> ${serviceUrl}</p>
        <p><strong>Status Code:</strong> ${statusCode}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });
  } catch (error) {
    console.error(`Alert dispatch failed for ${serviceName}:`, error);
  }
}

export async function sendRecoveryAlert(
  serviceName: string,
  serviceUrl: string,
  downtimeMinutes: number
) {
  try {
    await resend.emails.send({
      from: "Pingflare <alerts@pingflare.com>",
      to: process.env.ALERT_EMAIL_ADDRESS!,
      subject: `✅ RECOVERED: ${serviceName}`,
      html: `
        <h2>Service Restored</h2>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>URL:</strong> ${serviceUrl}</p>
        <p><strong>Estimated Downtime:</strong> ${downtimeMinutes} minutes</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });
  } catch (error) {
    console.error(`Recovery dispatch failed for ${serviceName}:`, error);
  }
}