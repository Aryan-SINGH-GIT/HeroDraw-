# Hero Draw ⛳

Hero Draw is a modern, gamified philanthropy web platform that merges golf (Stableford scoring), recurring charity donations, and exciting monthly prize draws into a seamless digital experience.

---

## 🚀 Core Functionality

### For Users:
* **Stableford Score Tracking:** Users can log their recent golf scores, which act as their "tickets" for the monthly draw.
* **Charity Integration:** Users select a charity they wish to support and set a custom contribution rate (minimum 10%). When they win, this percentage is automatically calculated and directed to the charity.
* **Secure Subscriptions:** Automated Stripe billing for Monthly (₹499) and Yearly (₹4,999) tiers. Users can manage their billing and access directly from their dashboard.
* **Prize Claiming:** Winners are notified via email and can upload physical proof (scorecards) of their winning numbers directly to the dashboard for verification.

### For Administrators:
* **Algorithmic Draw Engine:** Admins can run simulated draws based on a weighted algorithm (favoring popular numbers) before publishing the final results.
* **Automated Prize Pools:** The system automatically calculates the Total Revenue from active Stripe subscribers and splits 50% of it into Jackpot, 4-Match, and 3-Match prize pools.
* **Winner Verification:** Admins review uploaded scorecard proofs to securely approve payouts or reject fraudulent claims.
* **User & Charity Management:** Admins can toggle charity active states, feature specific organizations, and assign admin roles to users.

---

## 🏗 System Architecture

The application is built on a modern serverless architecture prioritizing security, performance, and developer velocity.

1. **Frontend & Application Layer (Next.js 14):**
   * Uses the **App Router** for layouts and routing.
   * **React Server Components (RSC)** handle secure data fetching directly from the database without exposing API endpoints.
   * **Server Actions** process form submissions (e.g., claiming prizes, publishing draws) securely on the backend, completely replacing traditional REST APIs.

2. **Database & Backend Services (Supabase):**
   * **PostgreSQL Database:** Relational data storage with strict relationships.
   * **Row Level Security (RLS):** Database policies ensure users can only read/write their own scores and settings. Admins bypass this using the `SERVICE_ROLE_KEY` in secure Server Actions.
   * **Authentication:** Seamless user signup and login.
   * **Storage:** Securely hosts the uploaded images of winning scorecards.

3. **External Integrations:**
   * **Stripe (Payments):** Handles Checkout sessions and Customer Portals. A dedicated webhook endpoint (`/api/webhooks/stripe`) listens for subscription updates and syncs them to the Supabase database.
   * **Resend (Email):** Triggered by Server Actions to send transactional emails (e.g., "You Won!") directly to users.

---

## 🗄 Database Schema

The PostgreSQL database is highly relational. Below is the core schema structure:

* **`auth.users`**: (Managed by Supabase) Core authentication records.
* **`profiles`**: Tied 1-to-1 with `auth.users`. Stores `email`, `full_name`, `role`, and the user's `charity_percentage` and selected `charity_id`.
* **`subscriptions`**: Links a `user_id` to a `stripe_customer_id` and `stripe_subscription_id`. Tracks the `plan_type` and `status` (active/inactive).
* **`scores`**: Stores the individual `score` and `played_date` for a specific `user_id`.
* **`draws`**: Records monthly draw results, `total_pool` amounts broken down by tier, the `winning_numbers`, and `status` (simulated vs published).
* **`winners`**: Connects a `user_id` to a `draw_id`. Tracks the `prize_amount`, `matched_numbers`, and handles verification via `proof_url` and `verification_status`.
* **`charities`**: Stores charity metadata (`name`, `description`, `website_url`, `is_active`).
* **`charity_contributions`**: Logs every time a winning user contributes their cut to a charity.


<img width="2270" height="1270" alt="supabase-schema-pqpnbaswmimsxpkqrwle" src="https://github.com/user-attachments/assets/5734c3fd-8fea-450f-b09b-811e92ce6b0b" />

---

## 💻 Tech Stack & Technical Decisions

* **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
  * *Decision:* Used for React Server Components, improving initial load times and allowing direct, secure database queries without an intermediate REST API layer.
* **Database & Auth:** [Supabase](https://supabase.com/)
  * *Decision:* Provides a robust Postgres database with built-in Auth and Storage. Row Level Security (RLS) pushes security logic down to the database layer, drastically reducing backend vulnerabilities.
* **Payments:** [Stripe](https://stripe.com/)
  * *Decision:* Industry standard for recurring billing. Webhooks ensure the database remains a perfect source of truth for subscription status.
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
  * *Decision:* Utility-first CSS allows for rapid, dark-mode focused UI development. Custom component wrappers (e.g., `<SubmitButton>`) integrate `useFormStatus` for smooth loading states.
* **Transactional Emails:** [Resend](https://resend.com/)
  * *Decision:* Developer-friendly API for delivering winner notifications efficiently from server actions.

---

## 🛠 Local Development Setup

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

## 🚀 Deployment

This project is optimized for deployment on **Vercel**. 

1. Import the repository into Vercel.
2. Copy all variables from `.env.local` into the Vercel Environment Variables settings.
3. Deploy the project.
4. **Crucial:** Once deployed, set up a new Stripe Webhook pointing to `https://your-domain.vercel.app/api/webhooks/stripe` and update the `STRIPE_WEBHOOK_SECRET` in Vercel with the new live signing secret to ensure subscriptions activate properly.
