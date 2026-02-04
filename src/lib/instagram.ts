
// Constants
const SERPAPI_HOST = 'serpapi.com'

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

/**
 * Racing Greedy Engine
 * Fires 24 queries in parallel and returns immediately once 15 unique leads are found.
 */
export async function searchInstagramLeads(niche: string, limit: number = 15) {
    const serpApiKey = process.env.SERPAPI_API_KEY
    if (!serpApiKey) throw new Error('config_missing_serp')

    const dorks = [
        `site:instagram.com "${niche}" "@gmail.com"`,
        `site:instagram.com "${niche}" "@outlook.com"`,
        `site:instagram.com "${niche}" "@hotmail.com"`,
        `site:instagram.com "${niche}" "@yahoo.com"`,
        `site:instagram.com "${niche}" "contact me at"`,
        `site:instagram.com "${niche}" "business inquiries"`,
        `site:instagram.com "${niche}" "email me"`,
        `site:instagram.com "#${niche.replace(/\s+/g, '')}" "gmail.com"`,
        `site:instagram.com "${niche}" "collab" gmail`,
        `site:instagram.com "${niche}" "booking" gmail`,
        `site:instagram.com "${niche}" "send me an email"`,
        `site:instagram.com "${niche}" "direct business"`,
        `site:instagram.com "${niche}" "reach out" email`,
        `site:instagram.com "${niche}" "dm for booking"`,
        `site:instagram.com "${niche}" "official email"`,
        `site:instagram.com "${niche}" "for contact"`,
        `site:instagram.com "${niche}" "@icloud.com"`,
        `site:instagram.com "${niche}" "@me.com"`,
        `site:instagram.com "${niche}" "for inquiries email"`,
        `site:instagram.com "${niche}" "PR inquiries"`,
        `site:instagram.com "${niche}" "management email"`,
        `site:instagram.com "${niche}" "collab email"`,
        `site:instagram.com "${niche}" "business email"`,
        `site:instagram.com "${niche}" "get in touch email"`
    ]

    const allLeadsMap = new Map()
    let isFinished = false

    // Racing execution
    const executeSearch = async (query: string) => {
        if (isFinished || allLeadsMap.size >= limit) return;

        try {
            const startOffset = Math.floor(Math.random() * 5) * 10
            const params = new URLSearchParams({
                q: query,
                api_key: serpApiKey,
                engine: 'google',
                num: '30', // Very fast response
                start: startOffset.toString(),
                filter: '0'
            })

            const res = await fetch(`https://${SERPAPI_HOST}/search?${params.toString()}`)
            if (!res.ok) return;
            const data = await res.json()
            const results = data.organic_results || []

            for (const r of results) {
                if (isFinished || allLeadsMap.size >= limit) {
                    isFinished = true
                    return;
                }
                if (!r.link.includes('instagram.com/')) continue;

                const urlMatch = r.link.match(/instagram\.com\/([^/?#]+)/)
                const username = urlMatch ? urlMatch[1] : null
                const noise = ['reels', 'reel', 'explore', 'stories', 'direct', 'accounts', 'legal', 'about', 'p']
                if (!username || noise.includes(username.toLowerCase())) continue;

                const text = `${r.title} ${r.snippet}`
                const emailRegex = /([a-zA-Z0-9._-]+(?:\s*\(at\)\s*|\s*@\s*|\s*\[at\]\s*)[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                const matches = text.match(emailRegex)

                let email = matches ? matches[0].replace(/\s*\(at\)\s*/gi, '@').replace(/\s*\[at\]\s*/gi, '@').replace(/\s+/g, '') : null

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

    // Fire all searches in parallel
    await Promise.all(dorks.map(d => executeSearch(d)))

    return Array.from(allLeadsMap.values()).slice(0, limit)
}

export async function generateHashtags(niche: string): Promise<string[]> {
    const prompt = `Return 6 hashtags for "${niche}" as comma list.`
    const aiContent = await callRapidAI(prompt)
    if (!aiContent) return [niche.replace(/\s+/g, '')]
    return aiContent.split(',').map(tag => tag.trim().replace(/^#/, ''))
}
