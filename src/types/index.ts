export type GoldNuggets = number;

export type HeartCount = 0 | 1 | 2 | 3 | 4;


export interface HUDState {
  goldNuggets: GoldNuggets;
  hearts: HeartCount;
  depositBalance: number;
  yieldPerDay: number;
  loading: boolean;
}

export interface PetState {
  imageUrl: string;
  petName: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isOwned: boolean;
  price?: GoldNuggets;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export interface RoomState {
  pet: PetState;
  furniture: FurnitureItem[];
  roomTheme: "default";
}

export type NavTab = "pet" | "build" | "shop" | "friends" | "settings";
