
import { FamilyMember, Meal, GroceryItem } from './types';

export const INITIAL_MEALS: Meal[] = [
  {
    id: '0',
    name: 'Idli Sambhar',
    cuisine: 'South Indian',
    imageUrl: 'https://loremflickr.com/600/400/indian,breakfast,idli/all',
    type: 'Breakfast',
    day: 0,
    macros: { kcal: 280, carbs: 45, protein: 8, fat: 4 }
  },
  {
    id: '1',
    name: 'Paneer Butter Masala',
    cuisine: 'Punjabi',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnDyEFIfcgvJqW8Wiww0PN8QYE18oOBGT4Ma9qWsBuA_ooZE6DGfZB98wEl8gbIxrvw7r5YvX8SUaVD8k3hxocogDbbPSEmBPBuxrMAXovF3nWSAeGScvbwTEhpn7xMAVME7LSMl4HJ9cb6X89xq4gUWslWzAp36MssDm8oD-08lo9D0V4Mk6yHd-HnaITeaobLBVgGZcO95msovNM2gK6xEOwcPc4_JRkX7Y0tQgqDY_vqYKqTv4Q0hdZw1q0StUCGJ8OL49oWSdV',
    type: 'Lunch',
    day: 0,
    macros: { kcal: 450, carbs: 35, protein: 18, fat: 28 }
  },
  {
    id: '1.5',
    name: 'Dal Tadka & Jeera Rice',
    cuisine: 'North Indian',
    imageUrl: 'https://loremflickr.com/600/400/indian,dinner,dal/all',
    type: 'Dinner',
    day: 0,
    macros: { kcal: 420, carbs: 55, protein: 15, fat: 12 }
  },
  {
    id: '2',
    name: 'Masala Dosa',
    cuisine: 'South Indian Cuisine',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4T6iLpGkYqTbz6haZjGEgeOrccG2ID_c01oDl3UCWmckWzWdGt1q90-9yGolWRqpu2_AijxFrsT9jZPmW567AyFQ32uJB6UArXdmkh22v5W6nvi3fbZ66G9iHQeJpruj-Pk--K_wCiU0xd8-NKFBiExxi-SgQnoQvctxJLor33DY_qxk2ol9CBMcmt890htRNbpm_Jlb9BO6mMbUC7rIN61QEEZYszcD4Y4DC-Rns2kGWYH0BSSyTX7guNZZZERcgYC-ghs2OLpRb',
    type: 'Lunch',
    day: 1,
    macros: { kcal: 380, carbs: 55, protein: 12, fat: 14 }
  }
];

export const GROCERY_ITEMS: GroceryItem[] = [
  { id: 'g1', name: 'Red Onions', quantity: '2 kg', category: 'Vegetables', checked: false, addedBy: 'Mom' },
  { id: 'g2', name: 'Ginger & Garlic', quantity: '250g each', category: 'Vegetables', checked: false },
  { id: 'g3', name: 'Turmeric (Haldi)', quantity: '100g packet', category: 'Spices & Masalas', checked: true },
  { id: 'g4', name: 'Garam Masala', quantity: '1 small box', category: 'Spices & Masalas', checked: false },
  { id: 'g5', name: 'Chakki Atta', quantity: '5 kg', category: 'Grains & Atta', checked: false }
];

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    name: 'Mom',
    role: 'Primary Cook',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXYX5wxFzo-2TCsgZV_Va3PBmaz2kFVTlrZLUhVQ75hNxQx5cJDQOyb9tDZkG8J0DITd9KZelq23Lz3KLPXvgLnjb-k1DM01Zgm28HINyTQJr2T5Ylo0_xI-2djk4CdLI9TzBquzwHe8X4haaifgnMVteQUCQAiorjWzSrwGBL1OhHPSkaEDGmT5ix0v9_rROhz2nX8SqNrjzxJ-v5_adcRokbCydezL9ng5YZS2mQkd77-uoH4xUCqaFo_A4V-Ab-JGY9HxvAYowI',
    tagline: 'North Indian Lover'
  },
  {
    name: 'Rahul',
    role: 'Taste Tester',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByZEw32sSiR6rnZK4DbOx20o_bnvQoePijSxbzvkATA1wcvoB5Oqx48UTO2EOkv2YC2gMpepod1Jnku-qsSyBSUDLE5Cz4-EM9MADijIr9OBiQ_kMWO1lzwNTgkI2WgLR2LQ5hsCxD2Zswu4leLVevrn6yl8D4Ik4LnsGanRFObFsIVcWSd0jxx-w2RfaRahZAg-oTfuqYJys-LarKniFUxuWaY2mcwvrHEdrLBwQS4jg8pVgxPYQYuaP8t_OgbQbNuO8SdUpYDXs_',
    tagline: 'NO MUSHROOMS',
    restriction: 'Mushrooms'
  },
  {
    name: 'Priya',
    role: 'Nutritionist',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTMHNXwhFYXDyMnwO_ifXoP1ZbdSOdETtUoVNwmYjziswl-DzLHcMWcfcpQDLNUwyPPD63wqi92ZK4wfcj7B_1Z93Trc_mwRZkm87dG7YFHnGONno6CiQZrmDzurfmGbIX4zBkF1Yp3tESZB4tYiYtR248acf8WRFczrpp9fCF4cYzwk12H2iRO_Usm7UWf3DkJZ3splgCXRpoPs0p1Cecem9jlOiiluVmDSQLq9p2PudaJiRgPVFXzexfGFj7vbAmORngwhiAUsO6',
    tagline: 'Quick & Healthy'
  }
];
