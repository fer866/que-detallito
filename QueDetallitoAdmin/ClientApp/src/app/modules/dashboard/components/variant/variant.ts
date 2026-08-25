export class Variant {
    idProduct?: number;
    idVariant?: number;
    nameVariant?: string;
    stock?: number;
    cost?: number;
    price?: number;
    discount?: number;
    nextAvailability?: number;
    custNumber?: boolean;
    custLetter?: boolean;
    custMessage?: boolean;
    active?: boolean;
    messageLength?: number;
}

export class FileImages {
    image?: Array<File>;
}

export class ListVariant {
    idVariant?: number;
    idProduct?: number;
    nameVariant?: string;
    stock?: number;
    cost?: number;
    price?: number;
    discount?: number;
    finalPrice?: number;
    nextAvailability?: number;
    custNumber?: boolean;
    custLetter?: boolean;
    custMessage?: boolean;
    created?: string;
    active?: boolean;
    messageLength?: number;
}

export class ProductImage {
    idProduct?: number;
    idVariant?: number;
    noImage?: number;
    urlLocation?: string;
    created?: string;
}