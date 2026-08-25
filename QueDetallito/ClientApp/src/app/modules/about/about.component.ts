import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BackendApiService } from 'src/app/services/backend-api.service';
import { CoverageComponent } from '../shared/components/coverage/coverage.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  commentsForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(60)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(30), Validators.maxLength(300)])
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
    private service: BackendApiService,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.breakpoint.observe('(max-width: 600px)').pipe(takeUntil(this.unsubscribe$)).subscribe(o => this.mobile = o.matches);
    this.title.setTitle('Que Detallito | Acerca de');
    this.route.fragment.pipe(takeUntil(this.unsubscribe$)).subscribe(frag => {
      this.currentSection = frag;
      this.scrollToAnchor(this.currentSection);
    });
  }

  submitComments(): void {
    const value = this.commentsForm.value;
    this.service.contactUs(value).pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.commentsForm.reset();
      this.commentsForm.updateValueAndValidity();
      this.snack.open(c.message, 'descartar', { duration: 7000 });
    });
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  scrollToAnchor(location: string) {
    const element = document.querySelector('#' + location);
    if (element && element instanceof HTMLElement) {
      setTimeout(() => {
        window.scrollTo({ behavior: 'smooth', left: 0, top: element.offsetTop - (this.mobile ? 90 : 30) });
      }, 50);
    }
  }

  showCoverageMap(): void {
    this.dialog.open(CoverageComponent);
  }

}
