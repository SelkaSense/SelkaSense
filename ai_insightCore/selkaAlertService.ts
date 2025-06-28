// selkaAlertService.ts

import { SelkaSignal } from './selkaPatternEngine'
import nodemailer from 'nodemailer'

interface AlertConfig {
  email?: {
    from: string
    to: string[]
    smtpHost: string
    smtpPort: number
    user: string
    pass: string
  }
  webhookUrl?: string
  notifyConsole?: boolean
}

interface AlertMessage {
  subject: string
  body: string
}

export class SelkaAlertService {
  private config: AlertConfig

  constructor(config: AlertConfig) {
    this.config = config
  }

  private formatMessage(signal: SelkaSignal): AlertMessage {
    const time = new Date(signal.timestamp).toISOString()
    const strengthPct = Math.round(signal.signalStrength * 100)
    const subject = `SelkaSense Signal: ${signal.description}`
    const body = `
      Time: ${time}
      Signal: ${signal.description}
      Strength: ${strengthPct}%
    `
    return { subject, body }
  }

  private async sendEmail(message: AlertMessage) {
    if (!this.config.email) return
    const transporter = nodemailer.createTransport({
      host: this.config.email.smtpHost,
      port: this.config.email.smtpPort,
      secure: this.config.email.smtpPort === 465,
      auth: {
        user: this.config.email.user,
        pass: this.config.email.pass
      }
    })
    await transporter.sendMail({
      from: this.config.email.from,
      to: this.config.email.to,
      subject: message.subject,
      text: message.body.trim()
    })
  }

  private async sendWebhook(signal: SelkaSignal) {
    if (!this.config.webhookUrl) return
    await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: signal.timestamp,
        description: signal.description,
        strength: signal.signalStrength
      })
    })
  }

  private logToConsole(signal: SelkaSignal) {
    if (!this.config.notifyConsole) return
    const time = new Date(signal.timestamp).toLocaleTimeString()
    console.log(`[SelkaAlert] ${time} — ${signal.description} (${Math.round(signal.signalStrength * 100)}%)`)
  }

  async dispatchAlerts(signals: SelkaSignal[]) {
    for (const signal of signals) {
      const message = this.formatMessage(signal)
      await Promise.all([
        this.sendEmail(message),
        this.sendWebhook(signal)
      ])
      this.logToConsole(signal)
    }
  }
}
