import dotenv from 'dotenv'
import { getIndexConstituents } from '../fetchers/constituents'
import { fetchNewsForStock } from '../fetchers/news'
import { getRedisClient } from '../redis/personal'
import { NIFTY_50_INDEX_CODE } from '../config/global'
import { getNameFromMBCode } from '../utils/codes'
dotenv.config()

async function saveNews() {
    const mbCodes = await getIndexConstituents(NIFTY_50_INDEX_CODE)
    console.log(`Fetched ${mbCodes.length} Nifty 50 constituents`)
    const nameMap = await getNameFromMBCode(mbCodes)
    const client = await getRedisClient()
    try {
        for (const mbCode of mbCodes) {
            try {
                const name = nameMap[mbCode]
                if (!name) {
                    console.warn(`No name found for ${mbCode}, skipping`)
                    continue
                }
                const news = await fetchNewsForStock(mbCode, name)
                const key = `news:${mbCode}`
                await client.set(key, JSON.stringify(news))
                console.log(`Saved ${news.length} news items → ${key} (${name})`)
            } catch (err) {
                console.error(`Failed ${mbCode}:`, err)
            }
        }
    } finally {
        await client.quit()
    }
}

saveNews().catch(console.error)
