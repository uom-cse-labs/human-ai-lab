import { describe, expect, it, vi } from 'vitest'
import { brevoSender, type OutgoingMail, submitContact } from '../../src/api/contact.ts'

describe('contact form (ported from ContactServiceTest and BrevoMailSenderTest)', () => {
  const sent: OutgoingMail[] = []
  const send = async (mail: OutgoingMail) => {
    sent.push(mail)
  }

  it('sends to the lab inbox with reply-to the visitor', async () => {
    sent.length = 0
    expect(await submitContact({ name: 'Asha', email: 'asha@example.com', subject: 'Visit', message: 'Hello' }, send, 'lab@example.org')).toBe('sent')
    expect(sent).toEqual([{ to: 'lab@example.org', replyTo: 'asha@example.com', subject: '[Human-AI Lab website] Visit', body: 'Name: Asha\nEmail: asha@example.com\nHello\n' }])
  })

  it('discards messages that fill the honeypot', async () => {
    sent.length = 0
    expect(await submitContact({ name: 'Bot', email: 'b@example.com', message: 'Buy', website: 'spam.example' }, send, 'lab@example.org')).toBe('discarded-as-spam')
    expect(sent).toEqual([])
  })

  it('strips line breaks so input cannot add headers, and uses a default subject', async () => {
    sent.length = 0
    await submitContact({ name: 'Asha\r\nBcc: x@example.com', email: 'a@example.com', message: 'Hi' }, send, 'lab@example.org')
    expect(sent[0].subject).toBe('[Human-AI Lab website] Message from the website')
    expect(sent[0].body).toContain('Name: Asha Bcc: x@example.com\n')
  })

  it('sends through Brevo with the visitor as reply-to', async () => {
    const fetcher = vi.fn(async () => new Response('{}', { status: 201 }))
    await brevoSender('key-123', 'web@lab.example.org', fetcher as unknown as typeof fetch)({ to: 'lab@example.org', replyTo: 'a@example.com', subject: 'S', body: 'B' })
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.brevo.com/v3/smtp/email')
    expect((init.headers as Record<string, string>)['api-key']).toBe('key-123')
    expect(JSON.parse(init.body as string)).toMatchObject({ sender: { email: 'web@lab.example.org' }, to: [{ email: 'lab@example.org' }], replyTo: { email: 'a@example.com' } })
  })

  it('a refusal by Brevo becomes a delivery failure', async () => {
    const fetcher = async () => new Response('bad key', { status: 401 })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(brevoSender('wrong', 'web@lab.example.org', fetcher as typeof fetch)({ to: 'a', replyTo: 'b', subject: 's', body: 'b' }))
      .rejects.toMatchObject({ status: 502, code: 'DELIVERY_FAILED' })
    error.mockRestore()
  })
})
