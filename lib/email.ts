import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'FinanceApp <onboarding@resend.dev>'

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Resetowanie hasla - FinanceApp',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#0a0a0a;">
            <tr>
              <td align="center" style="padding:48px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
                  <tr>
                    <td style="background:#141414;border-radius:16px;border:1px solid #222;padding:48px 40px;text-align:center;">
                      <!-- Logo -->
                      <div style="width:48px;height:48px;background:#ffffff;border-radius:12px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
                        <img src="https://api.dicebear.com/7.x/initials/svg?seed=FA&backgroundColor=ffffff&textColor=000000" width="48" height="48" style="border-radius:12px;" alt="FinanceApp" />
                      </div>
                      <h1 style="color:#ffffff;font-size:24px;font-weight:600;margin:0 0 8px;">Resetowanie hasla</h1>
                      <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 32px;">
                        Otrzymalismy prosbe o zresetowanie hasla do Twojego konta. Kliknij przycisk ponizej, aby ustawic nowe haslo.
                      </p>
                      <a href="${resetLink}" style="display:inline-block;background:#ffffff;color:#000000;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;margin-bottom:32px;">
                        Zresetuj haslo
                      </a>
                      <p style="color:#555;font-size:13px;margin:0 0 8px;">
                        Link wygasnie po <strong style="color:#888;">1 godzinie</strong>.
                      </p>
                      <p style="color:#555;font-size:13px;margin:0;">
                        Jesli nie prosiles o reset hasla, zignoruj ten email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 0;text-align:center;">
                      <p style="color:#444;font-size:12px;margin:0;">FinanceApp &copy; 2025</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Witaj w FinanceApp!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#0a0a0a;">
            <tr>
              <td align="center" style="padding:48px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
                  <tr>
                    <td style="background:#141414;border-radius:16px;border:1px solid #222;padding:48px 40px;text-align:center;">
                      <!-- Logo -->
                      <div style="width:48px;height:48px;background:#ffffff;border-radius:12px;margin:0 auto 24px;">
                        <img src="https://api.dicebear.com/7.x/initials/svg?seed=FA&backgroundColor=ffffff&textColor=000000" width="48" height="48" style="border-radius:12px;" alt="FinanceApp" />
                      </div>
                      <h1 style="color:#ffffff;font-size:24px;font-weight:600;margin:0 0 8px;">Konto zostalo utworzone!</h1>
                      <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 8px;">
                        Czesc <strong style="color:#fff;">${name}</strong>,
                      </p>
                      <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 32px;">
                        Twoje konto w FinanceApp zostalo pomyslnie zallozone. Mozesz teraz zalogowac sie i zaczac zarzadzac swoimi finansami.
                      </p>
                      <!-- Feature list -->
                      <div style="background:#1a1a1a;border-radius:12px;padding:24px;text-align:left;margin-bottom:32px;">
                        <p style="color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 16px;">Co mozesz robic:</p>
                        <div style="display:flex;align-items:center;margin-bottom:12px;">
                          <span style="color:#fff;font-size:14px;">&#x2713;&nbsp;&nbsp;</span>
                          <span style="color:#ccc;font-size:14px;">Sledzic przychody i wydatki</span>
                        </div>
                        <div style="display:flex;align-items:center;margin-bottom:12px;">
                          <span style="color:#fff;font-size:14px;">&#x2713;&nbsp;&nbsp;</span>
                          <span style="color:#ccc;font-size:14px;">Tworzyc kategorie transakcji</span>
                        </div>
                        <div style="display:flex;align-items:center;margin-bottom:12px;">
                          <span style="color:#fff;font-size:14px;">&#x2713;&nbsp;&nbsp;</span>
                          <span style="color:#ccc;font-size:14px;">Analizowac swoje finanse na wykresach</span>
                        </div>
                        <div style="display:flex;align-items:center;">
                          <span style="color:#fff;font-size:14px;">&#x2713;&nbsp;&nbsp;</span>
                          <span style="color:#ccc;font-size:14px;">Komunikowac sie z innymi uzytkownikami</span>
                        </div>
                      </div>
                      <a href="${process.env.BETTER_AUTH_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '#'}/sign-in" style="display:inline-block;background:#ffffff;color:#000000;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
                        Zaloguj sie teraz
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 0;text-align:center;">
                      <p style="color:#444;font-size:12px;margin:0;">FinanceApp &copy; 2025</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}
