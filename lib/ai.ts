export async function getEmbedding(text: string): Promise<number[]> {
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!openAiKey) {
    // Generate a deterministic 1536-dimensional vector based on the input text
    // This allows database vector operations to work seamlessly even without API keys.
    const vector = new Array(1536).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Deterministic random number generator based on hash seed
    const seedRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 1536; i++) {
      vector[i] = seedRandom(hash + i) * 2 - 1; // Value between -1 and 1
    }

    // Normalize the vector (so cosine similarity works correctly)
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map((val) => val / (magnitude || 1));
  }

  // Live OpenAI Embedding request
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    })
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || "OpenAI embedding API failed");
  }
  return json.data[0].embedding;
}

export async function chatCompletionStream(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<ReadableStream> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const encoder = new TextEncoder();

  // Option 1: OpenAI Streaming
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error("OpenAI chat completion error");
      }

      const reader = response.body?.getReader();
      return new ReadableStream({
        async start(controller) {
          if (!reader) {
            controller.close();
            return;
          }
          const parser = new MessageParser(encoder, controller);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            parser.parse(value);
          }
          controller.close();
        }
      });
    } catch (e: unknown) {
      const err = e as Error;
      console.error("OpenAI Streaming failed, falling back:", err.message);
    }
  }

  // Option 2: Gemini API Streaming (using Beta model for streaming chat compatibility)
  if (geminiKey) {
    try {
      // Map role names
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // In Gemini, system instruction is passed separately
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        }
      );

      if (!response.ok) {
        throw new Error("Gemini API streaming error");
      }

      const reader = response.body?.getReader();
      return new ReadableStream({
        async start(controller) {
          if (!reader) {
            controller.close();
            return;
          }
          
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += new TextDecoder().decode(value, { stream: true });
            
            // Gemini stream returns chunks of JSON, which can be parsed or processed
            // Since it is an array of JSON objects, let's stream the text parts out
            // For a simpler stream, we can regex-extract content or parse JSON chunks
            try {
              // Extract text parts: "text": "..."
              const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
              let match;
              while ((match = regex.exec(buffer)) !== null) {
                // Decode unicode escapes
                const rawText = match[1];
                const text = JSON.parse(`"${rawText}"`);
                controller.enqueue(encoder.encode(text));
              }
              // Keep only the last incomplete line or reset if parsed
              buffer = buffer.substring(buffer.lastIndexOf("}") + 1);
            } catch {
              // Wait for more data if parsing fails
            }
          }
          controller.close();
        }
      });
    } catch (e: unknown) {
      const err = e as Error;
      console.error("Gemini Streaming failed, falling back:", err.message);
    }
  }

  // Option 3: Local Mock stream (Self-contained, rule-based)
  // Extracts relevant sentences from system prompt to answer
  return new ReadableStream({
    async start(controller) {
      const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
      let answer = "Greetings, seeker of beauty. I am your NEXAMART AI Companion. ";
      
      // Extract context from systemPrompt
      const contextMatch = systemPrompt.match(/\[CONTEXT\]\s*([\s\S]+?)\s*\[\/CONTEXT\]/i);
      const context = contextMatch ? contextMatch[1] : "";
      
      if (context && context.length > 50) {
        answer += "\n\nBerdasarkan catatan rahasia kecantikan kami:\n";
        // Parse sentences that might match user queries
        const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
        let matches = 0;
        
        for (const s of sentences) {
          const cleanSentence = s.trim();
          // Find keywords
          const keywords = lastMessage.split(/\s+/).filter(w => w.length > 3);
          const hasKeyword = keywords.some(k => cleanSentence.toLowerCase().includes(k));
          
          if (hasKeyword && matches < 3) {
            answer += `• ${cleanSentence}.\n`;
            matches++;
          }
        }
        
        if (matches === 0) {
          answer += "\n" + sentences.slice(0, 3).map(s => `• ${s.trim()}.`).join("\n") + "\n";
        }
      } else {
        answer += "\n\nMaaf, saya tidak dapat terhubung ke basis pengetahuan saat ini. Namun, koleksi kosmetik White Clean mewah kami siap menemani ritual kecantikan Anda. Apakah ada produk tertentu yang ingin Anda tanyakan?";
      }

      // Stream the mock text out slowly to mimic AI typing
      const words = answer.split(" ");
      for (const word of words) {
        controller.enqueue(encoder.encode(word + " "));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      controller.close();
    }
  });
}

// Simple Parser for OpenAI stream response format (data: {...})
class MessageParser {
  encoder: TextEncoder;
  controller: ReadableStreamDefaultController;
  buffer: string = "";

  constructor(encoder: TextEncoder, controller: ReadableStreamDefaultController) {
    this.encoder = encoder;
    this.controller = controller;
  }

  parse(chunk: Uint8Array) {
    this.buffer += new TextDecoder().decode(chunk, { stream: true });
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("data: ")) {
        const rawData = cleanLine.substring(6);
        if (rawData === "[DONE]") continue;
        try {
          const parsed = JSON.parse(rawData);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            this.controller.enqueue(this.encoder.encode(content));
          }
        } catch {
          // Incomplete JSON chunk, skip
        }
      }
    }
  }
}
