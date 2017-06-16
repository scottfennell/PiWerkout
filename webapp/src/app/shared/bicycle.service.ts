import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Http, Response } from '@angular/http';
 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class BicycleService {
  title = 'Angular 2';
  
  constructor(public http: Http, public config:ConfigService) {
    
  }
  
  getBicycleData(): Observable<BicycleData[]> {
    return this.http.get(this.config.dataUrl + '/0')
      .map(this.extractData)
      .catch(this.handleError);
  }
  
  private extractData(res: Response) {
    return res.json().data;
  }
  
  private handleError (error: Response | any) {
    console.error("Yay error", error);
    return [];
  }

}

export class BicycleData {
  time: number;
  rpm: number;
  mps: number;
  series: number;
}