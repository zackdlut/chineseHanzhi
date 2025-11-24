import { GoogleGenAI, Type } from "@google/genai";
import { CharacterData, DifficultyLevel } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for Pinyin response
const pinyinSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      char: { type: Type.STRING, description: "The Chinese character" },
      pinyin: { type: Type.STRING, description: "The Pinyin with tone marks" },
    },
    required: ["char", "pinyin"],
  },
};

// Schema for Suggested Words response
const suggestionSchema = {
  type: Type.OBJECT,
  properties: {
    words: {
      type: Type.STRING,
      description: "A string of characters suitable for Grade 1 practice, no spaces or punctuation.",
    },
  },
};

export const getPinyinForText = async (text: string): Promise<CharacterData[]> => {
  if (!text.trim()) return [];

  // Filter to keep only Chinese characters (roughly) to save tokens, 
  // though the model can handle mixed input, we want to clean it up.
  const cleanText = text.replace(/[^\u4e00-\u9fa5]/g, '');
  if (!cleanText) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide the Pinyin (with tone marks) for the following Chinese characters: "${cleanText}". Return a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: pinyinSchema,
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr) as CharacterData[];
  } catch (error) {
    console.error("Error fetching pinyin:", error);
    // Fallback: return characters with empty pinyin if API fails
    return cleanText.split('').map(c => ({ char: c, pinyin: '' }));
  }
};

export const generateGrade1Content = async (
  promptContext: string = "Generate a list of 10-15 distinct, common Chinese characters",
  difficulty: DifficultyLevel = DifficultyLevel.Any
): Promise<string> => {
  let difficultyPrompt = "";
  
  switch (difficulty) {
    case DifficultyLevel.Simple:
      difficultyPrompt = "Strictly limit to characters with 5 strokes or fewer.";
      break;
    case DifficultyLevel.Medium:
      difficultyPrompt = "Select characters with 5 to 9 strokes.";
      break;
    case DifficultyLevel.Complex:
      difficultyPrompt = "Select characters with 9 or more strokes.";
      break;
    case DifficultyLevel.StrokeFocus:
      difficultyPrompt = "Select characters that strongly feature 'Pie' (撇) and 'Na' (捺) strokes.";
      break;
    default:
      difficultyPrompt = "Mix simple and slightly challenging characters.";
  }

  const fullPrompt = `${promptContext}. ${difficultyPrompt} Suitable for a Grade 1 primary school student. Return them as a single string of characters without punctuation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) return "天地人你我他";
    
    const data = JSON.parse(jsonStr);
    return data.words || "天地人你我他";
  } catch (error) {
    console.error("Error generating content:", error);
    return "天地人你我他金木水火土";
  }
};