import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  title = 'Angular 2';  
  // dataUrl = 'http://192.168.86.200:5000/rpm';
  dataUrl = 'http://localhost:5000/rpm';
}