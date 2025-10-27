
import { GoogleGenAI, Modality } from "@google/genai";
import { InspectionReport } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getInspectionSummary = async (report: InspectionReport): Promise<string> => {
  const failedParameters = report.parameters.filter(p => p.status === 'Fail');

  if (failedParameters.length === 0) {
    return "All parameters are within tolerance. The inspection has passed successfully.";
  }

  const prompt = `
    You are an expert quality assurance engineer for aerospace components.
    An AS9102 inspection has been performed with the following out-of-tolerance parameters:

    ${failedParameters.map(p => 
      `- Parameter: "${p.description}" (ID: ${p.id})
        - Nominal: ${p.nominal.toFixed(3)}
        - Tolerance: ${p.ltl.toFixed(3)} to ${p.utl.toFixed(3)}
        - Actual Measurement: ${p.actual?.toFixed(3)}
        - Deviation: ${p.deviation?.toFixed(3)}`
    ).join('\n')}

    Based on this data, please provide:
    1. A concise summary of the inspection findings.
    2. A list of potential root causes for these deviations.
    3. Recommended corrective actions to address these issues.

    Format the response clearly with headings for each section.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while communicating with the AI Assistant. Please check the console for details.";
  }
};

export const generateGdtImage = async (symbolName: string, symbol: string): Promise<string> => {
  const prompt = `Generate a simple, high-contrast, black and white technical drawing. The drawing must clearly illustrate the geometric characteristic for the GD&T symbol representing "${symbolName}" (${symbol}). The image should only contain the graphical representation, without any text, labels, or dimensions. Use a clean, vector-like style.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image data found in Gemini response.");

  } catch (error) {
    console.error("Error generating GD&T image with Gemini API:", error);
    throw error;
  }
};
