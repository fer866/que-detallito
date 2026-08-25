import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coverage',
  templateUrl: './coverage.component.html',
  styleUrls: ['./coverage.component.scss']
})
export class CoverageComponent implements OnInit {

  constructor(private router: Router, private dialogRef: MatDialogRef<CoverageComponent>) { }

  ngOnInit(): void {
  }

  goToCoverage(): void {
    this.router.navigate(['/about'], { fragment: 'coverage' }).finally(() => {
      this.dialogRef.close();
    });
  }

}
