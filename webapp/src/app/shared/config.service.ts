import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  title = 'Angular 2';  
  dataUrl = 'http://10.1.1.200:5000/rpm'
}