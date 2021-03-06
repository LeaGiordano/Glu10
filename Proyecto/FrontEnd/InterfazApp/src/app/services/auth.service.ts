// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {throwError  } from "rxjs";
import { map, filter, catchError } from 'rxjs/operators';
import * as auth0 from 'auth0-js';
import { Observable, Observer } from 'rxjs';
import { MarcadoresService } from './marcadores.service';
import { error } from '@angular/compiler/src/util';

(window as any).global = window;

@Injectable()
export class AuthService {

  // private observer: Observer<string>;
  // userChange$: Observable<string> = new Observable(obs => this.observer = obs);

  public userProfile: any;
  public esAdmin;

  auth0 = new auth0.WebAuth({
    // auth0 de ALE...
    // clientID: 'Cg8fLad40Y6nxLL5b3E2i3mLtAbQNrIQ',
    // domain: 'gluten.auth0.com',
        // redirectUri: 'https://localhost:4200/mapa',
    // fin Auth0 ALE..
        clientID: 'VaadtM2suHhtPGUI7LB6km7TuzXxyEK7',
    domain: 'auth0prueba.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'https://192.168.1.148:4200/login',
    scope: 'openid profile'
  });

  constructor(  private router: Router,
                private backend: MarcadoresService
             ) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.getProfile();
      } else if (err) {
        this.router.navigate(['/error']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Go back to the home route
    this.router.navigate(['/login']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
    return new Date().getTime() < expiresAt;
  }
  public getProfile(): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        // this.observer.next(profile);
        this.userProfile = profile;
        this.router.navigate(['/mapa']);
        // self.userProfile = profile;
      }
        else {
        this.router.navigate(['/error']);
        console.log(err);
      }
      // cb(err, profile);
    });
  }

  public esAdministrador() : boolean{   
    let i = 0;
    while( this.esAdmin == null && i<=5 ){
      setTimeout( function(){ 
        this.backend.esAdmin(this.userProfile.name).subscribe(
          ( res: any ) => {
              console.log('resultadoSoyAdmin??' , res);
              this.esAdmin = res.resultado;
              return res;
          },
          ( err ) => {
            console.log(error);
            return false;   // retorno false para no darle permisos cuando no deberia
          }
        );
        // Do something after 1 second 
      }  , 4000 );
      i=i+1;      
    }
    console.log("valor admin auth0Service", this.esAdmin );
    return this.esAdmin;
    
  }
}
