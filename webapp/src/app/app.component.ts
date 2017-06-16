import { Component } from '@angular/core';

import { ApiService } from './shared';
import { BicycleService } from './shared/bicycle.service';

import '../style/app.scss';

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  url = 'https://github.com/preboot/angular2-webpack';
  title: string;

  constructor(private api: ApiService, private bicycleService: BicycleService) {
    this.title = this.api.title;
  }
  
  ngOnInit() {
    console.log('Hello Home');
    this.bicycleService.getBicycleData().subscribe(data => {
      console.log("Recieved Data!", data);
    })
    
  }
}
