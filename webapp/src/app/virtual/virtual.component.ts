import { Component, OnInit } from '@angular/core';
import { BicycleService } from '../shared/bicycle.service';
// import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'vr',
    templateUrl: './virtual.component.html',
    styles: [`
        .center {
            width: 400px;
            height: 400px;
            overflow: hidden;
        }
    `]
})
export class VirtualComponent implements OnInit {
    public data: any;
    constructor(private bicycleService: BicycleService) {}

    ngOnInit() {
        this.bicycleService.getBicycleData().subscribe((data) => {
            this.data = data;
        })
        console.log('do vr stuff');
    }

}
