# ARIA — Echo Outbound Voice Ops Center

ARIA is a high-density, professional outbound Voice Operations Center designed to coordinate, configure, execute, and monitor real-time AI voice agents for automated outbound calling scenarios (appointment confirmations, lead qualification, payment follow-ups, and more) utilizing the **Vapi AI Voice Engine**.

Designed with **Vapi's actual dark-mode command design system**, ARIA offers high-fidelity visual logs, real-time scrolling call transcript monitors, and robust, enterprise-grade secure coding paradigms.

---

## 🚀 Key Features

* **True Vapi-Style Obsidian Dark Theme:** Sleek `#0a0a0a` dashboard containing high-contrast components, sentence case labels, title-case headers, and clean micro-interactions.
* **Multi-Scenario Voice Profiles:** Out-of-the-box support for Event Registration, Lead Qualification, Appointment Reminders, Customer Satisfaction Surveys, and Payment Follow-ups.
* **Live Monitored Call Stream:** Stream live calls, view call connection profiles, and track conversation transcripts scrolling dynamically in real-time.
* **High-Fidelity Dialogue Logs:** Fully searchable call history database with filter chips, expanded transcript blocks, audit metrics, and in-browser audio playback of recorded conversations.
* **Robust Secure Coding Implementations:**
  * **LLM Prompt Injection Defense:** Auto-sanitizes scenario form parameters (names, dates, strings) using strict length capping, regex override filters, and flattening to secure OpenAI/Vapi system prompt integrity.
  * **API Throttling & Rate Limiter:** Protects call initiation routes with a thread-safe, sliding-window IP rate limiter to fully prevent financial and resource exploitation.
  * **Webhook Authorization:** Verifies incoming Vapi webhook requests using secure `x-vapi-secret` header checks.
  * **Secure Error Responses:** Sanitizes API errors to prevent leaking raw internal JSON payloads or stacks to public clients.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 16 (App Router), React 18, Tailwind CSS, TypeScript.
* **Backend:** FastAPI, Pydantic Settings, Structlog JSON logging, HTTPX, Uvicorn, Python 3.12.
* **Voice Engine Integration:** Vapi outbound calls API & Real-time Webhooks.

---

## ⚙️ Quick Start & Setup

Detailed specifications, data flows, and architecture maps are available in **[project.md](project.md)**.

### 1. Prerequisites
- Python 3.12+ installed.
- Node.js 18+ installed.
- A registered [Vapi Account](https://vapi.ai) with an active Phone Number ID and Private API Key.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and enter your Vapi credentials in `.env`:
   ```bash
   # Create a .env file and enter the following parameters:
   VAPI_API_KEY=your_vapi_private_api_key
   VAPI_PHONE_NUMBER_ID=your_registered_phone_number_id
   VAPI_WEBHOOK_SECRET=optional_secure_webhook_key
   ```
5. Launch the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure the backend API address in `.env.local`:
   ```bash
   FASTAPI_URL=http://localhost:8000
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and navigate to **`http://localhost:3000`** to access the Voice Ops Center dashboard!

---

## 🧪 Running Automated Tests

Run backend unit tests to verify endpoints, phone parsing validity, and scenario prompt integrations:
```bash
cd backend
.\venv\Scripts\python -m pytest
```

---

## 📖 Deeper Reading
For the complete technical blueprint, sequence diagrams, directory mappings, and API routing specs, open **[project.md](project.md)**.
