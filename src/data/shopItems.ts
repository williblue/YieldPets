export interface FoodItemDef {
  id: string;
  name: string;
  description: string;
  price: number;
  heartRestore: number;
}

export interface FurnitureItemDef {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Full-room overlay image (same dimensions as iso_room.png) */
  imageUrl: string;
  /** Cropped thumbnail for shop display */
  thumbnailUrl: string;
}

export const FOOD_ITEMS: FoodItemDef[] = [
  {
    id: "kibble",
    name: "Basic Kibble",
    description: "A simple snack. Restores 1 heart.",
    price: 10,
    heartRestore: 1,
  },
  {
    id: "premium_meal",
    name: "Premium Meal",
    description: "A tasty treat. Restores 2 hearts.",
    price: 30,
    heartRestore: 2,
  },
  {
    id: "feast",
    name: "Grand Feast",
    description: "A royal banquet. Fully restores hearts.",
    price: 80,
    heartRestore: 4,
  },
];

// ─── Furniture (common items) ─────────────────────────────────
export const FURNITURE_ITEMS: FurnitureItemDef[] = [
  {
    id: "bone",
    name: "Chew Bone",
    description: "Every pet needs a favourite bone.",
    price: 20,
    imageUrl: "/furnitures/bone.png",
    thumbnailUrl: "/furniture thumbnail/bone thumbnail.png",
  },
  {
    id: "food_water_bowls",
    name: "Food & Water Bowls",
    description: "Keep your pet fed and hydrated.",
    price: 30,
    imageUrl: "/furnitures/food water bowls.png",
    thumbnailUrl: "/furniture thumbnail/food water bowls thumbnail.png",
  },
  {
    id: "blue_stool",
    name: "Blue Stool",
    description: "A cute little seat for anywhere.",
    price: 50,
    imageUrl: "/furnitures/blue stool.png",
    thumbnailUrl: "/furniture thumbnail/blue stool thumbnail.png",
  },
  {
    id: "purple_floor_cushion",
    name: "Floor Cushion",
    description: "A plush purple cushion to lounge on.",
    price: 60,
    imageUrl: "/furnitures/purple floor cushion.png",
    thumbnailUrl: "/furniture thumbnail/purple floor cushion thumbnail.png",
  },
  {
    id: "tiny_tripod_table_candle",
    name: "Tripod Candle Table",
    description: "A tiny table with a cozy candle.",
    price: 70,
    imageUrl: "/furnitures/tiny tripod table candle .png",
    thumbnailUrl: "/furniture thumbnail/tiny tripod table candle thumbnail.png",
  },
  {
    id: "star_book_stack",
    name: "Star Book Stack",
    description: "A tower of bedtime stories.",
    price: 75,
    imageUrl: "/furnitures/star book stack.png",
    thumbnailUrl: "/furniture thumbnail/star book stack thumbnail.png",
  },
  {
    id: "shag_rug",
    name: "Shag Rug",
    description: "A fluffy pink rug for the floor.",
    price: 80,
    imageUrl: "/furnitures/shag rug.png",
    thumbnailUrl: "/furniture thumbnail/shag rug thumbnail.png",
  },
  {
    id: "pink_vase_plant",
    name: "Pink Vase Plant",
    description: "A cheerful potted plant in a pink vase.",
    price: 90,
    imageUrl: "/furnitures/pink vase plant.png",
    thumbnailUrl: "/furniture thumbnail/retrpink vase plant thumbnail.png",
  },
  {
    id: "table",
    name: "Coffee Table",
    description: "A sturdy table for snacks and games.",
    price: 100,
    imageUrl: "/furnitures/table.png",
    thumbnailUrl: "/furniture thumbnail/table thumbnail.png",
  },
  {
    id: "vinyl_record_crate",
    name: "Vinyl Crate",
    description: "A crate full of tiny vinyl records.",
    price: 110,
    imageUrl: "/furnitures/vinyl record crate.png",
    thumbnailUrl: "/furniture thumbnail/vinyl record crate thumbnail.png",
  },
  {
    id: "floating_wall_shelf",
    name: "Floating Shelf",
    description: "A wall shelf for trinkets and treasures.",
    price: 120,
    imageUrl: "/furnitures/floating wall shelf.png",
    thumbnailUrl: "/furniture thumbnail/floating wall shelf thumbnail.png",
  },
  {
    id: "blue_sofa",
    name: "Blue Sofa",
    description: "A comfy sofa with a star cushion.",
    price: 150,
    imageUrl: "/furnitures/blue sofa.png",
    thumbnailUrl: "/furniture thumbnail/blue sofa thumbnail.png",
  },
];

// ─── Exclusives (premium / wall decor / special) ──────────────
export const EXCLUSIVE_ITEMS: FurnitureItemDef[] = [
  {
    id: "bear_frame",
    name: "Bear Portrait",
    description: "An adorable framed bear painting.",
    price: 180,
    imageUrl: "/furnitures/bear frame.png",
    thumbnailUrl: "/furniture thumbnail/bear frame thumbnail.png",
  },
  {
    id: "window",
    name: "Arched Window",
    description: "Let the sunlight pour in.",
    price: 200,
    imageUrl: "/furnitures/window.png",
    thumbnailUrl: "/furniture thumbnail/window thumbnail.png",
  },
  {
    id: "wall_mounted_plant_rack",
    name: "Plant Rack",
    description: "A wall-mounted rack with happy plants.",
    price: 220,
    imageUrl: "/furnitures/wall mounted plant rack.png",
    thumbnailUrl: "/furniture thumbnail/wall mounted plant rack thumbnail.png",
  },
  {
    id: "round_window",
    name: "Round Window",
    description: "A charming circular window view.",
    price: 250,
    imageUrl: "/furnitures/round window.png",
    thumbnailUrl: "/furniture thumbnail/round window thumbnail.png",
  },
  {
    id: "polaroid_wall",
    name: "Polaroid Wall",
    description: "A cluster of precious pet memories.",
    price: 300,
    imageUrl: "/furnitures/polaroid photo wall cluster.png",
    thumbnailUrl: "/furniture thumbnail/polaroid photo wall cluster thumbnail.png",
  },
  {
    id: "retro_arcade",
    name: "Retro Arcade",
    description: "A mini arcade machine for game nights.",
    price: 500,
    imageUrl: "/furnitures/retro arcade machine.png",
    thumbnailUrl: "/furniture thumbnail/retro arcade machine thumbnail.png",
  },
];

/** All furniture for lookups */
export const ALL_FURNITURE: FurnitureItemDef[] = [...FURNITURE_ITEMS, ...EXCLUSIVE_ITEMS];
