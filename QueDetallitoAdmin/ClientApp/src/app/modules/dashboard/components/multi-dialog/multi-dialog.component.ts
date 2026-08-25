import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-multi-dialog',
  templateUrl: './multi-dialog.component.html',
  styleUrls: ['./multi-dialog.component.scss']
})
export class MultiDialogComponent implements OnInit {
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogOptions,
    private dialogRef: MatDialogRef<MultiDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  onActionClicked(opt: number): void {
    this.dialogRef.close(opt);
  }

}

export class DialogOptions {
  title: string | undefined;
  okAction?: string;
  cancelAction?: string;
  otherAction: string | undefined;
  message: string | undefined;
  shortText: string | undefined;
  largeText: string | undefined;
}
