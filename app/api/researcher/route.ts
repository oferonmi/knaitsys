import { NextRequest, NextResponse } from "next/server";

// Example: Replace with real API integrations
async function fetchAggregatedData(topic: string) {
    const results: any[] = [];
    // Fetch from arXiv
    try {
        const arxivRes = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(topic)}&start=0&max_results=3`);
        const arxivText = await arxivRes.text();
    
        // if (!arxivText) throw new Error("No data from arXiv");
        // Parse arXiv Atom XML (simple extraction)
        // Use xml2js or fast-xml-parser for Node.js, since DOMParser is not available in Node
        //Use a simple regex-based fallback for now
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        const titleRegex = /<title>([\s\S]*?)<\/title>/;
        const idRegex = /<id>([\s\S]*?)<\/id>/;
        const summaryRegex = /<summary>([\s\S]*?)<\/summary>/;
        let match;
        while ((match = entryRegex.exec(arxivText)) !== null) {
            const entryXml = match[1];
            const title = (titleRegex.exec(entryXml)?.[1] || "arXiv Paper").replace(/\n/g, " ").trim();
            const url = (idRegex.exec(entryXml)?.[1] || "").trim();
            const summary = (summaryRegex.exec(entryXml)?.[1] || "").replace(/\n/g, " ").trim();
            results.push({
                title,
                source: "arXiv",
                url,
                summary: summary.slice(0, 300) + (summary.length > 300 ? "..." : ""),
            });
        }
    } catch (e) {
        // Ignore arXiv errors, continue
    }
    // Fetch from X (Twitter) via scraping or API (placeholder, as X API is paid/restricted)
    // You may use a 3rd-party API or skip if not available
    // Example: Use a placeholder for now
    results.push({
        title: `Relevant X Post about ${topic}`,
        source: "X",
        url: `https://x.com/search?q=${encodeURIComponent(topic)}`,
        summary: `See recent discussions about '${topic}' on X (Twitter).`,
    });
    return results;
}

async function analyzeResearch(aggregated: any[]) {
    // Use OpenAI API (or similar) to generate insights, directions, and questions
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        // Fallback if no API key
        return {
            keyInsights: ["No OpenAI API key set."],
            novelDirections: ["Set OPENAI_API_KEY in your environment."],
            openQuestions: ["Cannot generate analysis without API key."]
        };
    }
    // Compose prompt from aggregated articles
    const context = aggregated.map((item, i) => `Source ${i + 1}: ${item.title}\nSummary: ${item.summary}`).join("\n\n");
    const prompt = `Given the following research sources, extract:\n1. Key insights (bulleted)\n2. Novel research directions (bulleted)\n3. Open research questions (bulleted)\n\n${context}\n\nRespond in JSON with keys: keyInsights, novelDirections, openQuestions.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        }),
    });
    const data = await response.json();
    let aiResult = { keyInsights: [], novelDirections: [], openQuestions: [] };
    try {
        // Try to parse JSON from the AI response
        const content = data.choices?.[0]?.message?.content;
        if (content) {
            // Try to extract JSON block
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiResult = JSON.parse(jsonMatch[0]);
            }
        }
    } catch (e) {
        // Fallback: return plain text split by lines
        const content = data.choices?.[0]?.message?.content || "";
        const lines = content.split("\n");
        aiResult.keyInsights = lines.filter((ln: string) => ln.startsWith("- ")).map((ln: string) => ln.replace("- ", ""));
    }
    return aiResult;
}

export async function POST(req: NextRequest) {
    try {
        const { topic } = await req.json();
        if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });
        const aggregated = await fetchAggregatedData(topic);
        const analysis = await analyzeResearch(aggregated);
        return NextResponse.json({ aggregated, analysis });
    } catch (e) {
        return NextResponse.json({ error: "Failed to process research" }, { status: 500 });
    }
}
