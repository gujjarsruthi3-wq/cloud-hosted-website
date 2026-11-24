/*
 * Azure Function (Node.js v4 programming model): POST /api/contact
 *
 * Receives the contact-form JSON, validates it, and saves it as a row in
 * Azure Table Storage. The storage connection string is read from the
 * application setting STORAGE_CONNECTION_STRING — it is never committed
 * to the repository (Azure portal → Static Web App → Environment variables).
 *
 * Logs written with context.log / context.error go to Application Insights
 * when APPLICATIONINSIGHTS_CONNECTION_STRING is configured.
 */
const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");
const crypto = require("crypto");

const TABLE_NAME = process.env.CONTACT_TABLE_NAME || "ContactMessages";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 100, email: 254, subject: 150, message: 2000 };

let tableClient; // reused across warm invocations
let tableReady = false;

async function getTable() {
  const conn = process.env.STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("STORAGE_CONNECTION_STRING is not configured");

  if (!tableClient) tableClient = TableClient.fromConnectionString(conn, TABLE_NAME);
  if (!tableReady) {
    try {
      await tableClient.createTable();
    } catch (err) {
      if (err.statusCode !== 409) throw err; // 409 = table already exists
    }
    tableReady = true;
  }
  return tableClient;
}

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // strip control chars
    .trim()
    .slice(0, max);
}

function reply(status, body) {
  return { status, jsonBody: body, headers: { "Cache-Control": "no-store" } };
}

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return reply(400, { error: "Invalid request format." });
    }

    // Honeypot: real visitors never fill this hidden field. Pretend success.
    if (body && typeof body.website === "string" && body.website.trim() !== "") {
      context.warn("Honeypot triggered; message discarded.");
      return reply(200, { message: "Thanks! Your message has been received." });
    }

    const data = {
      name: clean(body?.name, LIMITS.name),
      email: clean(body?.email, LIMITS.email).toLowerCase(),
      subject: clean(body?.subject, LIMITS.subject),
      message: clean(body?.message, LIMITS.message)
    };

    const errors = [];
    if (data.name.length < 2) errors.push("name");
    if (!EMAIL_RE.test(data.email)) errors.push("email");
    if (data.message.length < 10) errors.push("message");
    if (errors.length) {
      return reply(400, { error: "Please check these fields: " + errors.join(", ") + "." });
    }

    try {
      const table = await getTable();
      const now = new Date();
      // RowKey sorts newest first: (max - timestamp) + random suffix
      const rowKey = String(8640000000000000 - now.getTime()).padStart(16, "0") + "-" + crypto.randomUUID().slice(0, 8);

      await table.createEntity({
        partitionKey: now.toISOString().slice(0, 7), // e.g. "2026-11"
        rowKey,
        ...data,
        receivedAt: now.toISOString(),
        userAgent: clean(request.headers.get("user-agent"), 300)
      });

      context.log(`Contact message stored (rowKey=${rowKey}).`);
      return reply(200, { message: "Thanks! Your message has been received." });
    } catch (err) {
      context.error("Failed to store contact message:", err.message);
      return reply(500, { error: "Sorry, your message could not be saved right now. Please try again later." });
    }
  }
});
