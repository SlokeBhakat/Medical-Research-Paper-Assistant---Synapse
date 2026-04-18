import { NextResponse } from 'next/server';
import { searchPubMed, fetchPubMedAbstracts, PubMedPaper } from '@/lib/pubmed';
import { processAndAnswer } from '@/lib/rag';
import { scrapePmcForImages } from '@/lib/pmc-scraper';
import { ChatGroq } from "@langchain/groq";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Keyword Extraction for PubMed
    let optimizedQuery = question;
    try {
        const queryLlm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
        });
        const queryPrompt = `Extract core medical search terms from this question for PubMed.
Return ONLY keywords. Omit conversational filler.
Question: "${question}"`;
        const queryResponse = await queryLlm.invoke(queryPrompt);
        optimizedQuery = queryResponse.content.toString().trim().replace(/['"{}[\].]/g, ''); 
    } catch(e) {
        // Fallback to original query
    }

    // 1. Fetch from PubMed
    const pmids = await searchPubMed(optimizedQuery, 5);
    
    let abstracts: PubMedPaper[] = [];
    if (pmids.length > 0) {
      abstracts = await fetchPubMedAbstracts(pmids);
    }

    // 2. Process with Langchain/Gemini
    const { answer, citations } = await processAndAnswer(question, abstracts);

    // 3. Scrape Real Figures from PMC
    let realImages: {src: string, pmcUrl: string}[] = [];
    try {
        const retrievedPmcids = abstracts
             .filter(p => citations.some((c: any) => c.id === p.id) && p.pmcid)
             .map(p => p.pmcid as string);
        
        if (retrievedPmcids.length > 0) {
             realImages = await scrapePmcForImages(retrievedPmcids);
        }
    } catch (e) {
        console.error("PMC Scrape failure", e);
    }

    return NextResponse.json({
      answer,
      citations,
      realImages
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || "Synthesis failed.",
      details: "Terminal connection unstable. Please try again."
    }, { status: 500 });
  }
}
