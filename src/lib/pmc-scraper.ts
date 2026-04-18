export async function scrapePmcForImages(pmcids: string[]): Promise<{src: string, pmcUrl: string}[]> {
    const results: {src: string, pmcUrl: string}[] = [];
    
    for (const pmcid of pmcids) {
        if (!pmcid) continue;
        const sourceUrl = `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
        try {
            const res = await fetch(sourceUrl);
            if (!res.ok) continue;
            const html = await res.text();
            
            // Match the native PMC blob CDN for jpg images (usually high quality figures)
            const matches = [...html.matchAll(/src="(https:\/\/cdn\.ncbi\.nlm\.nih\.gov\/pmc\/blobs\/[^"]+\.jpg)"/g)];
            
            // Avoid duplicate image thumbnails by deduplicating
            const uniqueUrls = new Set(matches.map(m => m[1]));
            
            // Limit to max 2 figures per paper
            const paperUrls = Array.from(uniqueUrls).slice(0, 2);
            for (const url of paperUrls) {
                results.push({ src: url, pmcUrl: sourceUrl });
            }

            // Cap the total number to 3 figures globally for a clean UI
            if (results.length >= 3) break;
        } catch(e) {
            console.error(`Failed to scrape ${pmcid}`, e);
        }
    }
    
    return results.slice(0, 3);
}
