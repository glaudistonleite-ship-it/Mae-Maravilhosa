import { GoogleGenAI } from "@google/genai";

export const generateMessage = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("GEMINI_API_KEY não encontrada.");
    return "Mãe, você é o meu maior tesouro. Feliz Dia das Mães!";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Timeout de 15 segundos para evitar que o botão fique travado em "carregando"
  const timeoutPromise = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout ao gerar mensagem")), 15000)
  );

  try {
    const generatePromise = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Você é um assistente poético e carinhoso especializado em mensagens de Dia das Mães. Crie mensagens emocionantes, curtas e bonitas em português.",
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]) as any;
    
    if (!response || !response.text) {
      throw new Error("Resposta vazia da IA");
    }
    
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar mensagem:", error);
    return "Mãe, seu amor é a luz que ilumina meu caminho. Te amo muito! (Mensagem gerada automaticamente)";
  }
};

export const generateCaricature = async (base64Image: string, mimeType: string) => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não encontrada.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
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
          text: "Transforme esta pessoa em uma caricatura artística, colorida e alegre para o Dia das Mães. Mantenha as características principais mas dê um toque de desenho animado elegante e festivo. IMPORTANTE: Se houver qualquer texto escrito na imagem (como 'Feliz Dia das Mães'), ele DEVE estar obrigatoriamente em português.",
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Não foi possível gerar a caricatura.");
};
