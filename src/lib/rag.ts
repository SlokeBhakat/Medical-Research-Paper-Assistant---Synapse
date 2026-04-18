import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { PubMedPaper } from "./pubmed";

function cosineSimilarity(A: number[], B: number[]) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < A.length; i++) {
        dot += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export async function processAndAnswer(question: string, papers: PubMedPaper[]) {
  if (papers.length === 0) {
    return {
      answer: "I couldn't find any relevant medical papers on PubMed to answer this question.",
      citations: []
    };
  }

  // 1. Process documents into chunks
  const docs = papers.map(p => new Document({
    pageContent: p.abstract,
    metadata: { id: p.id, title: p.title, type: "abstract" }
  }));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // 2. Embed
  const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    model: "gemini-embedding-001", 
  });

  const [queryEmbedding, docEmbeddings] = await Promise.all([
    embeddingsModel.embedQuery(question),
    embeddingsModel.embedDocuments(splitDocs.map(d => d.pageContent))
  ]);

  // 3. Retrieval via Cosine Similarity
  const scoredDocs = splitDocs.map((doc, idx) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, docEmbeddings[idx])
  })).sort((a, b) => b.score - a.score);
  
  const retrievedDocs = scoredDocs.slice(0, 5).map(s => s.doc);

  // Extract unique citations with their FULL original abstract
  const citations = Array.from(
    new Map(retrievedDocs.map(d => {
      const fullPaper = papers.find(p => p.id === d.metadata.id);
      return [d.metadata.id, { ...d.metadata, abstract: fullPaper?.abstract || d.pageContent }];
    })).values()
  );

  // 4. Generate Answer
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile", 
    temperature: 0.1, // Even lower for maximum factuality
  });

  const contextText = retrievedDocs.map(d => `[Source ${d.metadata.id}]: ${d.pageContent}`).join("\n\n");
  
  const prompt = `You are an expert medical research assistant.
Using ONLY the context below, answer the user's question clearly and accurately.
If the provided context does not contain the answer, say "I don't have enough context from the retrieved papers."
Cite your specific sources inline using the [Source ID] format.

CONTEXT ABSTRACTS:
${contextText}

QUESTION:
${question}`;

  const response = await llm.invoke(prompt);
  
  return {
    answer: response.content.toString(),
    citations
  };
}
