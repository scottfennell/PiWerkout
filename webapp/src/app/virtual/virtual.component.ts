import { Component, OnInit, ViewChild } from '@angular/core';
import { BicycleService } from '../shared/bicycle.service';
import { CustomControls } from './custom';
// import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'vr',
    templateUrl: './virtual.component.html',
    styles: [`
        .center {
            width: 400px;
            height: 400px;
            overflow: hidden;
        }
    `]
})
export class VirtualComponent implements OnInit {
    @ViewChild('scene') scene;
    public data: any;
    constructor(private bicycleService: BicycleService) {}

    ngOnInit() {
        this.bicycleService.getBicycleData().subscribe((data) => {
            this.data = data;
        })
    }

    ngAfterViewInit() {
        console.log(this.scene.nativeElement, CustomControls);
        for(let i = -100; i < 100; i += 10) {
            for(let j = -100; j < 100; j += 10) {
                let newSphere = document.createElement('a-sphere');
                newSphere.setAttribute('position', `${i} 0 ${j}`);
                let r = (i + 116).toString(16);
                let g = (j + 116).toString(16);
                let b = ((i+j)/2 + 116).toString(16);
                newSphere.setAttribute('color', `#${r}${g}${b}`);
                newSphere.setAttribute('radius', '1.25');
                this.scene.nativeElement.appendChild(newSphere);
            }
        }
    }
}
