import dotenv from "dotenv";
import { OHLCDataPoint } from "./interface";
import { getRedisClient } from "./redis";
dotenv.config();

async function main() {
    const client = await getRedisClient();
    try {
        const key = "ohlc:MBEQU5710:10Y";
        const raw = await client.get(key);
        if (!raw) {
            console.log("No OHLC data found. Run save-ohlc.ts first.");
            return;
        }
        const ohlc: OHLCDataPoint[] = JSON.parse(raw);
        console.log(`Read ${ohlc.length} OHLC records from Redis`);
        console.log("First 3 records:", ohlc.slice(0, 3));
    } finally {
        await client.quit();
    }
}

main().catch(console.error);
