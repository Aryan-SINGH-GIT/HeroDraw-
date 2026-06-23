import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'Hero Draw <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to Hero Draw',
    html: `<h1>Welcome, ${name}!</h1><p>Thanks for joining Hero Draw. Subscribe to start tracking your scores and participating in our monthly draws.</p>`
  });
}

export async function sendSubscriptionConfirmedEmail(email: string) {
  await resend.emails.send({
    from: 'Hero Draw <onboarding@resend.dev>',
    to: email,
    subject: 'Subscription Confirmed',
    html: `<h1>Subscription Active</h1><p>Your subscription is now active. You can now enter your golf scores and participate in the next draw.</p>`
  });
}

export async function sendWinnerNotificationEmail(email: string, prize: number, drawDate: string) {
  await resend.emails.send({
    from: 'Hero Draw <onboarding@resend.dev>',
    to: email,
    subject: 'You won the Hero Draw Draw!',
    html: `<h1>Congratulations!</h1><p>You have won ₹${prize} in the ${drawDate} draw.</p><p>Please log in to your dashboard to upload proof of your scores to claim your prize.</p>`
  });
}
