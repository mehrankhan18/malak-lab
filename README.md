# MALAK Lab Science Hub — Laboratory Management & Testing System

A complete, production-quality full-stack Laboratory Information System (LIS) built with **React + Vite + Tailwind CSS** (client & admin) and **Node.js + Express + MongoDB** (backend).

---

## 📁 Project Structure

```
laboratory-management-system/
├── client/          # Public website + customer portal (React + Vite, port 5173)
├── admin/           # Staff & admin dashboard (React + Vite, port 5174)
├── server/          # REST API backend (Express + MongoDB, port 5000)
├── .env.example     # Environment variable template
└── README.md        # This file
```

---

## ✅ Features

### Public Website (18 Pages)
- Premium Hero with GSAP-ready animations
- Test search and WhatsApp price/availability requests
- Test search, test details, health packages
- Home collection inquiries, branch finder and directions
- Blog & health articles, FAQ, doctors listing
- Privacy Policy, Terms & Conditions

### Customer Portal
- Register / Login (password + Email OTP)
- Dashboard with KPI cards
- Booking history, live tracking (8 stages)
- Download PDF lab reports
- Invoice history, profile management
- Support ticket submission

### Admin Dashboard (port 5174)
- Role-based access (admin / pathologist / technician / receptionist)
- Executive dashboard with live DB stats & revenue chart
- Test catalog & pricing management
- Test price requests with confirmed-quote-to-booking conversion for WhatsApp guests
- Booking operations with search & filters
- 8-stage specimen pipeline tracker
- Report entry matrix + pathologist electronic sign-off
- PDF report generation (PDFKit)
- Staff & RBAC management
- Branch network management
- Financial reporting & coupon management
- CMS (blogs, FAQs, testimonials, system settings)
- Security audit log

### Backend API
- 12 route groups, 12 controllers, 20+ Mongoose models
- JWT authentication + OTP login
- Role-based access control middleware
- Input validation layer (server/validators/)
- Rate limiting (authLimiter 20/15min, globalLimiter 1000/15min)
- Helmet security headers
- PDF generation via PDFKit
- SMS & email service stubs (ready for Twilio / Nodemailer)
- AuditLog for every sensitive operation
- Full seed script with demo data

---

## 🛠 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| MongoDB | 6.x or higher (running locally or Atlas URI) |
| Git | Any recent version |

---

## 🚀 Installation & Setup

### 1. Clone and navigate

```bash
git clone <your-repo-url>
cd laboratory-management-system
```

### 2. Configure environment variables

```bash
cp .env.example server/.env
```

Edit `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/lms_db
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Optional: CORS (comma-separated if multiple origins)
# CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Optional: SMS (Twilio)
# SMS_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_FROM_NUMBER=+1XXXXXXXXXX
```

### 3. Install dependencies

```bash
# Server dependencies
cd server
npm install

# Client (public portal) dependencies
cd ../client
npm install

# Admin dashboard dependencies
cd ../admin
npm install
```

### 4. Seed the database

```bash
cd server
npm run seed
```

The seed script **deletes existing application records before rebuilding them**. Do not run it against a database containing records you need to keep.

Before running it, set unique passwords of at least 12 characters for `SEED_ADMIN_PASSWORD`, `SEED_REVIEWER_PASSWORD`, `SEED_TECHNICIAN_PASSWORD`, and `SEED_RECEPTION_PASSWORD` in `server/.env`. The script validates these before connecting to or changing the database and never prints the passwords. If `SEED_DEMO_DATA=true`, also set `SEED_DEMO_PATIENT_PASSWORD`.

The default seed creates:
- 1 MALAK Lab branch, 5 departments, 10 test categories
- 8 medical tests (CBC, Lipid Profile, LFT, KFT, Thyroid, HbA1c, Vitamin D, Urinalysis)
- 3 health packages
- 4 staff accounts (see Staff Sign-in below)
- 2 blog posts, 10 FAQs, and system settings

Optional sample patient, booking, report, and coupon records are created only when `SEED_DEMO_DATA=true` is set in `server/.env`. They are fictional demonstration records.

### Add the medical test catalogue safely

The catalogue seed adds the 25 laboratory departments and their test records without deleting application data. It is safe to rerun:

```bash
cd server
npm run seed:catalog
```

Prices, sample requirements, preparation instructions, fasting details, and turnaround times remain unconfirmed until entered by authorized laboratory staff. New catalogue tests are not bookable until staff set a verified price and mark them available. The separate `npm run seed` command remains destructive and is not required for catalogue updates.

---

## 🖥 Running the Application

Open **three separate terminals**:

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 — Client Portal:**
```bash
cd client
npm run dev
# Starts on http://localhost:5173
```

**Terminal 3 — Admin Dashboard:**
```bash
cd admin
npm run dev
# Starts on http://localhost:5174
```

---

## 🔑 Staff Sign-in

After running the seed script, use one of these staff accounts:

| Role | Email | Password source | Portal |
|---|---|---|---|
| **Administrator** | `admin@malaklab.test` | `SEED_ADMIN_PASSWORD` in `server/.env` | http://localhost:5174 |
| **Report reviewer** | `reviewer@malaklab.test` | `SEED_REVIEWER_PASSWORD` in `server/.env` | http://localhost:5174 |
| **Lab technician** | `technician@malaklab.test` | `SEED_TECHNICIAN_PASSWORD` in `server/.env` | http://localhost:5174 |
| **Reception desk** | `reception@malaklab.test` | `SEED_RECEPTION_PASSWORD` in `server/.env` | http://localhost:5174 |

If you are using a database seeded by an older project version, existing accounts are not renamed automatically; continue using the password already set for each account.

Keep these passwords private and configure secure secrets before deploying the system.

> **Customer portal:** Patients register at http://localhost:5173/register. Email OTP and password reset links are sent to the account email and are never displayed in the browser. To enable email, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in `server/.env`. For Gmail, use `smtp.gmail.com`, port `465`, secure `true`, and a Google App Password (with 2-Step Verification enabled). Never put email credentials in client files or share them in chat. Without SMTP configuration, use password login or contact the laboratory for account help.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register        # Register customer
POST /api/auth/login           # Login with password
POST /api/auth/send-otp        # Request OTP
POST /api/auth/verify-otp      # Verify OTP & login
POST /api/auth/forgot-password # Email one-use password reset link
POST /api/auth/reset-password/:token # Set new password from reset link
GET  /api/auth/me              # Get current user (Protected)
PUT  /api/auth/profile         # Update profile (Protected)
```

### Tests & Packages
```
GET    /api/tests                      # List all active tests (search, filter)
GET    /api/tests/meta/categories      # Test categories
GET    /api/tests/meta/departments     # Departments
GET    /api/tests/:slug                # Test by slug/code
POST   /api/tests                      # Create test (admin/pathologist)
PUT    /api/tests/:id                  # Update test (admin/pathologist)
DELETE /api/tests/:id                  # Deactivate test (admin)

GET    /api/tests/search?search=       # Search tests by name/code
GET    /api/departments                # Active departments with listed-test counts
GET    /api/departments/:departmentId/tests # Tests in a department by ID, code, or name
GET    /api/admin/tests                # Manage catalogue tests (Admin)
POST   /api/admin/tests                # Add a catalogue test (Admin)
PUT    /api/admin/tests/:id            # Edit a catalogue test (Admin)
PATCH  /api/admin/tests/:id/status     # Change status (Admin)
DELETE /api/admin/tests/:id            # Deactivate a catalogue test (Admin)
POST   /api/admin/tests/bulk-import    # Import CSV-parsed test rows (Admin)
GET    /api/admin/departments          # Manage departments (Admin)
POST   /api/admin/departments          # Add a department (Admin)
PUT    /api/admin/departments/:id      # Edit a department (Admin)

GET  /api/packages                     # List packages
GET  /api/packages/:slug               # Package detail
POST /api/packages                     # Create package (admin)
PUT  /api/packages/:id                 # Update package (admin)
```

### Test Price & Availability Requests
```
POST  /api/inquiries                         # Save a request before opening WhatsApp
GET   /api/inquiries/:trackingId?phone=      # Check request status (tracking ID + request phone)
GET   /api/admin/inquiries                   # List requests (Admin)
PATCH /api/admin/inquiries/:id               # Update status, confirmed price, and patient response (Admin)
```
Requests receive an `MLR-YYYYMMDD-XXXXXXXX` tracking number. Patients use that number and the phone number submitted with the request to check status at `/request-tracking`. This tracks a price/availability inquiry, not a confirmed appointment or laboratory report. Lab staff manage requests from **Test Price Requests** in the admin portal.
Signed-in patients can find requests saved to their account at `/customer/requests` (**My Test Requests**). After the lab confirms a request, the patient must arrange and complete an actual test booking. Once lab staff enter and publish the verified result, the patient can sign in and open `/customer/reports` (**My Laboratory Reports**) to preview or download it. Support ticket IDs (`TCK-…`) are separate and do not work in the sample tracker.
Booking requires a signed-in patient account. Each first-time patient record receives a permanent `PAT-000001`-style ID; confirmed bookings and specimen IDs use sequential, year-scoped IDs. Keep the booking and specimen IDs for tracking.

### Bookings
```
POST /api/bookings                     # Create booking (patient account required)
GET  /api/bookings/my                  # Customer's bookings (Protected)
GET  /api/bookings/:id                 # Get own booking (or staff access)
PUT  /api/bookings/:id/cancel          # Cancel booking (Protected)
PUT  /api/bookings/:id/reschedule      # Reschedule (Protected)
GET  /api/bookings                     # All bookings (Staff+)
PUT  /api/bookings/:id/status          # Update status (Staff+)
```

### Sample Tracking
```
GET /api/samples/track/:query          # Public tracker (by ID/barcode/booking)
GET /api/samples                       # All samples (Staff+)
POST /api/samples/register             # Register new sample (Staff+)
PUT  /api/samples/:id/stage            # Advance stage (Staff+)
```

### Laboratory Reports
```
GET /api/reports/:id/pdf               # Download own approved report (or authorized staff)
GET /api/reports/customer              # Customer's published reports (Protected)
GET /api/reports/:id                   # Report detail (Protected)
GET /api/reports                       # All reports (Staff+)
POST /api/reports                      # Create draft (Admin/Technician)
PUT  /api/reports/:id/results          # Enter results (Staff+)
PUT  /api/reports/:id/submit-review    # Submit for review (Staff+)
PUT  /api/reports/:id/approve          # Approve & publish (Admin/Pathologist only)
```

### Branches
```
GET  /api/branches       # List active branches
GET  /api/branches/:id   # Branch detail
POST /api/branches       # Create branch (Admin)
PUT  /api/branches/:id   # Update branch (Admin)
```

### Billing & Invoices
```
POST /api/billing/coupons/apply     # Verify & apply coupon (Public)
GET  /api/billing/coupons           # List coupons
POST /api/billing/coupons           # Create coupon (Admin)
GET  /api/billing/invoices/my       # Customer invoices (Protected)
GET  /api/billing/invoices          # All invoices (Admin/Receptionist)
GET  /api/billing/stats             # Financial stats (Admin)
```

### Staff Management
```
GET  /api/staff              # All staff (Admin)
POST /api/staff              # Add staff (Admin)
PUT  /api/staff/:id          # Update staff (Admin)
PUT  /api/staff/:id/status   # Toggle active status (Admin)
```

### Admin
```
GET /api/admin/dashboard-stats        # Dashboard KPIs (Admin)
GET /api/admin/patients               # Patient list (Admin)
PUT /api/admin/patients/:id/toggle-status  # Block/activate (Admin)
GET /api/admin/audit-logs             # Security audit log (Admin)
```

### Content
```
GET  /api/content/blogs            # Blog articles
GET  /api/content/blogs/:slug      # Single article
POST /api/content/blogs            # Publish article (Admin/Pathologist)
GET  /api/content/faqs             # FAQs (with category filter)
POST /api/content/faqs             # Create FAQ (Admin)
GET  /api/content/reviews          # Testimonials
POST /api/content/reviews          # Submit review
GET  /api/content/settings         # System settings
PUT  /api/content/settings         # Update settings (Admin)
```

### Support Tickets
```
POST /api/support           # Submit ticket (Protected)
GET  /api/support/my        # Customer's tickets (Protected)
GET  /api/support           # All tickets (Admin/Receptionist)
PUT  /api/support/:id/reply # Reply to ticket (Protected)
```

---

## 🔒 Security Architecture

- **JWT Bearer tokens** — 30-day expiry, server-side validation on every protected request
- **Password hashing** — bcryptjs (10 salt rounds)
- **RBAC** — `authorize(...roles)` middleware on every staff/admin endpoint
- **Rate limiting** — 20 auth requests / 15min per IP; 1000 global requests / 15min per IP
- **Helmet** — Secure HTTP headers (HSTS, XSS protection, no-sniff, etc.)
- **CORS** — Allowlist-based origin check
- **Audit log** — Every sensitive action (login, booking, report approval) is persisted to `AuditLog` collection
- **Report security** — Customers can only access `published` or `approved` reports for bookings they own; PDF downloads require authentication

---

## 🗄 Database Models

| Model | Purpose |
|---|---|
| User | All accounts (customer + all staff roles) |
| Staff | Extended profile for laboratory personnel |
| Patient | Patient clinical record (demographics, history) |
| Department | Lab departments (Hematology, Biochemistry, etc.) |
| TestCategory | Test classification (Blood Tests, Thyroid, etc.) |
| Test | Individual diagnostic test with parameters |
| HealthPackage | Bundled test packages |
| Booking | Test appointment with full lifecycle |
| Sample | Specimen tracking (8-stage pipeline) |
| LaboratoryReport | Full report with per-parameter results & audit trail |
| Invoice | Financial invoice per booking |
| Branch | Laboratory branch locations & hours |
| Coupon | Discount coupons with expiry & usage limits |
| AuditLog | Security & operational audit trail |
| Notification | In-app customer notifications |
| Blog | Health articles & CMS |
| FAQ | Frequently asked questions |
| Review | Patient testimonials |
| SupportTicket | Customer support conversations |
| SystemSettings | Global system configuration |

---

## 🚢 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/lms_prod
JWT_SECRET=<strong_random_64_char_string>
CLIENT_URL=https://your-domain.com
ADMIN_URL=https://admin.your-domain.com
CORS_ORIGINS=https://your-domain.com,https://admin.your-domain.com
```

### Build Frontend for Production

```bash
# Build client
cd client && npm run build
# Output: client/dist/

# Build admin
cd admin && npm run build
# Output: admin/dist/
```

Serve `dist/` folders via Nginx or a static host (Netlify, Vercel). Point `/api` proxy to your Node.js server.

### Start Production Server

```bash
cd server
NODE_ENV=production npm start
```

### Recommended Production Stack
- **App Server**: Node.js via PM2 (`pm2 start server.js`)
- **Database**: MongoDB Atlas (free M0 tier works for development)
- **Frontend**: Vercel / Netlify (serve the dist/)
- **Reverse Proxy**: Nginx (route `/api` to Node.js, serve static files)
- **SSL**: Let's Encrypt via Certbot

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State Management | React Context API |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| PDF Generation | PDFKit |
| Security | Helmet + express-rate-limit |
| Logging | Morgan |

---

## 🐛 Known Limitations & Future Enhancements

1. **Email/SMS**: Email delivery uses SMTP when configured in `server/.env`; OTP email is not delivered until valid SMTP credentials are provided. SMS delivery remains a stub.
2. **Payment Gateway**: Payment flow is simulated. Integrate Stripe or Razorpay for real transactions.
3. **File Uploads**: Multer is installed. Wire up to Cloudinary for cloud image/document storage.
4. **WebSockets**: Live tracking updates require a page refresh. Socket.io can replace polling.
5. **GSAP Animations**: Animation hooks are scaffolded. Add `gsap` and `@gsap/react` to client and implement in pages.

---

## 📄 License

MIT — Free to use for personal and commercial projects.

---

**MALAK Lab Science Hub** — *Laboratory testing in Timergara, Lower Dir.*
