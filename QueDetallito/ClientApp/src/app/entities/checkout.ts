export class Font {
    name?: string;
    font?: string;
}

export const ListFonts: Font[] = [
    { name: 'Roboto', font: 'Roboto' },
    { name: 'Cormorant', font: 'Cormorant Infant' },
    { name: 'Indie', font: 'Indie Flower' },
    { name: 'Kalam', font: 'Kalam' },
    { name: 'Patrick', font: 'Patrick Hand' },
    { name: 'Satisfy', font: 'Satisfy' }
];

export class Discount {
    id?: number;
    discountCode?: string;
    discount?: number;
}

export class OrderPost {
    idDelivery?: number;
    idDiscount?: number;
    font?: string;
    note?: string;
    sender?: string;
    methodId?: string;
    intentId?: string;
    orderId?: string
}

export class Order {
    id?: number;
    orderYear?: number;
    idDelivery?: number;
    nameDelivery?: string;
    street?: string;
    deliveryNumber?: string;
    suburb?: string;
    town?: string;
    deliveryState?: string;
    zipCode?: string;
    specialAddress?: string;
    idStatus?: number;
    orderStatus?: string;
    paymentMethod?: string;
    paymentMethodDetails?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    note?: string;
    font?: string;
    sender?: string;
    discount?: number;
    discountCode?: string;
    deliveryCost?: number;
    totalPrice?: number;
    totalProducts?: number;
    created?: string;
    remark?: string;
    urlLocation?: string;
}

export class OrderProducts {
    id?: number;
    orderYear?: number;
    idProduct?: number;
    name?: string;
    categoryName?: string;
    idVariant?: number;
    nameVariant?: string;
    urlLocation?: string;
    quantity?: number;
    price?: number;
    discount?: number;
    finalPrice?: number;
    specialTxt?: string;
}