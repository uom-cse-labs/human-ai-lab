/** Delivers contact-form messages to the lab inbox (Java: ContactService). Messages are emailed, never stored. */
import { ApiError } from './errors.ts'

export interface ContactMessage {
  name: string
  email: string
  subject?: string
  message: string
  /** Honeypot: a hidden field people leave empty and bots tend to fill. */
  website?: string
}

export interface OutgoingMail {
  to: string
  replyTo: string
  subject: string
  body: string
}

export type MailSender = (mail: OutgoingMail) => Promise<void>

export async function submitContact(message: ContactMessage, send: MailSender, labInbox: string): Promise<'sent' | 'discarded-as-spam'> {
  if (message.website?.trim()) {
    return 'discarded-as-spam' // reported to the caller as accepted, so bots learn nothing
  }
  const subject = `[Human-AI Lab website] ${singleLine(message.subject?.trim() ? message.subject : 'Message from the website')}`
  const body = `Name: ${singleLine(message.name)}\nEmail: ${message.email}\n${message.message}\n`
  await send({ to: labInbox, replyTo: message.email, subject, body })
  return 'sent'
}

/** Removes line breaks so user input can't add email headers. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/** Brevo's transactional email API. The sender address must be verified in Brevo. */
export function brevoSender(apiKey: string, fromAddress: string, fetcher: typeof fetch = fetch): MailSender {
  return async (mail) => {
    let response: Response
    try {
      response = await fetcher('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { email: fromAddress, name: 'Human-AI Lab website' },
          to: [{ email: mail.to }],
          replyTo: { email: mail.replyTo },
          subject: mail.subject,
          textContent: mail.body,
        }),
      })
    } catch (e) {
      console.error('Brevo could not be reached', e)
      throw deliveryFailed()
    }
    if (!response.ok) {
      console.error(`Brevo did not accept the message: HTTP ${response.status} ${await response.text()}`)
      throw deliveryFailed()
    }
  }
}

/** Until Brevo is set up, messages are written to the Worker log (like the Java service's log provider). */
export const logSender: MailSender = async (mail) => {
  console.log(`Mail not sent (no BREVO_API_KEY): to=${mail.to} subject=${mail.subject} replyTo=${mail.replyTo}\n${mail.body}`)
}

function deliveryFailed() {
  return new ApiError(502, 'DELIVERY_FAILED', 'The message could not be delivered. Please try again later.')
}
