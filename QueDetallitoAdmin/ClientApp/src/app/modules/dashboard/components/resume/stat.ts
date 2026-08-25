export interface Stat {
    count: number;
    description: string;
    netAmount: number;
    grossAmount: number;
}

export interface StatNumbers {
    name: string;
    count: number;
}

export class CartItems {
    id?: number;
    name?: string;
    nameVariant?: string;
    quantity?: number;
    specialTxt?: string;
}