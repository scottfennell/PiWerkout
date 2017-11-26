import { Component, OnInit } from '@angular/core';
import { BicycleService, BicycleDataStats } from '../shared/bicycle.service';
// import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'my-home',
  host: {class: 'srouter-layout'},
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public velocity: string = '';
  public miles: string = '';
  public mph: number = 0;
  public mps: number = 0;
  public distance: number = 44;
  public averageSpeed: number = 44;

  constructor(private bicycleService: BicycleService) {}

  ngOnInit() {
    this.bicycleService.getBicycleStats().subscribe((stats) => this.calcStats(stats));
  }

  calcStats(stats: BicycleDataStats) {
    // this.mph = Math.round(2.23694 * lastData.velocity);
    // this.mps = Math.round(lastData.velocity);
    this.distance = stats.distance;
    this.averageSpeed = stats.averageSpeed;
  }
}
