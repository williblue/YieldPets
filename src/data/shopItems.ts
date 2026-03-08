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
  imageUrl: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
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

export const FURNITURE_ITEMS: FurnitureItemDef[] = [
  {
    id: "rug_pink",
    name: "Cozy Rug",
    description: "A soft pink rug for the room.",
    price: 100,
    imageUrl: "/furniture/rug_pink.png",
    positionX: 50,
    positionY: 70,
    width: 80,
    height: 40,
  },
  {
    id: "plant_pot",
    name: "Potted Plant",
    description: "A little greenery to brighten the room.",
    price: 150,
    imageUrl: "/furniture/plant_pot.png",
    positionX: 15,
    positionY: 45,
    width: 40,
    height: 60,
  },
  {
    id: "lamp_star",
    name: "Star Lamp",
    description: "A warm glow for cozy evenings.",
    price: 200,
    imageUrl: "/furniture/lamp_star.png",
    positionX: 82,
    positionY: 35,
    width: 35,
    height: 55,
  },
  {
    id: "bed_cloud",
    name: "Cloud Bed",
    description: "A fluffy bed for your pet to nap on.",
    price: 300,
    imageUrl: "/furniture/bed_cloud.png",
    positionX: 60,
    positionY: 55,
    width: 70,
    height: 45,
  },
  {
    id: "bookshelf",
    name: "Mini Bookshelf",
    description: "Stacked with tiny storybooks.",
    price: 250,
    imageUrl: "/furniture/bookshelf.png",
    positionX: 25,
    positionY: 30,
    width: 45,
    height: 65,
  },
  {
    id: "fountain",
    name: "Bubble Fountain",
    description: "A relaxing water feature.",
    price: 500,
    imageUrl: "/furniture/fountain.png",
    positionX: 50,
    positionY: 40,
    width: 50,
    height: 55,
  },
];
