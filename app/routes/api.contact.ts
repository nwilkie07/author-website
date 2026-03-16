import type { Route } from "./+types/api.contact";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const toEmail = context.cloudflare.env.CONTACT_FORM_TO_EMAIL;
  const turnstileSecretKey = context.cloudflare.env.TURNSTILE_SECRET_KEY;
  const sendgridApiKey = context.cloudflare.env.SENDGRID_API_KEY;

  if (!toEmail) {
    return new Response(JSON.stringify({ error: "Contact form email not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!turnstileSecretKey) {
    return new Response(JSON.stringify({ error: "Captcha not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!sendgridApiKey) {
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json() as { 
      name?: string; 
      email?: string; 
      subject?: string; 
      message?: string;
      sendCopy?: boolean;
      "cf-turnstile-response"?: string;
    };
    const { name, email, subject, message, sendCopy, "cf-turnstile-response": turnstileToken } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Name, email, and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: "Captcha verification required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: turnstileSecretKey,
        response: turnstileToken,
      }),
    });

    const turnstileResult = await turnstileResponse.json() as { success?: boolean };

    if (!turnstileResult.success) {
      console.error("Turnstile verification failed:", turnstileResult);
      return new Response(JSON.stringify({ error: "Captcha verification failed. Please try again." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: toEmail }],
            ...(sendCopy ? { cc: [{ email: email, name: name }] } : {}),
          },
        ],
        from: {
          email: "noreply@kmacleodwilkie.com",
          name: "K. MacLeod Wilkie Contact Form",
        },
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

    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text();
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
