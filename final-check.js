
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load Key
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.*)/);
    if (match) apiKey = match[1].trim().replace(/^["']|["']$/g, '');
} catch (e) { }

console.log(`🔑 Key Loaded: ${apiKey ? 'Yes' : 'No'} (${apiKey.substring(0, 6)}...)`);

// 1. List All Models
async function listModels() {
    console.log("\n📋 Fetching Available Models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.log("❌ API ERROR:", data.error.message);
            return [];
        }

        const names = (data.models || []).map(m => m.name.replace('models/', ''));
        console.log("✅ Models available for this key:");
        names.forEach(n => console.log(`   * ${n}`));
        return names;
    } catch (e) {
        console.log("Network Error listing models:", e.message);
        return [];
    }
}

// 2. Test Specific Models
const genAI = new GoogleGenerativeAI(apiKey);

async function tryGenerate(modelName) {
    process.stdout.write(`👉 Testing generation with '${modelName}'... `);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        const text = response.text();
        console.log("✅ SUCCESS!");
        return true;
    } catch (e) {
        console.log("❌ FAILED");
        // console.log("   Reason:", e.message.split('\n')[0]);
        return false;
    }
}

async function run() {
    const available = await listModels();

    console.log("\n🧪 verifying compatibility:");

    // Check the one the user wants
    await tryGenerate("gemini-1.5-flash");
    await tryGenerate("gemini-1.5-pro");

    // Check the one that likely works
    await tryGenerate("gemini-2.0-flash-exp");
    await tryGenerate("gemini-2.0-flash");
}

run();
