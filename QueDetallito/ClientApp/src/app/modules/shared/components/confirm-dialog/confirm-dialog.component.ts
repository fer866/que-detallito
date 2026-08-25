import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  onActionClick(value: 'confirm' | 'cancel' | 'other'): void {
    this.data.action = value;
    this.dialogRef.close(this.data);
  }

}

export class ConfirmDialogData {
  title?: string;
  action?: 'confirm' | 'cancel' | 'other';
  confirmText: string = 'Aceptar';
  cancelText: string = 'Cancelar';
  otherText?: string;
  message?: string;
  constructor(title?: string, message?: string, confirm = 'Aceptar', cancel = "Cancelar") {
    this.title = title;
    this.message = message;
    this.confirmText = confirm;
    this.cancelText = cancel;
  }
}