import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Discount, OrderPost } from 'src/app/entities/checkout';
import { CheckoutResponse, TwoNamesRegex } from 'src/app/entities/user';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ThemeService } from 'src/app/services/theme.service';

declare const paypal: any;
declare const stripe: any;
declare const elements: any;

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribe$ = new Subject();
  @Input() message?: any;
  @Input() delivery?: any;
  @Input() discount?: Discount;
  tabIndex: number = 0;
  faPaypal = faPaypal;
  @ViewChild('paypal', { static: false }) paypalElement?: ElementRef;
  @ViewChild('cardInfo', { static: false }) cardInfo?: ElementRef;
  card?: any;
  cardError?: string;
  oxxoForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(60), Validators.pattern(TwoNamesRegex)]),
    email: new FormControl('', [Validators.required, Validators.email])
  });
  oxxoError?: string;
  cardInProcess: boolean = false;
  paypalError?: string;

  constructor(
    private service: CheckoutService,
    private snack: MatSnackBar,
    private zone: NgZone,
    private theme: ThemeService,
    private router: Router,
    private cartService: CartService
  ) { }

  ngAfterViewInit(): void {
    this.initCard();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.card) {
      this.card.destroy();
    }
  }

  ngOnInit(): void {
    this.theme.isDark.pipe(takeUntil(this.unsubscribe$)).subscribe(t => {
      if (this.card) {
        this.card.update({style: {
          base: {color: t ? '#fff' : '#333', iconColor: t ? '#fff' : '#333'}
        }});
      } else {
        this.card = elements.create('card', {style: {
          base: {color: t ? '#fff' : '#333', fontFamily: 'Roboto, sans-serif', fontSize: '16px', iconColor: t ? '#fff' : '#333'}
        }});
      }
    });
  }

  initCard(): void {
    if (this.card) {
      this.card.unmount();
    }
    if (this.cardInfo?.nativeElement) {
      this.card.mount(this.cardInfo.nativeElement);
      this.card.addEventListener('change', this.onCardChange.bind(this));
    }
  }

  onCardChange({ error }: any) {
    this.zone.run(() => {
      if (error) {
        this.cardError = error.message;
      } else {
        this.cardError = undefined;
      }
    });
  }

  async onCardClick(): Promise<void> {
    this.cardError = undefined;
    this.cardInProcess = true;
    const { paymentMethod, error }: any = await stripe.createPaymentMethod({
      type: 'card',
      card: this.card
    });
    if (error) {
      this.cardInProcess = false;
      this.zone.run(() => this.cardError = error.message);
    } else {
      const val = this.getPaymentData();
      val.methodId = paymentMethod.id;
      this.service.pay(val).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
        if (p.success) {
          this.snack.open('Pago exitoso', 'descartar', { duration: 7000 });
          this.cartService.getCartItems();
          this.router.navigate(['/user/checkout', (p.orderYear || 0), (p.idOrder || 0)]);
        } else if (p.requiresAction && p.clientSecret) {
          this.onCardPaymentIntent(p.clientSecret);
        }
      }, error => this.cardInProcess = false);
    }
  }

  async onCardPaymentIntent(clientSecret: string): Promise<void> {
    const { error, paymentIntent }: any = await stripe.handleCardAction(clientSecret);
    if (error) {
      this.cardError = error.message;
      this.cardInProcess = false;
    } else {
      const val = this.getPaymentData();
      val.intentId = paymentIntent.id;
      this.service.payConfirm(val).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
        this.snack.open('Pago exitoso', 'descartar', { duration: 7000 });
        this.cartService.getCartItems();
        this.router.navigate(['/user/checkout', (p.orderYear || 0), (p.idOrder || 0)]);
      }, error => this.cardInProcess = false);
    }
  }

  onOxxoSubmit(): void {
    this.oxxoForm.disable();
    const val = this.getPaymentData();
    this.service.payOxxo(val).pipe(takeUntil(this.unsubscribe$)).subscribe(o => {
      this.onOxxoPaymentIntent(o);
    });
  }

  async onOxxoPaymentIntent(p: CheckoutResponse): Promise<void> {
    const { paymentIntent, error }: any = await stripe.confirmOxxoPayment(
      p.clientSecret, {
        payment_method: { billing_details: {
          name: this.oxxoForm.controls.name.value,
          email: this.oxxoForm.controls.email.value
        }}
      }
    );
    if (error) {
      this.oxxoError = error.message;
      this.oxxoForm.enable();
    } else {
      this.cartService.getCartItems();
      this.router.navigate(['/user/checkout', (p.orderYear || 0), (p.idOrder || 0)]);
    }
  }

  initPaypal(): void {
    this.paypalError = undefined;
    if (!this.paypalElement) {
      return;
    }
    paypal.Buttons({
      createOrder: async (data: any, actions: any) => {
        this.paypalError = undefined;
        const val = this.getPaymentData();
        const result = await this.service.createPaypalOrder(val).toPromise();
        return result.orderID;
      },
      onApprove: async (data: any, actions: any) => {
        const val = this.getPaymentData();
        val.orderId = data.orderID;
        this.service.capturePaypalOrder(val).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
          this.snack.open('Pago exitoso', 'descartar', { duration: 7000 });
          this.cartService.getCartItems();
          this.router.navigate(['/user/checkout', (p.orderYear || 0), (p.idOrder || 0)]);
        });
      },
      onError: (err: any) => {
        this.paypalError = 'Ocurrió algo inesperado, favor de intentar más tarde';
      }
    }).render(this.paypalElement.nativeElement);
  }

  onTabChange(val: number): void {
    this.tabIndex = val;
    switch (val) {
      case 0:   //Card
        this.cardError = undefined;
        this.initCard();
        break;
      case 1:   //Paypal
        setTimeout(() => {
          this.initPaypal();
        }, 1);
        break;
      case 2:   //Oxxo
        this.oxxoError = undefined;
        this.oxxoForm.reset();
        break;
    }
  }

  getPaymentData(): OrderPost {
    const order: OrderPost = {
      idDelivery: this.delivery.idDelivery,
      idDiscount: this.discount?.id,
      font: this.message.font,
      note: this.message.note,
      sender: this.message.sender
    };
    return order;
  }

}
