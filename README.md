# HeroDraw 🎯

HeroDraw is a modern web platform that merges golf (Stableford scoring), recurring charity donations, and exciting monthly prize draws into a seamless digital experience.

## Features ✨

*   **Stableford Score Tracking:** Users log their 5 most recent Stableford scores.
*   **Monthly Prize Draws:** The custom algorithmic draw engine uses logged scores to generate a user's unique tickets and match them against drawn numbers.
*   **Automated Stripe Billing:** Supports transparent Monthly and Yearly subscription tiers, processing payments and webhooks automatically.
*   **Charity Integration:** A guaranteed minimum percentage of all subscriptions is designated for user-selected charities.
*   **Admin Dashboard:** Dedicated tooling for administrators to run simulated draws, finalize real draws, approve winning claims, and manage the platform.

## Tech Stack 🛠

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
*   **Payments:** [Stripe](https://stripe.com/) (Checkout & Webhooks)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Emails:** [Resend](https://resend.com/)

---

## Local Development Setup 🚀

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd hero-draw
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root of the project. You will need to populate it with the following keys from your respective service dashboards:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# App URL (Use localhost for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (Emails)
RESEND_API_KEY=re_...
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment 🌐

This project is optimized for deployment on **Vercel**. 

1. Import the repository into Vercel.
2. Copy all variables from `.env.local` into the Vercel Environment Variables settings.
3. Deploy!
4. *Crucial:* Once deployed, remember to set up a new Stripe Webhook pointing to `https://your-domain.vercel.app/api/webhooks/stripe` and update the `STRIPE_WEBHOOK_SECRET` in Vercel with the new live signing secret.
