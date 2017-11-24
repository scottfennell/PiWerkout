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

    private connection: Observable<BicycleDataStats>;
    private lastDataTime: number;
    private rpmSum: number = 0;
    private stats: BicycleDataStats;
    
    constructor(public http: Http, public config:ConfigService) {
        this.lastDataTime = 0;
        this.stats = new BicycleDataStats();
    }
  
    private connect(): Observable<BicycleDataStats> {
        if (!this.connection) {
            this.connection = Observable.interval(1000)
                .concatMap(() => {
                    return this.http.get(`${this.config.dataUrl}/${this.lastDataTime}`);
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
                })
                .map((result) => {
                    return this.extractData(result);
                })
                .share();
        } 
        return this.connection;
    }

    public getBicycleData(): Observable<BicycleData[]> {
        return this.connect().map((b) => {
          return b.rpm_data;
        });
    }

    public getBicycleStats(): Observable<BicycleDataStats> {
        return this.connect();
    }

    public getCurrentRpm() {
        this.connect().map((b) => {
            return b.rpm_data[b.rpm_data.length - 1].rpm;
        });
    }

    public getStats(): BicycleDataStats {
        return this.stats;
    }
    
    private extractData(res: Response): BicycleDataStats {
        let data = res.json();
        if (data.rpm_data) {
            let rpmData = data.rpm_data.filter((n) => n.time > this.lastDataTime)
            if (rpmData.length > 0) {
                
                if (!this.stats.startTime) {
                    this.stats.startTime = rpmData[0].time;
                }
                
                let last = rpmData[rpmData.length - 1];
                last.rot_count = data.rot_count || 1;
                last.velocity = data.velocity;
                this.lastDataTime  = last.time;
                last.averageRpm = this.rpmSum / data.rot_count;
                

                //Calculate stats
                rpmData.forEach(element => {
                    
                    this.rpmSum += element.rpm
                    this.stats.n++;
                    this.stats.averageRpm = last.averageRpm;
                    this.stats.rotationCount = data.rot_count;
                    this.stats.averageSpeed = this.stats.averageSpeed + ((data.velocity - this.stats.averageSpeed) / this.stats.n);
                    this.stats.distance = (this.stats.averageSpeed * (element.time - this.stats.startTime)) * 0.000621371;
                });
                
            }
            this.stats.rpm_data = rpmData;
            // data.rpm_data = rpmData;
        }

        return this.stats;
    }
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
    rpm_data: BicycleData[];
} 