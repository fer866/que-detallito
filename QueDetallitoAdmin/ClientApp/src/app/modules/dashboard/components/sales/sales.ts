export class ListSales {
    id?: number;
    orderYear?: number;
    idCustomer?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    idDelivery?: number;
    deliveryAddress?: string;
    nameDelivery?: string;
    deliveryPhone?: string;
    street?: string;
    deliveryNumber?: string;
    suburb?: string;
    town?: string;
    deliveryState?: string;
    zipCode?: string;
    specialAddress?: string;
    latitude?: number;
    longitude?: number;
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
    totalCost?: number;
    totalPrice?: number;
    totalProducts?: number;
    paymentDetails?: string;
    created?: string;
    modified?: string;
    remark?: string;
}

export class OrderProduct {
    idOrder?: number;
    orderYear?: number;
    idProduct?: number;
    name?: string;
    categoryName?: string;
    idVariant?: number;
    nameVariant?: string;
    urlLocation?: string;
    quantity?: number;
    cost?: number;
    price?: number;
    discount?: number;
    finalPrice?: number;
    specialTxt?: string;
}

export class Delivery {
    idDelivery?: number;
    nameDelivery?: string;
    phone?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    suburb?: string;
    town?: string;
    state?: string;
    specialAddress?: string;
}

export class ChangeOrderStatus {
    idOrder?: number;
    orderYear?: number;
    idStatus?: number;
    orderStatus?: string;
}