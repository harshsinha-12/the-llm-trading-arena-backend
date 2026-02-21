import dotenv from "dotenv";
import { getIndexConstituents } from "../fetchers/constituents";
import { getRedisClient } from "../redis/personal";
import { NIFTY_50_INDEX_CODE } from "../config/global";
import { OHLC } from "../types/global";
import { Technicals } from "../classes/technicals";
dotenv.config();

async function saveTechnicals() {
    const mbCodes = await getIndexConstituents(NIFTY_50_INDEX_CODE);
    console.log(`Fetched ${mbCodes.length} Nifty 50 constituents`);
    const client = await getRedisClient();
    try {
        for (const mbCode of mbCodes) {
            try {
                const raw = await client.get(`ohlc:${mbCode}:1Y`);
                if (!raw) {
                    console.warn(`No OHLC data for ${mbCode}, skipping`);
                    continue;
                }
                const ohlc: OHLC[] = JSON.parse(raw);
                const technicals = new Technicals(ohlc);
                const result = {
                    movingAverages: technicals.getMovingAverages(),
                    oscillators: technicals.getOscillators(),
                    overallSentiment: technicals.getOverallSentiment(),
                    perStockFeatures: technicals.getPerStockFeatures(),
                };
                const key = `technicals:${mbCode}`;
                await client.set(key, JSON.stringify(result));
                console.log(`Saved technicals → ${key}`);
            } catch (err) {
                console.error(`Failed ${mbCode}:`, err);
            }
        }
    } finally {
        await client.quit();
    }
}

saveTechnicals().catch(console.error);
