import { Component, OnInit } from '@angular/core';
import { BicycleService } from '../shared/bicycle.service';

@Component({
  selector: 'my-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  velocity: string = '';
  miles: string = '';
  mph: number = 0;
  mps: number = 0;

  constructor(private bicycleService: BicycleService) {}

  ngOnInit() {
    console.log('Hello Home');
    this.bicycleService.getBicycleData().subscribe(data => {
      this.calcDistance(data[data.length-1])
    })
    
  }

  calcDistance(lastData) {
    if (lastData.velocity) {
      this.mph = Math.round(2.23694 * lastData.velocity);
      this.mps = Math.round(lastData.velocity);
    }
  }
}
