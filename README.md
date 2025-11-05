# JobFit AI: AI-Powered Job Analyzer

### Get your resume past the robots and in front of a human.

**JobFit AI** is a full-stack, AI-powered Chrome extension that acts as your personal career co-pilot. It allows you to analyze any job posting on sites like LinkedIn and Indeed against your personal resume.

Instead of just "keyword matching," it uses the Google Gemini API to perform a deep semantic analysis, giving you an instant, human-like "match report" with a score, strengths, weaknesses, and a list of missing keywords.

---

## 🚀 Live Demo (How to Install)

Because the backend is deployed live on Render, you can install and use this extension in 60 seconds.

1.  **Download:** Download the `extension.zip` file from this repository's [Releases page](https://github.com/your-username/your-repo/releases).
2.  **Unzip:** Unzip the file. You will have a folder named `job-matcher-extension`.
3.  **Go to Extensions:** In Chrome, type `chrome://extensions` in your address bar and press Enter.
4.  **Enable Developer Mode:** In the top-right corner, turn on the **"Developer mode"** toggle.
5.  **Load the Extension:** Click the **"Load unpacked"** button, find the `job-matcher-extension` folder you just unzipped, and click "Select."

That's it! The icon will appear in your toolbar. You can now log in and start analyzing jobs.

---

## ✨ Core Features

### 1. In-Popup Authentication & Resume Management
A complete, self-contained auth flow. Users can register, log in, and upload their resume (PDF) directly within the popup. Your session is securely stored.



### 2. One-Click Job Scraping
Navigate to a job page on a supported site (LinkedIn, Indeed) and click "Analyze." The extension automatically scrapes the job description text, completely in the background.

### 3. Deep AI Analysis
The job text and your saved resume are sent to the backend. The Google Gemini API then generates a comprehensive, structured JSON report.

### 4. The "Match Report" Results Page
A new tab opens displaying your full, "human-like" analysis, including:
* **Match Score:** An "at-a-glance" percentage of how well your experience matches the role.
* **Missing Keywords:** A scannable list of critical skills from the job that aren't on your resume.
* **Strengths & Weaknesses:** A qualitative, human-like explanation of *why* you are (or aren't) a good fit.
* **Actionable Tips:** Concrete suggestions on what to emphasize in your cover letter or interview.



---

## 🛠️ Tech Stack & Architecture

This project is a full-stack application composed of two main parts: a **MERN stack backend** and a **Chrome Extension frontend**.



### Backend (Deployed on Render)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose)
* **AI:** Google Gemini API (via `@google/generative-ai`)
* **Authentication:** `jsonwebtoken` (JWT) for secure, stateless auth.
* **Security:** `bcryptjs` for password hashing.
* **File Handling:** `multer` for file uploads and `pdf2json` for parsing PDF resumes into text.
* **CORS:** Configured to allow requests only from the extension's origin.

### Frontend (Chrome Extension)
* **Framework:** Built with vanilla JavaScript (ES6+), HTML5, and modern CSS.
* **API:** Chrome Extension API (Manifest V3).
* **Core APIs Used:** `chrome.storage` (for auth tokens), `chrome.runtime` (for messaging), `chrome.scripting` (for dynamic scraping).
* **Architecture:**
    * **`popup.js`:** Manages all UI, auth, and file upload logic.
    * **`background.js`:** Acts as the central "brain," listening for messages and coordinating all actions (injecting scrapers, calling the backend API).
    * **`scrapers/`:** A modular folder of different scraper scripts, one for each job site (e.g., `linkedin.js`, `indeed.js`).

---

## 💡 What I Learned
* **Full-Stack Integration:** How to build and deploy a MERN stack backend from scratch and have it communicate securely with a separate frontend (the extension).
* **Advanced Prompt Engineering:** How to design a sophisticated prompt to force a generative AI (Gemini) to return a complex, structured JSON object 100% of the time.
* **Chrome Extension Architecture:** The complex, event-driven nature of Manifest V3, including the separation of concerns between popups, background service workers, and content scripts.
* **Polymorphic Web Scraping:** How to write resilient scrapers that can target different websites (LinkedIn, Indeed) and handle dynamic, modern web UIs.
* **Server-Side File Handling:** The complete pipeline of securely uploading a file (`multer`), parsing its raw buffer on the server (`pdf2json`), and saving the extracted text to a database.
