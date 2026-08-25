import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginatorCustomService extends MatPaginatorIntl {
  itemsPerPageLabel = 'Registros por página';
  nextPageLabel = 'Siguiente';
  previousPageLabel = 'Anterior';

  getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return '0 de ' + length;
    }
    const startIdx = page * pageSize;
    const endIdx = startIdx < length ? Math.min(startIdx + pageSize, length) : startIdx + pageSize;

    return startIdx + 1 + ' - ' + endIdx + ' de ' + length;
  }
}
