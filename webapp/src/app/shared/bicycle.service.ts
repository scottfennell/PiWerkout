import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Http, Response } from '@angular/http';
 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/scan';

@Injectable()
export class BicycleService {
    title = 'Angular 2';

    private connection: Observable<ServerResponse>;
    private lastDataTime: number;
    
    constructor(public http: Http, public config:ConfigService) {
        this.lastDataTime = 0;
    }
  
    private connect(): Observable<ServerResponse> {
        if (!this.connection) {
            this.connection = Observable.interval(1000)
                .concatMap(() => {
                    return this.http.get(`${this.config.dataUrl}/${this.lastDataTime}`);
                })
                .map((result) => {
                    let data = this.extractData(result);
                    if (data.rpm_data.length === 0) {
                        throw 'no change';
                    } else {
                        return data;
                    }
                })
                .retryWhen(errors => {
                    console.log("what", errors);

                    return errors.scan((errorCount, err) => {
                        if (err !== 'no change') {
                            // A real error occurred. Don't retry it
                            throw err;
                        } else {
                            return errorCount + 1;
                        }
                    }, 0)
                    .concatMap(errorCount => Observable.timer(errorCount * 1000))
                }).share();
        } 
        return this.connection;
    }

    public getBicycleData(): Observable<BicycleData[]> {
        return this.connect().map((b) => {
          return b.rpm_data;
        });
    }

    public getCurrentRpm() {
        this.connect().map((b) => {
            return b.rpm_data[b.rpm_data.length - 1].rpm;
        });
    }
    
    private extractData(res: Response) {
        let data = res.json();
        if (data.rpm_data && data.rpm_data.length > 0) {
          let last = data.rpm_data[data.rpm_data.length - 1];
          this.lastDataTime  = last.time;
        }
        return res.json();
    }
}

class ServerResponse {
  rpm_data: BicycleData[]
}

export class BicycleData {
  time: number;
  rpm: number;
  mps: number;
  series: number;
  offset: number;
}