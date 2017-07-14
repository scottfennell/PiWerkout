import { Component, ElementRef, ViewChild, Input } from '@angular/core';

import { BicycleService } from '../shared/bicycle.service';
import { LineChart } from './linechart';
import { GaugeChart } from './gaugechart';


@Component({
    selector: 'chart', // <my-app></my-app>
    template: '<div class="container" #chartContainer></div>',
    styles: [`
        .container {
            width: 100%;
            height: 100%;
        }
        svg {
            width: 100%;
            height: 100%;
        }
    `],
})
export class ChartComponent {
    @Input('type') chartType: string;
    @ViewChild('chartContainer') container: ElementRef;

    private chart: any;

    constructor(private bicycleService: BicycleService) {}

    ngOnInit() {
    }

    ngAfterViewInit() {

        if (this.chartType === 'gauge') {
            this.chart = new GaugeChart(this.container.nativeElement);
        } else {
            this.chart = new LineChart(this.container.nativeElement);
        }   
        
        this.bicycleService.getBicycleData().subscribe(data => {
            this.chart.update(data);
        })
    }

}
