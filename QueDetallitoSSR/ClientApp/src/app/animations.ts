import { animate, query as q, state, style, transition, trigger, group, animateChild } from "@angular/animations";

const query = (s: any,a: any,o={optional:true})=>q(s,a,o);

export const flashAnimation =
    trigger('flashAnimation', [
        transition('* <=> *', [
            style({
                opacity: 1
            }),
            query(':enter, :leave', [
                style({
                    'background-color': 'white',
                    opacity: 1
                })
            ]),
            query(':enter', [
                animate('300ms ease-out', style({ opacity: 1 }))
            ]),
            query(':leave', [
                animate('300ms ease-out', style({ opacity: 0 }))
            ])
        ])
    ]);

export const fadeIn =
    trigger('fadeIn', [
        state('void', style({ opacity: 1 })),
        state('*', style({ opacity: 1 })),
        transition(':enter', [
            style({ opacity: 0 }),
            animate('300ms ease-out')
        ]),
        transition(':leave', [
            style({ opacity: 0 }),
            animate('300ms ease-out')
        ])
    ]);

export const fadeIn2 =
    trigger('fadeIn2', [
        state('in', style({ opacity: 1 })),
        transition(':enter', [
            style({ opacity: 0 }),
            animate(250)
        ]),
        transition(':leave', [
            animate(250, style({ opacity: 0 }))
        ])
    ]);

export const fade =
    trigger('fade', [ 
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('.7s ease-out', style({opacity: 1}))
      ])
    ]);

export const routerTransition = trigger('routerTransition', [
  transition('* => *', [
    query(':enter, :leave', style({ position: 'fixed', width:'100%',height:'100%' })),
    query(':enter', style({ transform: 'translateX(100%)' })),
    
    group([
      query(':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('1.0s ease-in-out', style({transform: 'translateX(-100%)'}))
      ]),
      query(':enter', [
        animate('1.0s ease-in-out', style({transform: 'translateX(0%)'})),
        animateChild()
      ])
    ]),
  ]),
]);

export const flyInOut = trigger('flyInOut', [
    state('void', style({ transform: 'translateX(0)' })),
    transition(':enter', [
      style({ transform: 'translateX(-100%)', position: 'fixed' }),
      animate('0.6s cubic-bezier(.68,.01,.38,.72)')
    ]),
    transition(':leave', [
      animate('0.6s cubic-bezier(.68,.01,.38,.72)', style({ transform: 'translateX(100%)', position: 'fixed' }))
    ])
  ]);

export const fadeLoader =
  trigger('fadeLoader', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('.8s ease-in-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('.8s ease-in-out', style({ opacity: 0 }))
    ])
  ]);