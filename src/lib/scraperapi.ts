
/**
 * ScraperAPI Utility
 * Provides bypass for blocked sites and improved data extraction.
 */

export async function scrapeTargetUrl(url: string) {
    const apiKey = process.env.SCRAPERAPI_KEY
    if (!apiKey) return null

    try {
        const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`
        const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(15000) })
        if (!response.ok) return null
        return await response.text()
    } catch (e) {
        console.error('ScraperAPI Error:', e)
        return null
    }
}

/**
 * Enhanced Search using ScraperAPI Google Search
 * This returns structured JSON from Google Search results.
 */
export async function scraperapiGoogleSearch(query: string) {
    const apiKey = process.env.SCRAPERAPI_KEY
    if (!apiKey) return null

    try {
        // ScraperAPI has a specific parameter for autoparsing search results
        const params = new URLSearchParams({
            api_key: apiKey,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}&num=30`,
            autoparse: 'true'
        })

        const response = await fetch(`https://api.scraperapi.com?${params.toString()}`)
        if (!response.ok) return null
        return await response.json()
    } catch (e) {
        console.error('ScraperAPI Search Error:', e)
        return null
    }
}
