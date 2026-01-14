
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.*)/);
    if (match) apiKey = match[1].trim().replace(/^["']|["']$/g, '');
} catch (e) { }

console.log(`Checking 2.0-flash with key: ${apiKey.substring(0, 5)}...`);
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
    try {
        const res = await model.generateContent("Hello");
        const response = await res.response;
        console.log("✅ SUCCESS: gemini-2.0-flash is working!");
        console.log("Response:", response.text());
    } catch (e) {
        console.log("❌ FAILED:", e.message);
    }
}
run();
