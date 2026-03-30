/**
 * Seed script — run with:
 *   MONGODB_URI=... npx tsx scripts/seed.ts
 *
 * Creates 15 sample recipes across various categories.
 * Requires MONGODB_URI in env or .env.local
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createSlug } from "../src/lib/slugify";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set. Copy .env.local.example to .env.local and fill in your credentials.");
  process.exit(1);
}

// Minimal inline model to avoid module resolution issues in script
const IngredientSchema = new mongoose.Schema({ name: String, amount: Number, unit: String }, { _id: false });
const StepSchema = new mongoose.Schema({ order: Number, description: String }, { _id: false });
const RecipeSchema = new mongoose.Schema({
  title: String, description: String,
  thumbnail: { url: String, publicId: String },
  ingredients: [IngredientSchema], steps: [StepSchema],
  estimatedTime: Number, difficulty: String,
  categories: [String], servings: Number,
  tags: [String], suitableFor: [String], slug: String,
}, { timestamps: true });
const Recipe = mongoose.models.Recipe ?? mongoose.model("Recipe", RecipeSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
}, { timestamps: true });
const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

const SEED_USER = {
  name: "Admin",
  email: "snitramordep@gmail.com",
  password: "superadmin",
};

const SAMPLE_RECIPES = [
  {
    title: "Classic Spaghetti Carbonara",
    description: "Creamy Italian pasta with eggs, pancetta, Parmesan, and black pepper.",
    thumbnail: { url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800", publicId: "sample/carbonara" },
    estimatedTime: 25, difficulty: "medium", categories: ["pasta", "italian"], servings: 4,
    tags: ["quick", "classic"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "spaghetti", amount: 400, unit: "g" },
      { name: "pancetta", amount: 150, unit: "g" },
      { name: "eggs", amount: 4, unit: "piece" },
      { name: "parmesan", amount: 100, unit: "g" },
      { name: "black pepper", amount: 2, unit: "tsp" },
    ],
    steps: [
      { order: 1, description: "Cook spaghetti in salted boiling water until al dente." },
      { order: 2, description: "Fry pancetta in a large pan until crispy." },
      { order: 3, description: "Beat eggs with grated Parmesan and pepper." },
      { order: 4, description: "Remove pan from heat, add pasta and egg mixture, toss quickly to coat." },
    ],
  },
  {
    title: "Grilled Salmon with Lemon Butter",
    description: "Perfectly grilled salmon fillets with a rich lemon butter sauce and fresh herbs.",
    thumbnail: { url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800", publicId: "sample/salmon" },
    estimatedTime: 20, difficulty: "easy", categories: ["fish"], servings: 2,
    tags: ["healthy", "protein"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "salmon fillets", amount: 2, unit: "piece" },
      { name: "butter", amount: 50, unit: "g" },
      { name: "lemon", amount: 1, unit: "piece" },
      { name: "garlic", amount: 2, unit: "clove" },
      { name: "fresh dill", amount: 1, unit: "bunch" },
    ],
    steps: [
      { order: 1, description: "Season salmon with salt and pepper." },
      { order: 2, description: "Grill over medium-high heat for 4 minutes per side." },
      { order: 3, description: "Melt butter with garlic and lemon juice, drizzle over fish." },
    ],
  },
  {
    title: "Chicken Tikka Masala",
    description: "Tender chicken in a rich, spiced tomato-cream sauce — a beloved Indian classic.",
    thumbnail: { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800", publicId: "sample/tikka" },
    estimatedTime: 45, difficulty: "medium", categories: ["meat", "indian"], servings: 4,
    tags: ["spicy", "creamy"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "chicken breast", amount: 600, unit: "g" },
      { name: "yogurt", amount: 200, unit: "ml" },
      { name: "tomato sauce", amount: 400, unit: "ml" },
      { name: "heavy cream", amount: 150, unit: "ml" },
      { name: "garam masala", amount: 2, unit: "tsp" },
      { name: "onion", amount: 2, unit: "piece" },
      { name: "garlic", amount: 4, unit: "clove" },
    ],
    steps: [
      { order: 1, description: "Marinate chicken in yogurt and spices for at least 1 hour." },
      { order: 2, description: "Grill chicken until charred, then cut into chunks." },
      { order: 3, description: "Sauté onion and garlic, add tomato sauce and cream." },
      { order: 4, description: "Simmer chicken in sauce for 15 minutes." },
    ],
  },
  {
    title: "Avocado Toast with Poached Eggs",
    description: "Creamy smashed avocado on sourdough with perfectly poached eggs and chili flakes.",
    thumbnail: { url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800", publicId: "sample/avotoast" },
    estimatedTime: 15, difficulty: "easy", categories: ["breakfast", "vegetarian"], servings: 2,
    tags: ["healthy", "quick", "brunch"], suitableFor: ["breakfast"],
    ingredients: [
      { name: "sourdough bread", amount: 2, unit: "slice" },
      { name: "avocado", amount: 1, unit: "piece" },
      { name: "eggs", amount: 2, unit: "piece" },
      { name: "lemon juice", amount: 1, unit: "tbsp" },
      { name: "chili flakes", amount: 1, unit: "tsp" },
    ],
    steps: [
      { order: 1, description: "Toast sourdough until golden." },
      { order: 2, description: "Mash avocado with lemon juice, salt and pepper." },
      { order: 3, description: "Poach eggs in simmering water with vinegar for 3 minutes." },
      { order: 4, description: "Top toast with avocado and egg, sprinkle chili flakes." },
    ],
  },
  {
    title: "Beef Stir-Fry with Vegetables",
    description: "Quick and vibrant stir-fried beef with colorful vegetables in a savory soy-ginger sauce.",
    thumbnail: { url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800", publicId: "sample/stirfry" },
    estimatedTime: 20, difficulty: "easy", categories: ["meat", "chinese"], servings: 3,
    tags: ["quick", "asian"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "beef strips", amount: 400, unit: "g" },
      { name: "soy sauce", amount: 3, unit: "tbsp" },
      { name: "ginger", amount: 1, unit: "tbsp" },
      { name: "bell peppers", amount: 2, unit: "piece" },
      { name: "broccoli", amount: 200, unit: "g" },
      { name: "sesame oil", amount: 1, unit: "tbsp" },
    ],
    steps: [
      { order: 1, description: "Marinate beef in soy sauce and ginger for 15 minutes." },
      { order: 2, description: "Stir-fry beef over high heat until browned, set aside." },
      { order: 3, description: "Stir-fry vegetables until tender-crisp." },
      { order: 4, description: "Combine everything, drizzle with sesame oil." },
    ],
  },
  {
    title: "Chocolate Lava Cake",
    description: "Decadent warm chocolate cakes with a molten centre — pure indulgence in 30 minutes.",
    thumbnail: { url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800", publicId: "sample/lavacake" },
    estimatedTime: 30, difficulty: "medium", categories: ["dessert"], servings: 4,
    tags: ["sweet", "chocolate", "indulgent"], suitableFor: ["dinner"],
    ingredients: [
      { name: "dark chocolate", amount: 200, unit: "g" },
      { name: "butter", amount: 100, unit: "g" },
      { name: "eggs", amount: 4, unit: "piece" },
      { name: "sugar", amount: 80, unit: "g" },
      { name: "flour", amount: 50, unit: "g" },
    ],
    steps: [
      { order: 1, description: "Melt chocolate and butter together." },
      { order: 2, description: "Whisk eggs and sugar until pale. Fold in chocolate and flour." },
      { order: 3, description: "Pour into greased ramekins and refrigerate 30 min." },
      { order: 4, description: "Bake at 200°C for 12 minutes. Serve immediately." },
    ],
  },
  {
    title: "Vegetable Minestrone Soup",
    description: "A hearty Italian vegetable soup with beans, pasta, and seasonal vegetables.",
    thumbnail: { url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", publicId: "sample/minestrone" },
    estimatedTime: 40, difficulty: "easy", categories: ["soup", "italian", "vegetarian", "vegan"], servings: 6,
    tags: ["healthy", "warming", "batch-cook"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "canned tomatoes", amount: 400, unit: "ml" },
      { name: "cannellini beans", amount: 400, unit: "ml" },
      { name: "carrots", amount: 2, unit: "piece" },
      { name: "celery", amount: 2, unit: "piece" },
      { name: "pasta", amount: 100, unit: "g" },
      { name: "vegetable stock", amount: 1, unit: "l" },
      { name: "parmesan rind", amount: 1, unit: "piece" },
    ],
    steps: [
      { order: 1, description: "Sauté onion, carrot and celery until soft." },
      { order: 2, description: "Add tomatoes, stock, beans and parmesan rind. Simmer 20 min." },
      { order: 3, description: "Add pasta and cook until al dente." },
    ],
  },
  {
    title: "Greek Salad",
    description: "Crisp, refreshing salad with tomatoes, cucumber, olives, red onion and creamy feta.",
    thumbnail: { url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", publicId: "sample/greeksalad" },
    estimatedTime: 10, difficulty: "easy", categories: ["salad", "vegetarian"], servings: 2,
    tags: ["fresh", "quick", "no-cook"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "tomatoes", amount: 4, unit: "piece" },
      { name: "cucumber", amount: 1, unit: "piece" },
      { name: "feta cheese", amount: 150, unit: "g" },
      { name: "kalamata olives", amount: 80, unit: "g" },
      { name: "red onion", amount: 1, unit: "piece" },
      { name: "olive oil", amount: 3, unit: "tbsp" },
      { name: "dried oregano", amount: 1, unit: "tsp" },
    ],
    steps: [
      { order: 1, description: "Chop tomatoes, cucumber and onion into chunks." },
      { order: 2, description: "Combine with olives and top with feta block." },
      { order: 3, description: "Drizzle with olive oil and sprinkle with oregano." },
    ],
  },
  {
    title: "Fluffy Pancakes",
    description: "Light and fluffy American pancakes — perfect for lazy weekend mornings.",
    thumbnail: { url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800", publicId: "sample/pancakes" },
    estimatedTime: 20, difficulty: "easy", categories: ["breakfast", "american"], servings: 4,
    tags: ["sweet", "weekend", "brunch"], suitableFor: ["breakfast"],
    ingredients: [
      { name: "flour", amount: 200, unit: "g" },
      { name: "milk", amount: 250, unit: "ml" },
      { name: "eggs", amount: 2, unit: "piece" },
      { name: "baking powder", amount: 2, unit: "tsp" },
      { name: "sugar", amount: 2, unit: "tbsp" },
      { name: "butter", amount: 30, unit: "g" },
    ],
    steps: [
      { order: 1, description: "Mix dry ingredients together. Whisk wet ingredients separately." },
      { order: 2, description: "Combine wet and dry, don't overmix (lumps are ok)." },
      { order: 3, description: "Cook on buttered pan over medium heat, 2-3 min per side." },
    ],
  },
  {
    title: "Prawn Pad Thai",
    description: "Thailand's most iconic noodle dish — sweet, sour, salty and packed with flavour.",
    thumbnail: { url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800", publicId: "sample/padthai" },
    estimatedTime: 25, difficulty: "medium", categories: ["fish", "japanese"], servings: 2,
    tags: ["asian", "noodles"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "rice noodles", amount: 200, unit: "g" },
      { name: "prawns", amount: 300, unit: "g" },
      { name: "eggs", amount: 2, unit: "piece" },
      { name: "fish sauce", amount: 2, unit: "tbsp" },
      { name: "tamarind paste", amount: 2, unit: "tbsp" },
      { name: "beansprouts", amount: 100, unit: "g" },
      { name: "peanuts", amount: 50, unit: "g" },
    ],
    steps: [
      { order: 1, description: "Soak noodles in warm water for 30 min, drain." },
      { order: 2, description: "Stir-fry prawns in hot wok until pink." },
      { order: 3, description: "Add noodles, fish sauce, and tamarind. Toss well." },
      { order: 4, description: "Push to side, scramble eggs into wok, mix together." },
      { order: 5, description: "Serve topped with beansprouts and crushed peanuts." },
    ],
  },
  {
    title: "Overnight Oats",
    description: "No-cook oats soaked overnight with milk, chia seeds and your favourite toppings.",
    thumbnail: { url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800", publicId: "sample/oats" },
    estimatedTime: 5, difficulty: "easy", categories: ["breakfast", "vegan", "vegetarian"], servings: 1,
    tags: ["meal-prep", "healthy", "no-cook"], suitableFor: ["breakfast"],
    ingredients: [
      { name: "oats", amount: 60, unit: "g" },
      { name: "almond milk", amount: 150, unit: "ml" },
      { name: "chia seeds", amount: 1, unit: "tbsp" },
      { name: "honey", amount: 1, unit: "tbsp" },
      { name: "fresh berries", amount: 100, unit: "g" },
    ],
    steps: [
      { order: 1, description: "Mix oats, milk, chia seeds and honey in a jar." },
      { order: 2, description: "Cover and refrigerate overnight." },
      { order: 3, description: "Top with fresh berries and enjoy cold." },
    ],
  },
  {
    title: "Margherita Pizza",
    description: "The original Italian pizza — thin crispy base, San Marzano tomatoes and fresh mozzarella.",
    thumbnail: { url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", publicId: "sample/pizza" },
    estimatedTime: 90, difficulty: "hard", categories: ["italian", "vegetarian"], servings: 2,
    tags: ["homemade", "weekend"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "bread flour", amount: 300, unit: "g" },
      { name: "yeast", amount: 7, unit: "g" },
      { name: "passata", amount: 200, unit: "ml" },
      { name: "mozzarella", amount: 250, unit: "g" },
      { name: "fresh basil", amount: 1, unit: "bunch" },
      { name: "olive oil", amount: 2, unit: "tbsp" },
    ],
    steps: [
      { order: 1, description: "Mix flour, yeast, salt and water. Knead 10 min. Prove 1 hour." },
      { order: 2, description: "Stretch dough thin on a floured surface." },
      { order: 3, description: "Top with passata, torn mozzarella and oil." },
      { order: 4, description: "Bake at 250°C for 10-12 minutes until charred." },
      { order: 5, description: "Finish with fresh basil." },
    ],
  },
  {
    title: "Scrambled Eggs with Smoked Salmon",
    description: "Silky, slowly scrambled eggs with luxurious smoked salmon and chives on toast.",
    thumbnail: { url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800", publicId: "sample/scrambledsalmon" },
    estimatedTime: 10, difficulty: "easy", categories: ["breakfast", "fish"], servings: 2,
    tags: ["quick", "brunch", "protein"], suitableFor: ["breakfast"],
    ingredients: [
      { name: "eggs", amount: 4, unit: "piece" },
      { name: "smoked salmon", amount: 100, unit: "g" },
      { name: "butter", amount: 20, unit: "g" },
      { name: "chives", amount: 1, unit: "bunch" },
      { name: "sourdough bread", amount: 2, unit: "slice" },
    ],
    steps: [
      { order: 1, description: "Whisk eggs with a splash of cream, salt and pepper." },
      { order: 2, description: "Cook slowly in butter over low heat, stirring constantly." },
      { order: 3, description: "Remove from heat slightly before done (carryover cooking)." },
      { order: 4, description: "Serve on toast with smoked salmon and chives." },
    ],
  },
  {
    title: "Tacos al Pastor",
    description: "Marinated pork tacos with pineapple, cilantro and salsa — the king of Mexican street food.",
    thumbnail: { url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800", publicId: "sample/tacos" },
    estimatedTime: 35, difficulty: "medium", categories: ["meat", "mexican"], servings: 4,
    tags: ["spicy", "street-food"], suitableFor: ["lunch", "dinner"],
    ingredients: [
      { name: "pork shoulder", amount: 600, unit: "g" },
      { name: "corn tortillas", amount: 12, unit: "piece" },
      { name: "pineapple", amount: 200, unit: "g" },
      { name: "cilantro", amount: 1, unit: "bunch" },
      { name: "chipotle chili", amount: 2, unit: "piece" },
      { name: "lime", amount: 2, unit: "piece" },
      { name: "onion", amount: 1, unit: "piece" },
    ],
    steps: [
      { order: 1, description: "Blend chipotle, garlic, orange juice for marinade. Coat pork." },
      { order: 2, description: "Marinate at least 2 hours, then grill or pan-fry until caramelised." },
      { order: 3, description: "Slice thin and serve on warm tortillas with pineapple, cilantro and lime." },
    ],
  },
  {
    title: "Miso Soup with Tofu",
    description: "Warming Japanese miso broth with silken tofu, wakame seaweed and spring onions.",
    thumbnail: { url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", publicId: "sample/miso" },
    estimatedTime: 10, difficulty: "easy", categories: ["soup", "japanese", "vegan"], servings: 2,
    tags: ["quick", "light", "umami"], suitableFor: ["breakfast", "lunch"],
    ingredients: [
      { name: "dashi stock", amount: 600, unit: "ml" },
      { name: "white miso paste", amount: 2, unit: "tbsp" },
      { name: "silken tofu", amount: 200, unit: "g" },
      { name: "dried wakame", amount: 1, unit: "tbsp" },
      { name: "spring onions", amount: 2, unit: "piece" },
    ],
    steps: [
      { order: 1, description: "Heat dashi stock until just below boiling." },
      { order: 2, description: "Dissolve miso paste in a little stock, then add to pot." },
      { order: 3, description: "Add cubed tofu and wakame. Do not boil after adding miso." },
      { order: 4, description: "Serve immediately garnished with spring onions." },
    ],
  },
];

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected");

  // Seed admin user
  const existing = await User.findOne({ email: SEED_USER.email });
  if (!existing) {
    const hashed = await bcrypt.hash(SEED_USER.password, 10);
    await User.create({ ...SEED_USER, password: hashed });
    console.log(`✅ Admin user created: ${SEED_USER.email}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${SEED_USER.email}`);
  }

  // Clear existing
  await Recipe.deleteMany({});
  console.log("🗑️  Cleared existing recipes");

  for (const data of SAMPLE_RECIPES) {
    const slug = createSlug(data.title) + "-" + Math.random().toString(36).slice(2, 6);
    await Recipe.create({ ...data, slug });
    console.log(`✅ ${data.title}`);
  }

  console.log(`\n🎉 Seeded ${SAMPLE_RECIPES.length} recipes successfully!`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
