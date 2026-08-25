export class Menu {
    name?: string;
    url?: string;
    icon?: string;
}

export const MenuOptions: Menu[] = [
    { name: "Novedades", url: "/home", icon: 'new_releases' },
    { name: "Regalos", url: "/gifts", icon: 'redeem' },
    { name: "Mis pedidos", url: "/user/orders", icon: 'shopping_bag' },
    { name: "Acerca de", url: "/about", icon: 'info' }
];