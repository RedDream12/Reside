import { GoogleGenAI, Type } from "@google/genai";
import { Subtask } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const subtaskListSchema = {
  type: Type.ARRAY,
  items: { 
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The title of a single, actionable sub-task."
      },
    },
    required: ["title"],
  },
};

export async function breakdownTaskIntoSubtasks(taskTitle: string): Promise<Pick<Subtask, 'title'>[]> {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const prompt = `Break down the following task into a short list of actionable sub-tasks: "${taskTitle}". Provide only the sub-task titles.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: subtaskListSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedSubtasks: Pick<Subtask, 'title'>[] = JSON.parse(jsonText);

    if (!Array.isArray(parsedSubtasks)) {
        throw new Error("AI returned an invalid format.");
    }

    return parsedSubtasks;
  } catch (error) {
    console.error("Error breaking down task with Gemini:", error);
    throw new Error("Failed to generate sub-tasks from AI.");
  }
}

export async function summarizeNote(noteContent: string): Promise<string> {
   if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const prompt = `Summarize the following note concisely in a few bullet points:\n\n${noteContent}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing note with Gemini:", error);
    throw new Error("Failed to summarize note from AI.");
  }
}
