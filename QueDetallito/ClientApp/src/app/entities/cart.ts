export class Cart {
    id?: number;
    categoryName?: string;
    name?: string;
    idVariant?: number;
    nameVariant?: string;
    stock?: number;
    quantity?: number;
    price?: number;
    finalPrice?: number;
    discount?: number;
    nextAvailability?: number;
    urlLocation?: string;
    deliveryDate?: string;
    idDeliveryTime?: number;
    deliveryTime?: string;
    specialTxt?: string;
}

export interface CartItem {
    idProduct: number;
    idVariant: number;
    quantity: number;
    deliveryDate: string;
    idDeliveryTime: number;
    specialTxt?: string;
}

export class CartVerification {
    isValid: boolean = false;
    minutesLeft?: number;
}
