import type { Message } from '../types';

// Let TypeScript know about the global puter object
declare global {
  interface Window {
    puter: any;
  }
}

export const generateAIResponse = async (messages: Message[], onChunk: (chunk: string) => void): Promise<string> => {
  try {
    // Convert our Message format to puter format
    // Puter uses OpenAI-like message format: { role: 'user' | 'assistant' | 'system', content: string }
    const formattedMessages = messages.map(msg => {
      let content: any = msg.content;
      if (msg.attachment) {
        content = [
          { type: 'text', text: msg.content || ' ' },
          { type: 'image_url', image_url: { url: msg.attachment } }
        ];
      }
      return {
        role: msg.role,
        content: content
      };
    });

    // Start streaming chat response using Puter.js
    const response = await window.puter.ai.chat(formattedMessages, { stream: true });

    let fullResponse = "";
    
    // Read the stream
    for await (const chunk of response) {
      if (chunk?.text) {
        fullResponse += chunk.text;
        onChunk(fullResponse);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error communicating with Puter AI:", error);
    const errorMessage = "Sorry, I encountered an error while trying to connect to the AI service.";
    onChunk(errorMessage);
    return errorMessage;
  }
};
