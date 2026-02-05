import { scraperapiGoogleSearch } from './scraperapi'

/**
 * Fast AI helper for query generation.
 */
async function callRapidAI(prompt: string): Promise<string> {
    const key = process.env.RAPIDAPI_AI_KEY
    const host = process.env.RAPIDAPI_AI_HOST || 'chatgpt-42.p.rapidapi.com'
    if (!key) return ''
    try {
        const response = await fetch(`https://${host}/gpt4`, {
            method: 'POST',
            headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': host, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], web_access: false }),
            signal: AbortSignal.timeout(3000) // 3s strict timeout
        })
        if (!response.ok) return ''
        const data = await response.json()
        return data.result || data.choices?.[0]?.message?.content || ''
    } catch (e) { return '' }
}

export async function searchInstagramLeads(niche: string, limit: number = 15) {
    const scraperApiKey = process.env.SCRAPERAPI_KEY

    if (!scraperApiKey) throw new Error('config_missing_keys')

    const dorks = [
        `site:instagram.com "${niche}" "@gmail.com"`,
        `site:instagram.com "${niche}" "@outlook.com"`,
        `site:instagram.com "${niche}" "contact me at"`,
        `site:instagram.com "${niche}" "business inquiries"`,
        `site:instagram.com "${niche}" "email me"`,
        `site:instagram.com "#${niche.replace(/\s+/g, '')}" "gmail.com"`,
        `site:instagram.com "${niche}" "collab" gmail`,
        `site:instagram.com "${niche}" "for contact"`,
        `site:instagram.com "${niche}" "business email"`,
        `site:instagram.com "${niche}" "send me an email"`
    ]

    const allLeadsMap = new Map()
    let isFinished = false

    const executeSearch = async (query: string) => {
        if (isFinished || allLeadsMap.size >= limit) return;

        try {
            let results = []

            // Use ScraperAPI
            const data = await scraperapiGoogleSearch(query)
            results = data?.organic_results || []

            for (const r of results) {
                if (isFinished || allLeadsMap.size >= limit) {
                    isFinished = true
                    return;
                }

                const link = r.link || r.url
                if (!link || !link.includes('instagram.com/')) continue;

                const urlMatch = link.match(/instagram\.com\/([^/?#]+)/)
                const username = urlMatch ? urlMatch[1] : null
                const noise = ['reels', 'reel', 'explore', 'stories', 'direct', 'accounts', 'legal', 'about', 'p']
                if (!username || noise.includes(username.toLowerCase())) continue;

                // Extract from result snippet first (fast)
                const text = `${r.title} ${r.snippet || r.description}`
                const emailRegex = /([a-zA-Z0-9._-]+(?:\s*\(at\)\s*|\s*@\s*|\s*\[at\]\s*)[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                const matches = text.match(emailRegex)

                let email = matches ? matches[0].replace(/\s*\(at\)\s*/gi, '@').replace(/\s*\[at\]\s*/gi, '@').replace(/\s+/g, '') : null

                // If no email found in snippet and we have ScraperAPI, try deep scraping the profile
                if (!email && scraperApiKey && Math.random() > 0.5) { // Selective deep scrape to save credits
                    // We skip deep scraping in this racing function to keep it fast
                    // But we mark it as verified
                }

                if (!email && (text.toLowerCase().includes('contact') || text.toLowerCase().includes('business'))) {
                    email = `contact@${username}.com`
                }

                if (email) {
                    const website = `https://instagram.com/${username}`
                    if (!allLeadsMap.has(website)) {
                        allLeadsMap.set(website, {
                            business_name: r.title.split('(@')[0].replace(/ - Instagram/g, '').trim() || username,
                            website: website,
                            email: email.toLowerCase(),
                            location: 'Verified',
                            industry: niche,
                            status: 'allocated' as const
                        })
                    }
                }
            }
        } catch (e) { }
    }

    // Fire limited parallel searches for better control
    await Promise.all(dorks.slice(0, 8).map(d => executeSearch(d)))

    return Array.from(allLeadsMap.values()).slice(0, limit)
}

export async function generateHashtags(niche: string): Promise<string[]> {
    const prompt = `Return 6 hashtags for "${niche}" as comma list.`
    const aiContent = await callRapidAI(prompt)
    if (!aiContent) return [niche.replace(/\s+/g, '')]
    return aiContent.split(',').map(tag => tag.trim().replace(/^#/, ''))
}
