
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

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(name) {
    console.log(`Testing model: ${name}...`);
    try {
        const model = genAI.getGenerativeModel({ model: name });
        const res = await model.generateContent("Hi");
        await res.response;
        console.log(`✅ ${name} WORKS!`);
        return true;
    } catch (e) {
        console.log(`❌ ${name} failed:`, e.message.split(' ')[0]);
        return false;
    }
}

async function verify() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-2.0-flash-exp");
}

verify();
