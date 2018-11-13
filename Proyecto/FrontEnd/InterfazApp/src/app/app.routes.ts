import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { RestaurantesComponent } from './components/restaurantes/restaurantes.component';
import { CalificacionComponent } from './components/calificacion/calificacion.component';
import { LoginComponent } from './components/login/login.component';
import { InfoRestauranteComponent } from "./components/info-restaurante/info-restaurante.component";

// import { AuthGuardService } from './services/auth-guard.service';

const APP_ROUTES: Routes = [
     { path: 'login', component: LoginComponent },
     { path: 'mapa', component:  RestaurantesComponent },
     { path: 'about', component:  AboutComponent },
     { path: 'restaurante/:id/info', component:  InfoRestauranteComponent },
     { path: 'restaurante/:id/calificar', component:  CalificacionComponent },
     //{ path: 'about', component: ProtegidaComponent, canActivate: [ AuthGuardService ] },
     { path: '**', pathMatch: 'full', redirectTo: 'mapa' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);