
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Meal, GroceryItem } from './types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("Gemini SDK Initializing (Standard). Key present:", !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper to clean Markdown JSON
const scrubJSON = (text: string) => {
  // Removes ```json ... ``` blocks
  return text.replace(/```json\s?|```/g, '').trim();
};

export const shuffleMeal = async (currentMeal: Partial<Meal>): Promise<Partial<Meal>> => {
  try {
    const prompt = `Suggest a unique Indian dish for ${currentMeal.type} that is different from ${currentMeal.name}. 
    Return a JSON object with keys: name, cuisine, description (short), macros ({kcal, carbs, protein, fat}).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const data = JSON.parse(scrubJSON(text));
    const imageUrl = await generateDishImage(data.name);

    return {
      name: data.name,
      cuisine: data.cuisine,
      macros: data.macros,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Gemini shuffle failed:", error);
    return currentMeal;
  }
};

export const getRecipeDetails = async (mealName: string): Promise<Partial<Meal>> => {
  try {
    const prompt = `Provide a detailed recipe for "${mealName}". 
    Return a JSON object with: 
    - ingredients: string[] (with quantities)
    - instructions: string[] (step by step)
    - time: string
    - spice: string
    - serves: string
    - tip: string (Chef's secret)
    - macros: {kcal, carbs, protein, fat}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(scrubJSON(text));
  } catch (error) {
    console.error("Gemini recipe details failed:", error);
    return {};
  }
};

export const syncGroceryList = async (meals: Meal[]): Promise<GroceryItem[]> => {
  try {
    const mealNames = meals.map(m => m.name).join(", ");
    const prompt = `Generate a consolidated grocery shopping list for these Indian meals: ${mealNames}. 
    Categorize items into: Vegetables, Grains, Spices, Dairy, Meat, Essentials, Others.
    Return a JSON Array of objects with keys: name, quantity, category.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const rawItems = JSON.parse(scrubJSON(text));
    return rawItems.map((item: any, idx: number) => ({
      ...item,
      id: `ai-${idx}`,
      checked: false
    }));
  } catch (error) {
    console.error("Gemini grocery sync failed:", error);
    return [];
  }
};

export const generateFullPlan = async (): Promise<Meal[]> => {
  try {
    const prompt = `Generate a 7-day Indian meal plan (21 meals total: Breakfast, Lunch, Dinner for each day).
    Return a JSON Array of objects with keys: day (number 0-6), type (Breakfast/Lunch/Dinner), name, cuisine, description, macros.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const rawPlan = JSON.parse(scrubJSON(text));
    const planWithImages = await Promise.all(rawPlan.map(async (meal: any, idx: number) => {
      const imageUrl = await generateDishImage(meal.name);
      return {
        ...meal,
        id: `ai-meal-${idx}`,
        imageUrl: imageUrl,
        macros: meal.macros
      };
    }));
    return planWithImages;
  } catch (error) {
    console.error("Gemini full plan generation failed:", error);
    return [];
  }
};

export const scaleIngredients = async (dishName: string, servings: number, spice: string): Promise<string[]> => {
  try {
    const prompt = `Scale ingredients for "${dishName}" to serve ${servings} (Spice: ${spice}).
    Use precise full quantities (e.g. "2 cups", "500g"), NO decimals.
    Return a JSON Array of strings (e.g. ["500g Paneer", "2 Onions"]).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(scrubJSON(text));
  } catch (error) {
    console.error("Gemini scaling failed:", error);
    return [];
  }
};

export const classifyGroceryItem = async (input: string): Promise<Partial<GroceryItem>> => {
  try {
    const prompt = `Classify grocery item: "${input}".
    Return a JSON object with keys: name (Title Case), quantity, category (Vegetables/Grains/Spices/Dairy/Meat/Essentials/Others).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(scrubJSON(text));
  } catch (error) {
    console.error("Gemini classification failed:", error);
    return { name: input, quantity: "", category: "Others" };
  }
};

export const consolidateGroceryList = async (items: GroceryItem[]): Promise<GroceryItem[]> => {
  try {
    const rawItems = items.map(i => `${i.name} ${i.quantity}`).join(", ");
    const prompt = `Consolidate this grocery list. Merge duplicates, sum quantities, name in Title Case.
    List: ${rawItems}
    Return a JSON Array of objects with keys: name, quantity, category.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const consolidated = JSON.parse(scrubJSON(text));
    return consolidated.map((item: any, idx: number) => ({
      id: `consolidated-${Date.now()}-${idx}`,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      checked: false,
      addedBy: "Swaadly AI"
    }));
  } catch (error) {
    console.error("Gemini consolidation failed:", error);
    return items;
  }
};

export const parseZeptoItems = async (input: string): Promise<Array<{ name: string; quantity: string }>> => {
  try {
    const prompt = `Parse grocery list into name and quantity.
    Input: "${input}"
    Return a JSON Array of objects with keys: name (Title Case), quantity.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(scrubJSON(text));
  } catch (error) {
    console.error("Gemini Zepto parsing failed:", error);
    return [];
  }
};

export const getDishEnrichment = async (dishName: string): Promise<Partial<Meal>> => {
  return getRecipeDetails(dishName);
};

export const generateDishImage = async (dishName: string): Promise<string> => {
  const cleanName = dishName.replace(/\s/g, ',');
  return `https://loremflickr.com/600/400/indian,food,${cleanName}/all`;
};
