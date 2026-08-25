import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  commentsForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]),
    mail: new FormControl('', [Validators.required, Validators.email]),
    comment: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(300)])
  });
  whoWeAre: any;
  questions: any;
  currentSection: string = 'us';
  mobile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private snack: MatSnackBar,
    private breakpoint: BreakpointObserver,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.breakpoint.observe('(max-width: 600px)').pipe(takeUntil(this.unsubscribe$)).subscribe(o => this.mobile = o.matches);
    this.title.setTitle('Que Detallito | acerca de');
    this.route.fragment.pipe(takeUntil(this.unsubscribe$)).subscribe(frag => {
      this.currentSection = frag;
      this.scrollToAnchor(this.currentSection);
    });
  }

  submitComments(): void {
    this.commentsForm.reset();
    this.snack.open('¡Gracias por tus comentarios, en breve nos comunicaremos contigo!', 'descartar', {
      duration: 7000
    });
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  scrollToAnchor(location: string) {
    // const element = document.querySelector('#' + location);
    // if (element && element instanceof HTMLElement) {
    //   setTimeout(() => {
    //     window.scrollTo({ behavior: 'smooth', left: 0, top: element.offsetTop - (this.mobile ? 90 : 30) });
    //   }, 50);
    // }
    this.router.navigate([], { fragment: location });
  }

}
