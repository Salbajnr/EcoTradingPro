EcoTradingPro

EcoTradingPro is a full-stack crypto simulation platform designed to provide users with a realistic cryptocurrency trading experience while giving administrators powerful oversight and simulation tools.

The platform features two distinct roles with separate authentication routes:
	•	Normal Users – interact with the platform as if trading real crypto.
	•	Admins – have exclusive rights to simulate balances, manage users, and oversee platform activity.

⸻

🚀 Features

👤 Users
	•	Register & log in through a user-specific auth route.
	•	View live crypto market rates (via CoinGecko API).
	•	Access curated crypto news and announcements.
	•	Participate in futures trading simulation with realistic balance tracking.
	•	Withdrawals disabled to maintain the simulation environment.
	•	Responsive dashboard with dark/light mode.

🛡️ Admins
	•	Secure login via a dedicated admin auth route.
	•	Simulate/edit balances across user accounts (users won’t know).
	•	Manage users (view, suspend, reset, or adjust accounts).
	•	Post announcements directly to user dashboards.
	•	Configure and manage crypto news feeds.
	•	Access platform analytics (activity logs, transactions, trends).

📊 System Highlights
	•	Modern React frontend with modular architecture.
	•	PostgreSQL database for secure and reliable storage.
	•	Real-time data integration with APIs.
	•	WebSocket support for live balance & price updates.
	•	Built with future expansion in mind (real trading support).

⸻

🗄️ Database Schema Overview
	•	users → stores user info, credentials, roles.
	•	admins → admin accounts with privileged access.
	•	balances → user balances (simulated).
	•	transactions → records of trades/futures.
	•	news → curated crypto news entries.
	•	announcements → admin-posted updates.
	•	market_data → real-time crypto rates.
	•	analytics → logs & platform insights.

⸻

🛠️ Tech Stack
	•	Frontend: React (Responsive, Dark/Light mode, Modular UI)
	•	Backend: Node.js / Express (Authentication, Business logic, Admin tools)
	•	Database: PostgreSQL
	•	APIs: CoinGecko (crypto rates), RSS feeds (crypto news)
	•	Auth: JWT with role-based separation (User vs Admin)
	•	Deployment: Render / Vercel / Docker

⸻

📌 Roadmap
	•	Project setup (frontend, backend, DB).
	•	Authentication (separate user/admin routes).
	•	User dashboard (balances, prices, news, futures).
	•	Admin dashboard (simulate balances, manage users, analytics).
	•	Real-time data integration (prices & WebSocket updates).
	•	UI/UX polish (dark/light mode, mobile responsiveness).
	•	Deployment & CI/CD pipeline.

⸻

📷 Preview (Concept)

EcoTradingPro dashboard mockups coming soon…

⸻

📄 License

MIT License – free to use and modify.
