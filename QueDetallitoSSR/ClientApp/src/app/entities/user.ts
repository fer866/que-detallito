export class User {
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export class Delivery {
    idDelivery?: number;
    alias?: string;
    nameDelivery?: string;
    phone?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    suburb?: string;
    town?: string;
    state?: string;
    longitude?: number;
    latitude?: number;
    specialAddress?: string;
}

export class CheckoutResponse {
    success?: boolean;
    requiresAction?: boolean;
    clientSecret?: string;
    idOrder?: number;
    orderYear?: number;
}

export const PasswordRegex: RegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]+$/);

export const TwoNamesRegex: RegExp = new RegExp(/(\w.+\s).{2,}/i);