
export enum Screen {
  Welcome = 'WELCOME',
  Onboarding = 'ONBOARDING',
  Planner = 'PLANNER',
  Grocery = 'GROCERY',
  Household = 'HOUSEHOLD',
  Recipe = 'RECIPE'
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export interface Macros {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  type: MealType;
  day: number; // 0-6 (Mon-Sun)
  ingredients?: string[];
  instructions?: string[];
  time?: string;
  spice?: string;
  serves?: string;
  macros?: Macros;
  tip?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  addedBy?: string;
}

export interface FamilyMember {
  name: string;
  role: string;
  avatar: string;
  tagline: string;
  restriction?: string;
}
