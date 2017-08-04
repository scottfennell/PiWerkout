import { Component } from '@angular/core';

import { ApiService } from './shared';

import '../style/app.scss';

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  url = 'https://github.com/preboot/angular2-webpack';
  title: string;
  velocity: string = '';
  miles: string = '';

  constructor(private api: ApiService) {
    this.title = this.api.title;
  }
  
  ngOnInit() {
    console.log('Hello Home');
    
  }

  calcDistance(lastData) {
    if (lastData && lastData.rot_count) {
      var feet =  ((26*3.1415)/12) * lastData.rot_count;
      this.miles = Math.round(feet/52.8) * 10 + " miles";
    }
      
    if (lastData.velocity) {
      var mph = 2.23694 * lastData.velocity;
      this.velocity = lastData.velocity + ' m/s; ' + mph + ' mph';
    }
  }

  calcSpeed() {

  }
}
