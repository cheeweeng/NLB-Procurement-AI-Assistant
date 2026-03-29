import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateProcurementDraft = async (
  type: string,
  description: string,
  requirements: string
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  let typeSpecificInstructions = "";
  if (type === "ER") {
    typeSpecificInstructions = `
    This is an Evaluation Report (ER). Use the following structure:
    1. Document Title: "Evaluation Report for [Project Title]"
    2. Executive Summary
    3. Introduction / Background
       - Project title / Procurement title
       - Brief project description / business need (short version)
       - Reference to the approved Approval of Requirements (AOR)
       - Estimated procurement value and budget source
    4. Tender / Quotation Process Summary
    5. Evaluation Committee
    6. Evaluation Methodology
    7. Preliminary Examination / Compliance Check
    8. Detailed Evaluation
    9. Recommendation and Justification
    10. Prepared by / Endorsed by
    11. Annexes
    `;
  } else if (type === "AOR") {
    typeSpecificInstructions = `
    This is an Approval of Requirements (AOR). Use the following structure:
    1. Document Title: "Approval of Requirements for [Project Title]"
    2. Project Background & Objectives
    3. Justification for Procurement
    4. Estimated Budget & Funding Source
    5. Procurement Strategy & Timeline
    6. Key Requirements Overview
    7. Risk Assessment
    8. Recommendation for Approval
    `;
  } else if (type === "RS") {
    typeSpecificInstructions = `
    This is a Requirement Specifications (RS) document. Use the following structure:
    1. Document Title: "Requirement Specifications for [Project Title]"
    2. Introduction & Scope of Work
    3. Technical Specifications & Deliverables
    4. Service Level Agreements (SLAs)
    5. Delivery & Implementation Schedule
    6. Evaluation Criteria (Critical & Non-Critical)
    7. Safety & Compliance Requirements
    `;
  }

  const prompt = `
    Draft a professional procurement document for the National Library Board (NLB) of Singapore.
    Document Type: ${type}
    Project Description: ${description}
    Key Requirements: ${requirements}

    Adhere strictly to Singapore Government Procurement (IM on Procurement) standards.
    Ensure alignment with NLB's mission: "To nurture a reading and learning nation and to build a knowledgeable and engaged community."
    
    ${typeSpecificInstructions}

    Format the output in Markdown. Ensure the title is correct for the document type and does not hallucinate "Requirement Specifications" if the type is "ER" or "AOR".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("The AI returned an empty response. Please try again.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate draft. Please check your connection.");
  }
};

export const reviewProcurementDraft = async (content: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const prompt = `
    Review the following procurement document for the National Library Board (NLB) of Singapore.
    Check for:
    1. Adherence to Singapore Government Procurement (IM on Procurement) standards.
    2. Alignment with NLB's mission and vision.
    3. Completeness of technical specifications.
    4. Potential risks or ambiguities.

    Document Content:
    ${content}

    Provide a JSON response with the following structure:
    {
      "score": number (0-100),
      "issues": [
        {
          "severity": "high" | "medium" | "low",
          "message": "Description of the issue",
          "suggestion": "How to fix it"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  message: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["severity", "message", "suggestion"],
              },
            },
          },
          required: ["score", "issues"],
        },
      },
    });

    if (!response.text) {
      throw new Error("The AI returned an empty review. Please try again.");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Review Error:", error);
    throw new Error(error.message || "Failed to review draft.");
  }
};
