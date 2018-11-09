import { Component, OnInit } from '@angular/core';

//servicios
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor( private Auth0: AuthService ) { }

  ngOnInit() {
  }

  login(){
    this.Auth0.login();
  }
}
