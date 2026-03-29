# NLB Procurement AI Assistant

An AI-powered platform designed for the **National Library Board (NLB) of Singapore** to streamline procurement drafting, review, and compliance checking in accordance with government standards.

## 🚀 Overview

The NLB Procurement AI Assistant leverages advanced generative AI to automate the creation and auditing of key procurement documents. It ensures that all drafts are aligned with NLB's mission to nurture a reading and learning nation while strictly adhering to the Singapore Government's **Instruction Manual (IM) on Procurement**.

## ✨ Key Features
- **AI-Assisted Drafting**: Generate professional drafts for:
  - **Approval of Requirements (AOR)**
  - **Requirement Specifications (RS)**
  - **Evaluation Reports (ER)**
- **Compliance Audit Dashboard**: A centralized view to monitor the compliance health and status of all active procurement projects.
- **Contextual Compliance Checks**: Real-time AI auditing of documents with specific suggestions for improvement.
- **NLB Mission Alignment**: Ensures every procurement objective supports NLB's vision of building a knowledgeable and engaged community.
- **Government Standards Adherence**: Built-in logic to check for Confidentiality, Safety, Environmental, and "Value for Money" (VfM) principles.

## 🛠 Technical Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4.0 (with Typography plugin)
- **Animations**: Motion (formerly Framer Motion)
- **AI Engine**: Google Gemini 3.0 Flash (via `@google/genai`)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher.
- **npm**: Version 9.0 or higher (or equivalent package manager like Yarn).
- **Google Gemini API Key**: Required for AI-powered drafting and compliance checks.

### Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nlb-procurement-ai
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.


## 📖 How to Use

### 1. Drafting a New Document
- Navigate to the **"+ New Draft"** tab in the sidebar.
- Enter the **Project Title** and select the **Document Type** (AOR, RS, or ER).
- Provide a brief **Project Description** and list the **Key Requirements**.
- Click **"Generate AI Draft"**. The AI will create a structured Markdown document based on your inputs.

### 2. Managing Projects (Dashboard)
- The **Dashboard** shows all your active projects at a glance.
- Click on any project to view its full content, current status, and latest compliance score.
- Use the **"Export PDF"** button to prepare documents for official submission.

### 3. Running a Compliance Check (Contextual)
- While viewing a project's details, click **"Run Compliance Check"**.
- The AI will analyze the content and provide a **Compliance Report** with a score (0-100%) and a list of issues categorized by severity (High, Medium, Low).
- Use the suggestions provided to refine your draft.

### 4. Oversight & Audit (Compliance Audit Dashboard)
- Navigate to the **"Compliance Review"** tab in the sidebar.
- This page acts as a centralized **Audit Log** for managers.
- View compliance scores and statuses for all documents in a single table.
- Click **"Run Audit"** or **"Re-audit"** to update the compliance status of any document without opening it.

## 📂 Project Structure

```text
/
├── src/
│   ├── App.tsx          # Main application logic and UI components
│   ├── index.css        # Global styles and Tailwind CSS configuration
│   ├── main.tsx         # Application entry point
│   ├── types.ts         # TypeScript interfaces and shared types
│   └── lib/
│       ├── gemini.ts    # AI service integration (Google Gemini)
│       └── utils.ts     # Shared utility functions (e.g., cn)
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

## ⚖️ Compliance & Standards

This application is designed to support the following regulatory frameworks:
- **Singapore Government IM on Procurement**: Ensuring transparency, open and fair competition, and value for money.
- **NLB Internal Guidelines**: Aligning procurement with the strategic goals of the National Library Board.
- **Data Privacy**: No PII (Personally Identifiable Information) should be included in the AI prompts.

---

*Note: This application is a tool to assist procurement officers. All AI-generated content should be reviewed and verified by a qualified officer before final submission.*
