import dotenv from "dotenv";
dotenv.config();

import { saveConstituents } from "./save-constituents";
import { saveNews } from "./save-news";
import { saveOHLC } from "./save-ohlc";
import { saveTechnicals } from "./save-techncials";

async function main() {
    await saveConstituents();
    await saveOHLC();
    await saveTechnicals();
    await saveNews();
}

main().catch(console.error);
