import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ListProducts } from 'src/app/entities/product';
import { WishlistService } from 'src/app/services/wishlist.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  mobile: Observable<boolean> = EMPTY;
  dataSource: MatTableDataSource<ListProducts> = new MatTableDataSource();
  displayCols: string[] = ['url', 'name', 'price', 'stock', 'buy', 'delete'];

  constructor(
    private title: Title,
    private wishlist: WishlistService,
    private breakpoint: BreakpointObserver,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.mobile = this.breakpoint.observe('(max-width: 600px)').pipe(map(b => b.matches), shareReplay(1));
    this.title.setTitle('Que Detallito | lista de deseos');
    this.wishlist.products.pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this.dataSource = new MatTableDataSource(p);
    });
  }

  deleteProduct(p: ListProducts): void {
    const confirm = this.dialog.open(ConfirmDialogComponent, {
      data: new ConfirmDialogData('Confirmar', `¿Quieres eliminar ${p.name} de tus favoritos?`) });
    confirm.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((c: ConfirmDialogData) => {
      if (c.action === 'confirm') {
        this.wishlist.removeWishlistProduct(p.id || 0);
      }
    });
  }

}
