import { NextResponse } from 'next/server';
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

export async function POST(request: Request) {
  try {
    const { paperAbstract, paperTitle, messages } = await request.json();

    if (!paperAbstract || !messages) {
      return NextResponse.json({ error: "Missing paper abstract or messages" }, { status: 400 });
    }

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile", // High intelligence for answering contextual questions
      temperature: 0.2, // Low temperature for grounded factual answers
    });

    const systemPrompt = new SystemMessage(
      `You are an expert Medical Research Assistant. 
You are currently helping a user understand a specific research paper titled: "${paperTitle}".
Here is the Abstract of the paper:
---
${paperAbstract}
---
INSTRUCTIONS:
1. Answer the user's questions STRICTLY based on the provided Abstract.
2. If the user asks something that is NOT mentioned in the abstract, politely inform them that the information is not available in the provided text. Do NOT make up facts.
3. Be concise, scientific, yet accessible.`
    );

    // Map frontend messages {role, content} to Langchain Messages
    const historyMessages = messages.map((m: any) => {
      if (m.role === 'user') return new HumanMessage(m.content);
      return new AIMessage(m.content);
    });

    const conversationContext = [systemPrompt, ...historyMessages];

    const response = await llm.invoke(conversationContext);

    return NextResponse.json({ reply: response.content.toString() });

  } catch (error: any) {
    console.error('Error in medical chat:', error);
    return NextResponse.json(
      { error: 'Failed to process the chat request' },
      { status: 500 }
    );
  }
}
