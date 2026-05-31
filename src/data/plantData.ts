
export interface PlantInfo {
  commonName: string;
  scientificName: string;
  family: string;
  benefits: string[];
  uses: string[];
  parts: string[];
  emoji: string;
}

/**
 * Key = scientific name (exactly as the model outputs it, case-insensitive
 * matching is done at lookup time).
 */
export const PLANT_DATABASE: Record<string, PlantInfo> = {
  // ─── Popular Ayurvedic Plants ───────────────────────────────────
  "tulsi": {
    commonName: "Tulsi (Holy Basil)",
    scientificName: "Ocimum tenuiflorum",
    family: "Lamiaceae",
    emoji: "🌿",
    benefits: [
      "Boosts immunity & fights infections",
      "Reduces stress & anxiety (adaptogen)",
      "Anti-inflammatory & antioxidant",
      "Supports respiratory health",
      "Balances blood sugar levels",
    ],
    uses: ["Tulsi tea", "Kadha (herbal decoction)", "Essential oil", "Fresh leaf chewing"],
    parts: ["Leaves", "Seeds", "Root"],
  },

  "neem": {
    commonName: "Neem",
    scientificName: "Azadirachta indica",
    family: "Meliaceae",
    emoji: "🌳",
    benefits: [
      "Powerful antibacterial & antifungal",
      "Purifies blood & detoxifies",
      "Treats skin disorders (acne, eczema)",
      "Supports oral & dental health",
      "Natural insect repellent",
    ],
    uses: ["Neem oil", "Neem paste for skin", "Neem water bathing", "Neem stick for teeth"],
    parts: ["Leaves", "Bark", "Seeds", "Oil"],
  },

  "aloe_vera": {
    commonName: "Aloe Vera (Ghritkumari)",
    scientificName: "Aloe vera",
    family: "Asphodelaceae",
    emoji: "🪴",
    benefits: [
      "Heals burns & wounds rapidly",
      "Moisturises & rejuvenates skin",
      "Aids digestion & relieves constipation",
      "Rich in vitamins A, C, E and B12",
      "Anti-aging properties",
    ],
    uses: ["Topical gel", "Aloe juice", "Face mask", "Shampoo additive"],
    parts: ["Leaf gel", "Leaf latex"],
  },

  "Curcuma longa": {
    commonName: "Turmeric (Haldi)",
    scientificName: "Curcuma longa",
    family: "Zingiberaceae",
    emoji: "🟡",
    benefits: [
      "Potent anti-inflammatory (curcumin)",
      "Strong antioxidant activity",
      "Boosts brain function & memory",
      "Supports joint & heart health",
      "Aids liver detoxification",
    ],
    uses: ["Golden milk (Haldi Doodh)", "Cooking spice", "Turmeric paste for wounds", "Supplements"],
    parts: ["Rhizome"],
  },

  "ashwagandha": {
    commonName: "Ashwagandha",
    scientificName: "Withania somnifera",
    family: "Solanaceae",
    emoji: "💪",
    benefits: [
      "Reduces cortisol & combats stress",
      "Improves strength & muscle recovery",
      "Enhances focus & cognitive function",
      "Boosts testosterone & fertility in men",
      "Supports thyroid function",
    ],
    uses: ["Powder in warm milk", "Capsule supplements", "Churna (herbal powder)"],
    parts: ["Root", "Leaves"],
  },

  "Phyllanthus emblica": {
    commonName: "Amla (Indian Gooseberry)",
    scientificName: "Phyllanthus emblica",
    family: "Phyllanthaceae",
    emoji: "🫒",
    benefits: [
      "Richest natural source of Vitamin C",
      "Strengthens hair & prevents greying",
      "Improves digestion & metabolism",
      "Boosts immunity",
      "Anti-aging & skin-brightening",
    ],
    uses: ["Amla juice", "Chyawanprash ingredient", "Amla candy/murabba", "Hair oil"],
    parts: ["Fruit"],
  },

  "brahmi": {
    commonName: "Brahmi",
    scientificName: "Bacopa monnieri",
    family: "Plantaginaceae",
    emoji: "🧠",
    benefits: [
      "Enhances memory & learning ability",
      "Reduces anxiety & mental fatigue",
      "Neuroprotective antioxidant",
      "Supports concentration & focus",
      "Used in Ayurveda for epilepsy",
    ],
    uses: ["Brahmi ghee", "Herbal syrup", "Powder with honey", "Hair oil"],
    parts: ["Whole plant"],
  },

  "Zingiber officinale": {
    commonName: "Ginger (Adrak)",
    scientificName: "Zingiber officinale",
    family: "Zingiberaceae",
    emoji: "🫚",
    benefits: [
      "Relieves nausea & motion sickness",
      "Anti-inflammatory for joint pain",
      "Aids digestion & reduces bloating",
      "Boosts immunity during cold/flu",
      "Improves blood circulation",
    ],
    uses: ["Ginger tea", "Cooking spice", "Dried ginger powder (Saunth)", "Ginger juice with honey"],
    parts: ["Rhizome"],
  },

  "Mentha": {
    commonName: "Mint (Pudina)",
    scientificName: "Mentha spp.",
    family: "Lamiaceae",
    emoji: "🍃",
    benefits: [
      "Soothes digestive issues & IBS",
      "Relieves headaches & migraines",
      "Freshens breath & oral health",
      "Decongestant for cold/sinusitis",
      "Cooling & anti-spasmodic",
    ],
    uses: ["Mint chutney", "Peppermint tea", "Essential oil inhalation", "Salad garnish"],
    parts: ["Leaves"],
  },

  "Ricinus communis": {
    commonName: "Castor (Eranda)",
    scientificName: "Ricinus communis",
    family: "Euphorbiaceae",
    emoji: "🌱",
    benefits: [
      "Powerful natural laxative",
      "Promotes hair growth & thickness",
      "Reduces joint pain & inflammation",
      "Supports skin healing & moisturising",
      "Boosts lymphatic circulation",
    ],
    uses: ["Castor oil", "Topical oil packs", "Hair massage oil", "Ayurvedic Basti (enema)"],
    parts: ["Seeds (oil)", "Leaves", "Root"],
  },

  "Centella asiatica": {
    commonName: "Gotu Kola (Mandukaparni)",
    scientificName: "Centella asiatica",
    family: "Apiaceae",
    emoji: "🍀",
    benefits: [
      "Enhances memory & cognitive function",
      "Promotes wound & scar healing",
      "Reduces anxiety & depression",
      "Improves blood circulation",
      "Anti-aging for skin (collagen boost)",
    ],
    uses: ["Herbal tea", "Topical cream", "Juice/extract", "Supplement capsules"],
    parts: ["Leaves", "Stems"],
  },

  "Tinospora cordifolia": {
    commonName: "Giloy (Guduchi)",
    scientificName: "Tinospora cordifolia",
    family: "Menispermaceae",
    emoji: "🌿",
    benefits: [
      "Powerful immunomodulator",
      "Reduces fever (antipyretic)",
      "Manages blood sugar levels",
      "Detoxifies liver & kidneys",
      "Anti-arthritic properties",
    ],
    uses: ["Giloy juice", "Giloy kadha", "Tablet form", "Satva (starch extract)"],
    parts: ["Stem", "Root", "Leaves"],
  },

  "Moringa oleifera": {
    commonName: "Moringa (Drumstick Tree)",
    scientificName: "Moringa oleifera",
    family: "Moringaceae",
    emoji: "🌿",
    benefits: [
      "Superfood – rich in 90+ nutrients",
      "Anti-inflammatory & antioxidant",
      "Lowers blood sugar & cholesterol",
      "Supports bone health (calcium rich)",
      "Boosts breast milk production",
    ],
    uses: ["Moringa powder", "Drumstick curry", "Moringa tea", "Supplement capsules"],
    parts: ["Leaves", "Pods", "Seeds", "Bark"],
  },

  "Piper nigrum": {
    commonName: "Black Pepper (Kali Mirch)",
    scientificName: "Piper nigrum",
    family: "Piperaceae",
    emoji: "⚫",
    benefits: [
      "Enhances bioavailability of nutrients",
      "Improves digestion & metabolism",
      "Rich in piperine (antioxidant)",
      "Anti-inflammatory properties",
      "Supports weight management",
    ],
    uses: ["Cooking spice", "Trikatu formulation", "Black pepper + honey remedy", "Essential oil"],
    parts: ["Fruit (peppercorn)"],
  },

  "Santalum album": {
    commonName: "Sandalwood (Chandan)",
    scientificName: "Santalum album",
    family: "Santalaceae",
    emoji: "🪵",
    benefits: [
      "Cools & calms the mind",
      "Treats skin blemishes & acne",
      "Natural antiseptic & anti-inflammatory",
      "Used in meditation (aromatic)",
      "Supports urinary tract health",
    ],
    uses: ["Sandalwood paste", "Essential oil", "Incense sticks", "Ayurvedic face pack"],
    parts: ["Heartwood", "Oil"],
  },

  "Elettaria cardamomum": {
    commonName: "Cardamom (Elaichi)",
    scientificName: "Elettaria cardamomum",
    family: "Zingiberaceae",
    emoji: "🟢",
    benefits: [
      "Freshens breath & oral health",
      "Aids digestion & reduces acidity",
      "Detoxifies the body",
      "Controls blood pressure",
      "Anti-nausea properties",
    ],
    uses: ["Chai spice", "Mouth freshener", "Dessert flavoring", "Herbal decoction"],
    parts: ["Pods", "Seeds"],
  },

  "Cinnamomum verum": {
    commonName: "Cinnamon (Dalchini)",
    scientificName: "Cinnamomum verum",
    family: "Lauraceae",
    emoji: "🟤",
    benefits: [
      "Regulates blood sugar levels",
      "Powerful antioxidant & anti-inflammatory",
      "Supports heart health",
      "Antimicrobial properties",
      "Improves insulin sensitivity",
    ],
    uses: ["Tea/coffee spice", "Cooking", "Cinnamon water", "Supplement"],
    parts: ["Bark"],
  },

  "Syzygium aromaticum": {
    commonName: "Clove (Laung)",
    scientificName: "Syzygium aromaticum",
    family: "Myrtaceae",
    emoji: "🫘",
    benefits: [
      "Relieves toothache & oral pain",
      "Powerful antiseptic (eugenol)",
      "Aids digestion & reduces gas",
      "Boosts immunity",
      "Anti-inflammatory & analgesic",
    ],
    uses: ["Clove oil for toothache", "Cooking spice", "Herbal tea", "Mouth freshener"],
    parts: ["Flower buds", "Oil"],
  },

  "Coriandrum sativum": {
    commonName: "Coriander (Dhaniya)",
    scientificName: "Coriandrum sativum",
    family: "Apiaceae",
    emoji: "🌿",
    benefits: [
      "Aids digestion & relieves bloating",
      "Reduces cholesterol levels",
      "Anti-diabetic properties",
      "Rich in vitamins A, C, K",
      "Supports kidney function",
    ],
    uses: ["Fresh garnish", "Coriander water", "Cooking spice (seeds)", "Chutney"],
    parts: ["Leaves", "Seeds"],
  },

  "Foeniculum vulgare": {
    commonName: "Fennel (Saunf)",
    scientificName: "Foeniculum vulgare",
    family: "Apiaceae",
    emoji: "🌾",
    benefits: [
      "Relieves bloating & gas",
      "Improves eyesight & eye health",
      "Freshens breath naturally",
      "Supports lactation in nursing mothers",
      "Anti-spasmodic & cooling",
    ],
    uses: ["Mouth freshener", "Fennel water", "Cooking", "Fennel tea"],
    parts: ["Seeds", "Bulb"],
  },

  "Trigonella foenum-graecum": {
    commonName: "Fenugreek (Methi)",
    scientificName: "Trigonella foenum-graecum",
    family: "Fabaceae",
    emoji: "🌱",
    benefits: [
      "Lowers blood sugar & cholesterol",
      "Boosts testosterone in men",
      "Aids lactation in nursing mothers",
      "Improves hair health",
      "Anti-inflammatory & digestive",
    ],
    uses: ["Methi paratha", "Soaked seeds in morning", "Hair mask", "Supplement"],
    parts: ["Seeds", "Leaves"],
  },

  "Allium sativum": {
    commonName: "Garlic (Lahsun)",
    scientificName: "Allium sativum",
    family: "Amaryllidaceae",
    emoji: "🧄",
    benefits: [
      "Boosts heart health (allicin)",
      "Powerful natural antibiotic",
      "Lowers blood pressure & cholesterol",
      "Boosts immunity",
      "Anti-cancer properties (research)",
    ],
    uses: ["Raw morning clove", "Cooking", "Garlic oil", "Herbal remedy"],
    parts: ["Bulb (cloves)"],
  },

  "Cymbopogon citratus": {
    commonName: "Lemongrass",
    scientificName: "Cymbopogon citratus",
    family: "Poaceae",
    emoji: "🌾",
    benefits: [
      "Relieves anxiety & promotes sleep",
      "Natural fever reducer",
      "Aids digestion & detoxification",
      "Insect repellent",
      "Anti-inflammatory & analgesic",
    ],
    uses: ["Lemongrass tea", "Essential oil", "Cooking (Thai/Indian)", "Aromatherapy"],
    parts: ["Stalks", "Leaves"],
  },

  "Crocus sativus": {
    commonName: "Saffron (Kesar)",
    scientificName: "Crocus sativus",
    family: "Iridaceae",
    emoji: "🧡",
    benefits: [
      "Enhances mood & fights depression",
      "Improves skin complexion & glow",
      "Boosts memory & learning",
      "Supports eye health (macular protection)",
      "Aphrodisiac & fertility booster",
    ],
    uses: ["Kesar milk", "Cooking", "Skin care", "Ayurvedic formulations"],
    parts: ["Stigma (threads)"],
  },

  "Hibiscus rosa-sinensis": {
    commonName: "Hibiscus (Gudhal)",
    scientificName: "Hibiscus rosa-sinensis",
    family: "Malvaceae",
    emoji: "🌺",
    benefits: [
      "Promotes hair growth & reduces fall",
      "Lowers blood pressure naturally",
      "Rich in Vitamin C & antioxidants",
      "Supports menstrual health",
      "Improves liver function",
    ],
    uses: ["Hibiscus tea", "Hair oil infusion", "Flower paste for hair", "Face pack"],
    parts: ["Flowers", "Leaves"],
  },

  "Rosa": {
    commonName: "Rose (Gulab)",
    scientificName: "Rosa spp.",
    family: "Rosaceae",
    emoji: "🌹",
    benefits: [
      "Soothes & hydrates skin",
      "Reduces redness & inflammation",
      "Mild laxative & digestive aid",
      "Calms the mind & reduces stress",
      "Rich in Vitamin C",
    ],
    uses: ["Rose water", "Gulkand", "Rose tea", "Skincare toner"],
    parts: ["Petals"],
  },

  "Piper longum": {
    commonName: "Long Pepper (Pippali)",
    scientificName: "Piper longum",
    family: "Piperaceae",
    emoji: "🫑",
    benefits: [
      "Enhances digestion & appetite",
      "Supports respiratory health",
      "Boosts metabolism & bioavailability",
      "Part of Trikatu formulation",
      "Immunomodulatory properties",
    ],
    uses: ["Trikatu churna", "Honey + Pippali", "Cooking spice", "Herbal decoctions"],
    parts: ["Fruit", "Root"],
  },

  "Murraya koenigii": {
    commonName: "Curry Leaf (Kadi Patta)",
    scientificName: "Murraya koenigii",
    family: "Rutaceae",
    emoji: "🍃",
    benefits: [
      "Controls diabetes & blood sugar",
      "Supports hair health & prevents greying",
      "Rich in iron & folic acid",
      "Aids digestion",
      "Antioxidant & hepatoprotective",
    ],
    uses: ["Tempering/Tadka", "Curry leaf chutney", "Hair oil infusion", "Morning leaf chewing"],
    parts: ["Leaves"],
  },

  "Terminalia chebula": {
    commonName: "Haritaki (Chebulic Myrobalan)",
    scientificName: "Terminalia chebula",
    family: "Combretaceae",
    emoji: "🟤",
    benefits: [
      "King of herbs in Ayurveda",
      "Powerful detoxifier & rejuvenator",
      "Aids digestion & relieves constipation",
      "Improves cognitive function",
      "Part of Triphala formulation",
    ],
    uses: ["Triphala churna", "Haritaki powder with warm water", "Ayurvedic formulations"],
    parts: ["Fruit"],
  },

  "Terminalia bellirica": {
    commonName: "Bibhitaki (Belleric Myrobalan)",
    scientificName: "Terminalia bellirica",
    family: "Combretaceae",
    emoji: "🟤",
    benefits: [
      "Supports respiratory health",
      "Part of Triphala formulation",
      "Anti-bacterial & anti-viral",
      "Improves eyesight",
      "Controls cholesterol levels",
    ],
    uses: ["Triphala churna", "Herbal powder", "Ayurvedic formulations"],
    parts: ["Fruit"],
  },
};

/**
 * Look up a plant by its scientific name.
 * Does a case-insensitive, trimmed match.
 */
export function lookupPlant(scientificName: string): PlantInfo | null {
  const normalised = scientificName.trim().toLowerCase();
  for (const [key, info] of Object.entries(PLANT_DATABASE)) {
    if (key.toLowerCase() === normalised) return info;
  }
  return null;
}
