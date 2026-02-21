import dotenv from "dotenv";
import { getIndexConstituents } from "../fetchers/constituents";
import { getOHLC } from "../fetchers/ohlc";
import { getRedisClient } from "../redis/personal";
import { NIFTY_50_INDEX_CODE } from "../config/global";
import { GraphDuration } from "../types/global";
dotenv.config();

const DURATIONS: GraphDuration[] = ['1Y'];

async function saveOHLC() {
    const mbCodes = await getIndexConstituents(NIFTY_50_INDEX_CODE);
    console.log(`Fetched ${mbCodes.length} Nifty 50 constituents`);
    const client = await getRedisClient();
    try {
        for (const mbCode of mbCodes) {
            for (const duration of DURATIONS) {
                try {
                    const ohlc = await getOHLC({ mbCode, duration });
                    const key = `ohlc:${mbCode}:${duration}`;
                    await client.set(key, JSON.stringify(ohlc));
                    console.log(`Saved ${ohlc.length} records → ${key}`);
                } catch (err) {
                    console.error(`Failed ${mbCode} ${duration}:`, err);
                }
            }
        }
    } finally {
        await client.quit();
    }
}

saveOHLC().catch(console.error);
