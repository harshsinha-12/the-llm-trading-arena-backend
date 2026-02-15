import dotenv from "dotenv";
import { getRedisClient } from "./redis";
import { OHLCDataPoint } from "./interface";
dotenv.config();

const OHLC_API_BASE = "https://www.multibagg.ai/api/v1/price-feed/ohlc";

async function fetchOHLC(mbCode: string, duration: string): Promise<OHLCDataPoint[]> {
    const url = `${OHLC_API_BASE}?mbCode=${mbCode}&duration=${duration}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OHLC API error: ${res.status} ${res.statusText}`);
    return res.json() as Promise<OHLCDataPoint[]>;
}

async function main() {
    const client = await getRedisClient();
    try {
        const data = await fetchOHLC("MBEQU5710", "10Y");
        const key = `ohlc:MBEQU5710:10Y`;
        await client.set(key, JSON.stringify(data));
        console.log(`Saved ${data.length} OHLC records to Redis key: ${key}`);
    } finally {
        await client.quit();
    }
}

main()
