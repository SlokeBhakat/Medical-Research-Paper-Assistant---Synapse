# Synapse: Medical Research Terminal

Synapse is a high-fidelity medical research assistant built for the biomedical era. It performs real-time RAG (Retrieval-Augmented Generation) across PubMed, extracts figures from PMC, and provides an interactive terminal interface for evidence synthesis.

## 🚀 Deployment Guide (Vercel)

Follow these steps to deploy Synapse to your own Vercel account:

### 1. Repository Setup
1. Create a new repository on GitHub.
2. Initialize and push this code to your repo.
   - **IMPORTANT**: Ensure `.env.local` is **NOT** committed. The project includes a `.gitignore` that handles this by default.

### 2. Vercel Import
1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your Synapse repository.

### 3. Environment Variables
During the import process, expand the **Environment Variables** section and add the following keys from your local setup:
- `GROQ_API_KEY`: Your Groq Cloud API key.
- `GOOGLE_GENAI_API_KEY`: Your Google Gemini API key.

### 4. Deploy
Click **Deploy**. Vercel will build the app and provide a live URL (e.g., `synapse.vercel.app`). The `vercel.json` included in this repo ensures that research scans have enough time (60s) to complete without timing out.

## 🛠️ Local Development

1. Clone the repo.
2. Run `npm install`.
3. Create a `.env.local` file based on `.env.example`.
4. Run `npm run dev`.

## 🧠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & NES.css
- **LLMs**: Llama 3 via Groq
- **Embeddings**: Gemini-embedding-001
- **RAG**: LangChain
- **Data**: PubMed E-Utils & PMC Scraper

---

*Professional Evidence Synthesis Terminal — Built for researchers who value verifiable truth.*
