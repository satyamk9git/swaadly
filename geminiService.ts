
import { GoogleGenAI, Type } from "@google/genai";
import { Meal, GroceryItem } from './types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("Gemini SDK Initializing with key prefix:", apiKey.substring(0, 6));

const ai = new GoogleGenAI({ apiKey });

export const shuffleMeal = async (currentMeal: Partial<Meal>): Promise<Partial<Meal>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Suggest a unique Indian dish for ${currentMeal.type} that is different from ${currentMeal.name}. 
      Return a JSON object with name, cuisine, and a brief description.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            cuisine: { type: Type.STRING },
            description: { type: Type.STRING },
            macros: {
              type: Type.OBJECT,
              properties: {
                kcal: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["kcal", "carbs", "protein", "fat"]
            }
          },
          required: ["name", "cuisine", "macros"]
        }
      }
    });

    const result = JSON.parse(response.response.text());
    const imageUrl = await generateDishImage(result.name);
    return {
      name: result.name,
      cuisine: result.cuisine,
      macros: result.macros,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Gemini shuffle failed:", error);
    return currentMeal;
  }
};

export const getRecipeDetails = async (mealName: string): Promise<Partial<Meal>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{ role: 'user', parts: [{ text: `Provide a detailed recipe for "${mealName}". Include ingredients (with quantities), step-by-step instructions, prep time, spice level, serving size, and a "Chef's Secret Tip" for an authentic flavor. Return as JSON.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            time: { type: Type.STRING },
            spice: { type: Type.STRING },
            serves: { type: Type.STRING },
            tip: { type: Type.STRING },
            macros: {
              type: Type.OBJECT,
              properties: {
                kcal: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["kcal", "carbs", "protein", "fat"]
            }
          },
          required: ["ingredients", "instructions", "time", "spice", "serves", "macros", "tip"]
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Gemini recipe details failed:", error);
    return {};
  }
};

export const syncGroceryList = async (meals: Meal[]): Promise<GroceryItem[]> => {
  try {
    const mealNames = meals.map(m => m.name).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Generate a consolidated grocery shopping list for the following Indian meals: ${mealNames}. 
      Categorize items into groups like 'Vegetables', 'Grains', 'Spices', 'Dairy', etc. 
      Return an array of objects with name, quantity, and category.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["name", "quantity", "category"]
          }
        }
      }
    });

    const rawItems = JSON.parse(response.response.text());
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
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Generate a COMPREHENSIVE 7-day Indian meal plan starting from today. 
      You MUST provide EXACTLY 21 meals in total: 3 meals for each day (Breakfast, Lunch, and Dinner).
      Ensure regional variety and healthy options. 
      Return an array of 21 objects with: day (0-6, where 0 is today, 1 is tomorrow, etc.), type (MUST be 'Breakfast', 'Lunch', or 'Dinner'), name, cuisine, and a short description.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner'] },
              name: { type: Type.STRING },
              cuisine: { type: Type.STRING },
              description: { type: Type.STRING },
              macros: {
                type: Type.OBJECT,
                properties: {
                  kcal: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER }
                },
                required: ["kcal", "carbs", "protein", "fat"]
              }
            },
            required: ["day", "type", "name", "cuisine", "macros"]
          }
        }
      }
    });

    const rawPlan = JSON.parse(response.response.text());
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

export const getDishEnrichment = async (dishName: string): Promise<Partial<Meal>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Provide structural details for an Indian dish called "${dishName}". 
      Include cuisine type, a short description, nutritional macros, and a "Chef's Secret Tip". 
      Also provide detailed ingredients and instructions. Return as JSON.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cuisine: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            time: { type: Type.STRING },
            spice: { type: Type.STRING },
            serves: { type: Type.STRING },
            tip: { type: Type.STRING },
            macros: {
              type: Type.OBJECT,
              properties: {
                kcal: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["kcal", "carbs", "protein", "fat"]
            }
          },
          required: ["cuisine", "description", "ingredients", "instructions", "time", "spice", "serves", "macros", "tip"]
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Gemini dish enrichment failed:", error);
    return {};
  }
};

export const scaleIngredients = async (dishName: string, servings: number, spice: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `You are a culinary expert. Scale the ingredients for "${dishName}" to serve exactly ${servings} people with a ${spice} spice level. 
      IMPORTANT: Use ALWAYS definite, kitchen-friendly quantities. ABSOLUTELY NO decimals like 0.75 or 1.5. Use whole numbers (e.g., "1 tsp") or very simple kitchen fractions (e.g., "1 1/2 tbsp") only.
      Return ONLY a JSON array of strings, where each string is an ingredient with its scaled quantity (e.g., ["200g Paneer", "2 medium onions"]).` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Gemini scaling failed:", error);
    return [];
  }
};

export const classifyGroceryItem = async (input: string): Promise<Partial<GroceryItem>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Classify this grocery item into a category: "${input}". 
      Return a JSON object with: 
      - name: The item name in Title Case (e.g., "Chicken", "Red Onion").
      - quantity: The amount and unit (e.g., "2 kg", "1 packet").
      - category: One of ['Vegetables', 'Grains & Atta', 'Spices', 'Dairy', 'Meat', 'Essentials', 'Others'].
      Return ONLY the JSON.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            quantity: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["name", "quantity", "category"]
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Gemini classification failed:", error);
    return { name: input, quantity: "", category: "Others" };
  }
};

export const consolidateGroceryList = async (items: GroceryItem[]): Promise<GroceryItem[]> => {
  try {
    const rawItems = items.map(i => `${i.name} ${i.quantity}`).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Consolidate this grocery list. 
      - Recognize synonyms like "Aalu" and "Potato" and combine them. 
      - Sum up quantities for duplicate or similar items (e.g., "2 kg" + "5 kg" = "7 kg").
      - Categorize everything correctly into: ['Vegetables', 'Grains & Atta', 'Spices', 'Dairy', 'Meat', 'Essentials', 'Others'].
      - Format names in Title Case.
      - Return a JSON array of objects with 'name', 'quantity', 'category'.
      List: ${rawItems}. 
      Return ONLY the JSON array.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["name", "quantity", "category"]
          }
        }
      }
    });

    const consolidated = JSON.parse(response.response.text());
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
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: 'user', parts: [{
          text: `Parse these grocery items from a raw list and separate the name and quantity.
      Example Input: "Sausage 2 packet", "Paneer 400 g", "Aalu 5kg"
      Return a JSON array of objects with: 
      - name: The item name in Title Case (e.g., "Sausage", "Paneer").
      - quantity: The specific amount and unit (e.g., "2 Packet", "400 G").
      Input: "${input}"
      Return ONLY the JSON array.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.STRING }
            },
            required: ["name", "quantity"]
          }
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Gemini Zepto parsing failed:", error);
    return [];
  }
};

export const generateDishImage = async (dishName: string): Promise<string> => {
  const cleanName = dishName.replace(/\s/g, ',');
  return `https://loremflickr.com/600/400/indian,food,${cleanName}/all`;
};
