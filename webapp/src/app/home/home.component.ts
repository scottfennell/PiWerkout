import { Component, OnInit } from '@angular/core';
import { BicycleService, BicycleDataStats } from '../shared/bicycle.service';

@Component({
  selector: 'my-home',
  host: {class: 'router-layout'},
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  velocity: string = '';
  miles: string = '';
  mph: number = 0;
  mps: number = 0;
  distance: number = 0;
  averageSpeed: number = 0;

  constructor(private bicycleService: BicycleService) {}

  ngOnInit() {
    console.log('Hello Home');
    this.bicycleService.getBicycleData().subscribe(data => {
      this.calcStats(data);
      
    })
    
  }

  calcStats(lastData) {
    if (lastData.velocity) {
      let stats: BicycleDataStats = this.bicycleService.getStats();
      
      this.mph = Math.round(2.23694 * lastData.velocity);
      this.mps = Math.round(lastData.velocity);
      this.distance = stats.distance;
      this.averageSpeed = stats.averageSpeed;
    }
  }
}
