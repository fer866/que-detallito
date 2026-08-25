import { Pipe, PipeTransform } from '@angular/core';
import { CategoryProduct, ListProducts } from 'src/app/entities/product';

@Pipe({
  name: 'filterProduct'
})
export class FilterProductPipe implements PipeTransform {

  transform(value: CategoryProduct[], searchValue?: string): CategoryProduct[] {
    if (!searchValue) {
      return value;
    } else {
      const search = searchValue.toLowerCase();
      const filtered: CategoryProduct[] = [];
      value.forEach(val => {
        if (
          !val.products?.some(p => p.name?.toLowerCase().includes(search)) &&
          !val.products?.some(p => p.categoryName?.toLowerCase().includes(search)) &&
          !val.products?.some(p => p.shortDesc?.toLowerCase().includes(search))
        ) {
          return;
        }
        let cat: CategoryProduct = {
          categoryName: val.categoryName,
          products: val.products.filter(p => {
            return p.name?.toLowerCase().includes(search) ||
                   p.categoryName?.toLowerCase().includes(search) ||
                   p.shortDesc?.toLowerCase().includes(search);
          })
        };
        filtered.push(cat);
      });
      return filtered;
    }
  }
}

@Pipe({
  name: 'filterCategory'
})
export class FilterCategoryPipe implements PipeTransform {

  transform(value: CategoryProduct[], category?: string): CategoryProduct[] {
    if (!category) {
      return value;
    } else {
      return value.filter(val => val.categoryName?.toLowerCase() === category.toLowerCase());
    }
  }
}

@Pipe({
  name: 'filterPrice'
})
export class FilterPricePipe implements PipeTransform {

  transform(value: CategoryProduct[], minPrice?: number, maxPrice?: number) {
    if (!minPrice && !maxPrice) {
      return value;
    } else {
      let listPrice: CategoryProduct[] = [];
      value.forEach(val => {
        if (minPrice && !maxPrice) {
          if (val.products?.some(p => (p.finalPrice || 0) >= minPrice)) {
            listPrice.push({ categoryName: val.categoryName, products: val.products.filter(p => (p.finalPrice || 0) >= minPrice) });
          }
        } else if (!minPrice && maxPrice) {
          if (val.products?.some(p => (p.finalPrice || 0) <= maxPrice)) {
            listPrice.push({ categoryName: val.categoryName, products: val.products.filter(p => (p.finalPrice || 0) <= maxPrice) });
          }
        } else {
          if (val.products?.some(p => (p.finalPrice || 0) >= (minPrice || 0) && (p.finalPrice || 0) <= (maxPrice || 0))) {
            listPrice.push({ categoryName: val.categoryName, products: val.products.filter(p => (p.finalPrice || 0) >= (minPrice || 0) && (p.finalPrice || 0) <= (maxPrice || 0)) });
          }
        }
      });
      return listPrice;
    }
  }
}

@Pipe({
  name: 'order'
})
export class OrderPipe implements PipeTransform {

  transform(value: CategoryProduct[], type?: string) {
    if (!type) {
      return value;
    } else {
      const obj: OrderType = this.getPropAndType(type);
      let orderList: CategoryProduct[] = [];
      let cat: CategoryProduct = {categoryName: '', products: []};
      value.forEach(val => {
        val.products?.forEach(p => cat.products?.push(p));
      });
      cat.products = cat.products?.sort((a1, a2) => {
        if ((a1[obj.type] || 0) > (a2[obj.type] || 0)) {
          if (obj.ascending) {
            return 1;
          } else {
            return -1;
          }
        }
        if ((a1[obj.type] || 0) < (a2[obj.type] || 0)) {
          if (obj.ascending) {
            return -1;
          } else {
            return 1;
          }
        }
        return 0;
      });
      orderList.push(cat);
      return orderList;
    }
  }

  getPropAndType(type: string): OrderType {
    let value: OrderType = new OrderType();
    switch (type) {
      case 'priceAsc':
        value.type = 'finalPrice';
        value.ascending = true;
        break;
      case 'priceDes':
        value.type = 'finalPrice';
        value.ascending = false;
        break;
      case 'nameAsc':
        value.type = 'name';
        value.ascending = true;
        break;
      case 'nameDes':
        value.type = 'name';
        value.ascending = false;
        break;
    }
    return value;
  }
}

class OrderType {
  type: keyof ListProducts = 'finalPrice';
  ascending?: boolean;
}