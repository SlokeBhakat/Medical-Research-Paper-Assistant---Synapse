import { XMLParser } from 'fast-xml-parser';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface PubMedPaper {
  id: string;
  title: string;
  abstract: string;
  pmcid?: string;
}

/**
 * Searches PubMed and returns matching PMIDs.
 */
export async function searchPubMed(query: string, maxResults: number = 5): Promise<string[]> {
  const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed Search: ${response.statusText}`);
  const data = await response.json();
  return data.esearchresult?.idlist || [];
}

/**
 * Parses a single article node from the PubMed XML structure.
 */
function parseArticle(article: any): PubMedPaper | null {
  try {
    const medline = article.MedlineCitation;
    const pmid = medline.PMID?._text || medline.PMID;
    if (!pmid) return null;

    const articleData = medline.Article;
    let title = articleData.ArticleTitle;
    if (typeof title === 'object') title = title._text;
    title = title || 'No Title Available';

    let abstractText = '';
    const abstractNode = articleData.Abstract?.AbstractText;
    if (abstractNode) {
      if (typeof abstractNode === 'string') abstractText = abstractNode;
      else if (Array.isArray(abstractNode)) abstractText = abstractNode.map(t => t._text || t).join(' ');
      else if (typeof abstractNode === 'object') abstractText = abstractNode._text || '';
    }

    if (!abstractText) return null;

    let pmcid = undefined;
    const idList = article.PubmedData?.ArticleIdList?.ArticleId;
    if (idList) {
      const ids = Array.isArray(idList) ? idList : [idList];
      const pmcNode = ids.find((i: any) => i['@_IdType'] === 'pmc');
      if (pmcNode) pmcid = pmcNode._text;
    }

    return { id: pmid.toString(), title, abstract: abstractText, pmcid };
  } catch (e) {
    return null;
  }
}

/**
 * Fetches and parses PubMed abstracts.
 */
export async function fetchPubMedAbstracts(ids: string[]): Promise<PubMedPaper[]> {
  if (ids.length === 0) return [];
  
  const url = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed Fetch: ${response.statusText}`);
  
  const xmlData = await response.text();
  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "_text" });
  const parsed = parser.parse(xmlData);
  
  const rawArticles = parsed.PubmedArticleSet?.PubmedArticle || [];
  const articleList = Array.isArray(rawArticles) ? rawArticles : [rawArticles];
  
  return articleList
    .map(parseArticle)
    .filter((p): p is PubMedPaper => p !== null);
}
