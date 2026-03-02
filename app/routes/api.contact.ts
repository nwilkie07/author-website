import type { Route } from "./+types/api.contact";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sendgridApiKey = context.cloudflare.env.SENDGRID_API_KEY;
  const toEmail = context.cloudflare.env.CONTACT_FORM_TO_EMAIL;

  if (!sendgridApiKey || !toEmail) {
    return new Response(JSON.stringify({ error: "SendGrid not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json() as { 
      name?: string; 
      email?: string; 
      subject?: string; 
      message?: string 
    };
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Name, email, and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
        }],
        from: { email: toEmail, name: "Author Website Contact" },
        reply_to: { email: email, name: name },
        subject: subject ? `Contact Form: ${subject}` : "Contact Form Submission",
        content: [
          {
            type: "text/plain",
            value: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "N/A"}\n\nMessage:\n${message}`,
          },
          {
            type: "text/html",
            value: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject || "N/A"}</p>
              <h3>Message:</h3>
              <p>${message.replace(/\n/g, "<br>")}</p>
            `,
          },
        ],
      }),
    });

    if (!sgResponse.ok) {
      const errorText = await sgResponse.text();
      console.error("SendGrid error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send message" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
