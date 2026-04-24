import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

let transporter = null;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

const baseStyle = `
  body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; color: #111827; line-height: 1.5; }
  .box { max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  p { margin: 0 0 12px; color: #374151; }
  .muted { color: #6b7280; font-size: 14px; }
  .btn { display: inline-block; margin-top: 16px; padding: 10px 16px; background: #3857d6; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
`;

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.info(`[email] (not configured) → ${to}: ${subject}`);
    if (text) console.info(text);
    return { skipped: true };
  }
  await t.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text: text || "",
    html,
  });
  return { sent: true };
}

export async function sendWelcomeEmail({ to, firstName }) {
  const name = firstName || "there";
  return sendMail({
    to,
    subject: "Welcome to EthioShop",
    text: `Hi ${name},\n\nThanks for creating an account. We're glad you're here.\n\n— EthioShop`,
    html: `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="box"><h1>Welcome, ${name}</h1><p>Thanks for creating an account. We're glad you're here.</p><p class="muted">You can browse products, place orders, and upload payment proof from your account.</p></div></body></html>`,
  });
}

export async function sendOrderPlacedEmail({ to, firstName, orderId, total }) {
  const name = firstName || "there";
  return sendMail({
    to,
    subject: `Order received — ${String(orderId).slice(-8)}`,
    text: `Hi ${name},\n\nWe received your order (ref ${orderId}). Total: ETB ${total}.\nPlease upload your payment screenshot to complete the process.\n\n— EthioShop`,
    html: `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="box"><h1>Order placed</h1><p>Hi ${name},</p><p>We received your order <strong>#${String(orderId).slice(-8)}</strong>.</p><p>Total: <strong>ETB ${Number(total).toLocaleString()}</strong></p><p>Next step: upload your payment screenshot from the order page so our team can verify it.</p></div></body></html>`,
  });
}

export async function sendPaymentApprovedEmail({ to, firstName, orderId }) {
  const name = firstName || "there";
  return sendMail({
    to,
    subject: `Payment confirmed — order ${String(orderId).slice(-8)}`,
    text: `Hi ${name},\n\nYour payment for order ${orderId} was approved. We'll prepare your shipment soon.\n\n— EthioShop`,
    html: `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="box"><h1>Payment approved</h1><p>Hi ${name},</p><p>Your payment for order <strong>#${String(orderId).slice(-8)}</strong> was confirmed.</p><p class="muted">We'll prepare your order for delivery. You'll get another update when it ships.</p></div></body></html>`,
  });
}

export async function sendPaymentRejectedEmail({ to, firstName, orderId, reason }) {
  const name = firstName || "there";
  const r = reason ? `<p class="muted">Reason: ${reason}</p>` : "";
  return sendMail({
    to,
    subject: `Payment could not be verified — order ${String(orderId).slice(-8)}`,
    text: `Hi ${name},\n\nWe could not verify your payment for order ${orderId}. ${reason || ""}\nPlease contact support if you need help.\n\n— EthioShop`,
    html: `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="box"><h1>Payment not verified</h1><p>Hi ${name},</p><p>We could not verify your payment for order <strong>#${String(orderId).slice(-8)}</strong>.</p>${r}<p>Please upload a clear screenshot or contact support for help.</p></div></body></html>`,
  });
}
