import { google } from "googleapis";
import fs from "fs";
import path from "path";

// Scope: send as delegated GMail user (using service+delegation!)
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";

/**
 * Get a Google JWT client for sending email via Gmail API using domain delegation.
 * @returns {Promise<google.auth.JWT>}
 */
export async function getGmailJwtClient() {
  let creds;

  // 1. Direct environment variables (Best for .env usage in modern PaaS like Vercel/Render)
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    creds = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    };
    console.log("[GMAIL] Loaded service account from GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY env vars");
  } 
  // 2. Full JSON string in environment variable
  else if (process.env.GMAIL_SERVICE_ACCOUNT_JSON) {
    try {
      creds = JSON.parse(process.env.GMAIL_SERVICE_ACCOUNT_JSON);
      console.log("[GMAIL] Loaded service account from GMAIL_SERVICE_ACCOUNT_JSON env var");
    } catch (e) {
      throw new Error("Failed to parse GMAIL_SERVICE_ACCOUNT_JSON env var. Make sure it is valid JSON.");
    }
  } 
  // 3. Fallback to file paths (credentials.json)
  else {
    const credPath =
      process.env.GMAIL_SERVICE_ACCOUNT_JSON_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(process.cwd(), "credentials.json");
      
    if (fs.existsSync(credPath)) {
      creds = JSON.parse(fs.readFileSync(credPath, "utf-8"));
      console.log("[GMAIL] Loaded service account from", credPath);
    } else {
      throw new Error(
        "No credentials found for Gmail service account. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in your .env file."
      );
    }
  }

  // Ensure private_key is multi-line with newlines
  // This step is critical because environment variables stringify '\n' into actual string literals '\\n'
  if (typeof creds.private_key === "string") {
    // Remove outer quotes if mistakenly added, then replace escaped newlines with actual newlines
    creds.private_key = creds.private_key.replace(/^"|"$/g, '').replace(/\\n/g, "\n");
  }

  if (!creds.private_key || creds.private_key.length < 1000) {
    throw new Error("Malformed or missing private_key in Gmail service account credentials");
  }

  const delegatedUser =
    process.env.GMAIL_DELEGATE_EMAIL ||
    process.env.GMAIL_FROM ||
    "desarrollo.tecnologico@casitaiedis.edu.mx";

  console.log("[GMAIL] Using DELEGATED sender mailbox:", delegatedUser);
  
  const jwtClient = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [GMAIL_SCOPE],
    subject: delegatedUser,
  });

  // Confirm that JWT constructed with required fields
  if (!jwtClient.key) {
    console.error("[GMAIL] jwtClient.key missing!", jwtClient);
    throw new Error("Google JWT client missing key (private_key)");
  }
  
  await jwtClient.authorize();
  console.log("[GMAIL] JWT authorized");

  return jwtClient;
}

/**
 * Sends a password reset email, encoding subject for UTF-8 as required by Gmail for non-ASCII.
 * @param {string} to Recipient email
 * @param {string} link Password reset link
 */
export async function sendResetPasswordEmail(to, link) {
  const jwtClient = await getGmailJwtClient();
  const gmail = google.gmail({ version: "v1", auth: jwtClient });

  const subject = "Restablecer tu contraseña - IECS-IEDIS";
  // Encode subject for UTF-8 (RFC 2047/U)
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;

  const body = `Hola!<br><br>
Has solicitado restablecer tu contraseña en IECS-IEDIS.<br>
Haz clic en este enlace seguro para continuar:<br><br>
<a href="${link}" style="color:#036;">Restablecer contraseña</a><br><br>
Si no solicitaste el cambio, ignora este mensaje.<br><br>
--<br>IECS-IEDIS`;

  const rawMessage = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    body,
  ].join("\n");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: Buffer.from(rawMessage).toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ""),
      },
    });
    console.log(`[GMAIL] Password reset sent to ${to}: status ${res.status}`);
  } catch (err) {
    console.error(`[FORGOT PASSWORD EMAIL ERROR]`, err);
    throw err;
  }
}