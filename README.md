# CloudGuard SIEM

A multi-client Security Information and Event Management (SIEM) platform for GCP, built with Next.js and Python.

## Features

- **Username/Password Authentication** - Secure login with bcrypt password hashing
- **Multi-Client Profiles** - Manage security assessments for multiple clients (Google, Amazon, Flipkart, etc.)
- **GCP Security Scanner** - Python-based scanner with 60+ security checks aligned with Google SCC
- **Client Data Isolation** - All scans, uploads, and reports are scoped to the selected client
- **PDF Report Generation** - Professional reports with custom date ranges
- **Sentinel AI** - AI-powered security insights (supports Gemini and OpenAI)
- **Dark/Light Mode** - Google-inspired design with theme toggle

## Quick Start

### 1. Install Dependencies

```bash
cd security-dashboard-poc
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

### 3. Create a Client

1. Click "Add Client" in the header
2. Enter client name (e.g., "Google Cloud Project")
3. Optionally add GCP Project ID for scanning

### 4. Upload Security Findings

**Option A: Upload CSV**
1. Go to "Scans & Uploads" page
2. Drag & drop a CSV file with findings
3. View results in the dashboard

**Option B: Run Scanner**
1. Click "Run Scan" button on dashboard
2. Enter GCP Project ID
3. Ensure you're authenticated: `gcloud auth application-default login`
4. Scanner will automatically save results

## Scanner Usage

### Prerequisites

```bash
pip install -r requirements.txt
gcloud auth application-default login
```

### Run Manually

```bash
python gcp_security_scanner.py --project-ids your-project-id --output findings.csv
```

### Supported Checks

The scanner includes 60+ checks across:
- **Compute Engine**: Public IPs, boot disk encryption, shielded VM settings
- **GKE**: Private clusters, workload identity, network policies
- **Cloud Storage**: Public bucket ACLs, uniform access, encryption
- **Cloud SQL**: Public IPs, SSL enforcement, backup configuration
- **IAM**: Over-privileged service accounts
- **Firewall**: Open SSH/RDP ports, overly permissive rules

## CSV Format

Upload CSV files with these columns:

```csv
finding_category,finding_severity,resource_name,resource_type,resource_project,resource_location,finding_description,remediation,finding_state
```

See `sample_findings.csv` for an example.

## Report Generation

1. Click "Generate Report" on the dashboard
2. Select date range (start/end dates)
3. Download professional PDF report including:
   - Executive summary
   - Findings breakdown by severity
   - Detailed findings table
   - Remediation recommendations

## Environment Variables (Optional)

Create `.env.local` for production:

```env
JWT_SECRET=your-secure-jwt-secret
```

## Project Structure

```
security-dashboard-poc/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # Login/Register endpoints
│   │   │   ├── clients/     # Client CRUD
│   │   │   ├── uploads/     # Upload management
│   │   │   ├── scan/        # Scanner execution
│   │   │   └── reports/     # PDF generation
│   │   ├── login/           # Login page
│   │   ├── findings/        # Findings table
│   │   ├── resources/       # Resources inventory
│   │   ├── lighthouse/      # Sentinel AI
│   │   ├── scans/           # Upload management
│   │   ├── settings/        # LLM configuration
│   │   └── page.tsx         # Dashboard
│   ├── components/
│   │   ├── ClientSelector.tsx
│   │   ├── ScanModal.tsx
│   │   ├── ReportModal.tsx
│   │   └── layout/
│   └── lib/
│       ├── db.ts            # SQLite database
│       ├── auth.ts          # JWT utilities
│       ├── AuthContext.tsx  # Auth state
│       └── ClientContext.tsx # Client state
├── gcp_security_scanner.py  # Python scanner
├── requirements.txt         # Python dependencies
└── cloudguard.db           # SQLite database (auto-created)
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Auth**: bcrypt + JWT
- **Scanner**: Python 3 + GCP Client Libraries
- **Charts**: Recharts
- **PDF**: jsPDF + jspdf-autotable

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

Note: For Vercel deployment, you'll need to use a cloud database (e.g., Turso, PlanetScale) instead of SQLite.

### Self-Hosted

```bash
npm run build
npm start
```

## License

MIT
