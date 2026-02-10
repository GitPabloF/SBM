import metascraper from "metascraper"
import metascraperTitle from "metascraper-title"
import metascraperDescription from "metascraper-description"
import metascraperImage from "metascraper-image"
import got from "got"

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
])

export interface URLMetadata {
  title?: string
  coverUrl?: string
  description?: string
}

/**
 * Extract metadata from a URL
 * @param url - The URL to extract metadata from
 * @returns The metadata
 */
const extractMetadata = async (url: string): Promise<URLMetadata> => {
  try {
    const { body: html, url: finalUrl } = await got(url)
    const metadata = await scraper({ html, url: finalUrl })

    return {
      title: metadata.title || undefined,
      coverUrl: metadata.image || undefined,
      description: metadata.description || undefined,
    }
  } catch (error) {
    console.error("Error extracting metadata:", error)
    return {}
  }
}

export default { extractMetadata }
