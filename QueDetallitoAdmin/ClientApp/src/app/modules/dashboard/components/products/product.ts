export class Product {
    id: number | undefined;
    idCat: number | undefined;
    name: string | undefined;
    shortDesc: string | undefined;
    largeDesc: string | undefined;
    active: boolean | undefined;
    idSeason: number | undefined;
}

export class ListProduct {
    id: number | undefined;
    name: string | undefined;
    idCat: number | undefined;
    categoryName: string | undefined;
    shortDesc: string | undefined;
    largeDesc: string | undefined;
    cost: number | undefined;
    price: number | undefined;
    finalPrice: number | undefined;
    discount: number | undefined;
    urlLocation: string | undefined;
    active: boolean | undefined;
    idSeason: number | undefined;
    variantsCount: number | undefined;
}
