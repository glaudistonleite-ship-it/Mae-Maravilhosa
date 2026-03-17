import { GoogleGenAI } from "@google/genai";

export const generateMessage = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "Você é um assistente carinhoso. Crie uma mensagem curta de Dia das Mães em português.",
    },
  });

  return response.text;
};

export const generateCaricature = async (base64Image: string, mimeType: string) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Crie uma versão artística e estilizada desta pessoa para o Dia das Mães. A imagem deve ser altamente fiel aos traços reais do rosto, mantendo a semelhança física evidente, mas com um acabamento de pintura digital vibrante, elegante e festivo. Não exagere nas proporções como em caricaturas tradicionais; foque em um retrato artístico que celebre a beleza da pessoa. IMPORTANTE: Qualquer texto na imagem deve estar em português (ex: 'Feliz Dia das Mães').",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Nenhum resultado gerado pelo modelo.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // If no image part found, check if there's text explaining why
    const textPart = response.candidates[0].content.parts.find(p => p.text);
    if (textPart) {
      throw new Error(`O modelo não gerou uma imagem. Resposta: ${textPart.text}`);
    }

    throw new Error("Não foi possível encontrar a imagem na resposta do modelo.");
  } catch (error: any) {
    console.error("Erro detalhado na geração de caricatura:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("MODEL_NOT_FOUND");
    }
    throw error;
  }
};
