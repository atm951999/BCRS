import { Component, Inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServicesService } from 'src/services/services.service';
import { MatListOption } from '@angular/material/list';
import { IService } from '../../models/services.interface';
import { HttpClient } from '@angular/common/http';
import { Invoice } from 'src/app/models/invoice';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.css']
})
export class InvoiceDialogComponent implements OnInit {

  date : string;
  totalCharge : number;
  invoice: Invoice;

  constructor(private cookieService: CookieService, private http: HttpClient, private datePipe: DatePipe, @Inject(MAT_DIALOG_DATA) public data: { services: IService[],
    laborHours: number,
    partsAmount: number
  }) {
    this.date = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');

  }

  getSelectedServices(): IService[]{
    return this.data.services.filter(service => service.selected);
  }

  createInvoice(): void {
    this.http.post(`/api/invoice/${this.invoice.getUserName()}`, {
        userName : this.invoice.getUserName(),
        lineItems: this.invoice.getLineItems(),
        partsAmount: this.data.partsAmount,
        laborAmount: this.data.laborHours*50,
        lineItemTotal: this.invoice.getLineItemTotal(),
        total: this.totalCharge
    }).subscribe()
}

  ngOnInit(): void {
    let total = this.data.partsAmount;
    this.invoice = new Invoice(this.cookieService.get("session_user"));
    total = total + (this.data.laborHours * 50);
    this.getSelectedServices().forEach(service => {
      total = total + service.value;
      this.invoice.getLineItems().push({
        title: service.name,
        price: service.value
      })

    });
    this.totalCharge = total;
  }

}
