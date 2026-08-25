export class Filter {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    order?: string;
}

export class SelectedFilter {
    key?: keyof Filter;
    value?: any;
}