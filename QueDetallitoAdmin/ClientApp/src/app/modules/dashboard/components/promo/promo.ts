export class ListPromo {
    id?: number;
    name?: string;
    promoBegin?: string;
    promoExpires?: string;
    urlLocation?: string;
    urlLocationSm?: string;
    routerName?: string;
    routerParam?: string;
    queryParam?: string;
    isCategory: boolean = false;    
    isTemporal: boolean = false;
    isCarousel: boolean = false;
}

export class RouterName {
    name?: string;
    route?: string;
}

export const RouterList: RouterName[] = [
    { name: 'Regalos', route: '/gifts' },
    { name: 'Acerca de', route: '/about' },
    { name: 'Producto', route: '/product' }
];