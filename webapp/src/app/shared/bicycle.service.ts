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
    private rpmSum: number = 0;
    private stats: BicycleDataStats;
    
    constructor(public http: Http, public config:ConfigService) {
        this.lastDataTime = 0;
        this.stats = new BicycleDataStats();
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

    public getStats(): BicycleDataStats {
        return this.stats;
    }
    
    private extractData(res: Response) {
        let data = res.json();
        if (data.rpm_data && data.rpm_data.length > 0) {
            
            if (!this.stats.startTime) {
                this.stats.startTime = data.time;
            }

            data.rpm_data.forEach(element => {
                this.rpmSum += element.rpm
            });

            let last = data.rpm_data[data.rpm_data.length - 1];
            last.rot_count = data.rot_count;
            last.velocity = data.velocity;
            this.lastDataTime  = last.time;
            last.averageRpm = this.rpmSum / data.rot_count;

            //Calculate stats


            data.rpm_data.forEach(element => {
                this.rpmSum += element.rpm
                this.stats.n++;
                this.stats.averageRpm = this.stats.averageRpm + ((element.rpm - this.stats.averageRpm) / this.stats.n);
                this.stats.rotationCount = data.rot_count;
                this.stats.averageSpeed = this.stats.averageSpeed + ((data.velocity - this.stats.averageSpeed) / this.stats.n);
                this.stats.distance = Math.round((this.stats.averageSpeed * Math.round((this.stats.startTime - element.time)/1000)) * 0.000621371);
            });
        }
        return data;
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
  averageRpm: number;
}

export class BicycleDataStats {
    averageRpm: number = 0;
    averageSpeed: number = 0;
    rotationCount: number = 0;
    calories: number = 0;
    startTime: number = 0; //millis or seconds epoch
    distance: number = 0; //miles
    n: number = 0;
} 