export class Product {
    id?: number;
    categoryName?: string;
    name?: string;
    shortDesc?: string;
    largeDesc?: string;
    reviewStars?: number;
    reviewsCount?: number;
    variants?: Array<Variants>;
  }
  
  export class ListProducts {
    id?: number;
    categoryName?: string;
    name?: string;
    shortDesc?: string;
    price?: number;
    finalPrice?: number;
    discount?: number;
    urlLocation?: string;
    active?: boolean;
  }
  
  export class CategoryProduct {
    categoryName?: string;
    products?: Array<ListProducts>;
  }
  
  export class Variants {
    idVariant?: number;
    nameVariant?: string;
    stock?: number;
    price?: number;
    finalPrice?: number;
    discount?: number;
    nextAvailability?: number;
    custNumber: boolean = false;
    custLetter: boolean = false;
    custMessage: boolean = false;
    messageLength?: number;
    images?: Array<Images>;
  }
  
  export class Images {
    noImage?: number;
    urlLocation?: string;
  }

  export interface Promo {
    id: number;
    name: string;
    routerName: string;
    routerParam: string;
    queryParam: string;
    urlLocation: string;
    urlLocationSm: string;
    category: boolean;
    temporal: boolean;
    carousel: boolean;
  }

  export interface DeliveryTime {
    id: number;
    name: string;
  }

  export interface DeliveryDates {
    from: string;
    to: string;
  }

  export class ProductReview {
    idProduct?: number;
    customerName?: string;
    stars?: number;
    title?: string;
    review?: string;
    created?: string;
  }