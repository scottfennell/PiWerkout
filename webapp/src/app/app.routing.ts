import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { VirtualComponent } from './virtual/virtual.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'vr', component: VirtualComponent }
];

export const routing = RouterModule.forRoot(routes);
