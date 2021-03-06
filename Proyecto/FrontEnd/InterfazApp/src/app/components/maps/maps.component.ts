import {MatSnackBar} from '@angular/material';
import {MatDialog, MatDialogRef} from '@angular/material';
import { MapaEditarComponent } from './mapa-editar.component';
import { Component, OnInit } from '@angular/core';
import { Marcador } from '../../classes/marcador.class';

// Servicio Autenticacion
import { AuthService } from '../../services/auth.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';
// importo al panel de restaurantes cerca para indicarle que se actualice LUEGO de obener los datos.
import { RestaurantesComponent } from '../restaurantes/restaurantes.component';
// Para Ruteo
import { Router } from '@angular/router';

// servicio importado
import { MarcadoresService } from '../../services/marcadores.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit {

  // para pruebas
  lat: number = -38.71536909404415;
  lng: number = -62.26685779187005;

  // Para star-rating
  public starCount = 5;
  public starColor = 'accent';

  // atributos de la clase
  marcadores: Marcador[] = [];
  error = 'todo bien';
  esAdministrador = false;

  // Para verificar si es admin o no
  perfil: any;

  constructor(  private auth0: AuthService,
                private snackBar: MatSnackBar,
                private dialog: MatDialog,
                private marcadorService: MarcadoresService,
                private panelRestaurantesCerca: RestaurantesComponent,
                private toolbar: ToolbarComponent,
                private router: Router) {

  // obtengo los marcadores del server
  this.obtenerMarcadoresServer();

  // Geolocacion del usuario
  if ('geolocation' in navigator) {
    /* la geolocalización está disponible */
    this.findMe();
  } else {
    /* la geolocalización NO está disponible */
    console.log('Error al obtener Ubicacion');
  }

  // Mediante la funcion cargo los marcadores que anteriormente habia seleccionado en mi navegador
  if ( localStorage.getItem('marcadores')) {
    this.marcadores = JSON.parse(localStorage.getItem('marcadores'));
  }

  // setea el perfil según el servicio de auth0
  this.perfil = this.auth0.userProfile;
  this.toolbar.actualizarUsuario();
  if( this.perfil.name == "admin@admin.com" )
    this.esAdministrador = true;

  }

  ngOnInit() {
  }

  setearLatLng(position) {
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
  }

  // Codigo para pedir la ubicacion del usuario al navegador y mostrar su ubicacion en el mapa
  findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setearLatLng(position);
        // this.marcadores.push(new Marcador( position.coords.latitude, position.coords.longitude));
            });
    } else {
      alert( 'Geolocation is not supported by this browser.' );
    }
  }


  agregarMarcador( evento ) {
    if (this.esAdministrador ) {
      const coords: { lat: number, lng: number } = evento.coords;

      console.log( 'lat:' + coords.lat + ', long:'  + coords.lng);
      // creo el nuevo marcador con la latitud y longitud donde se hizo click..
      const nuevoMarcador = new Marcador(coords.lat, coords.lng);
      // asigno el mayorID+1 al nuevo marcador (para evitar conflictos cn la BD).
      nuevoMarcador.id = Number(this.marcadorService.obtenerMayorIDR()) + 1;
      // seteo el resto de los campos del nuevo Marcador..
      nuevoMarcador.nombre = 'Nuevo Marcador';
      nuevoMarcador.descripcion = 'ingrese dirección..';
      nuevoMarcador.tieneMenuCel = 'true';
      nuevoMarcador.cp = 8000;
      nuevoMarcador.calificacion = 3;
      nuevoMarcador.imagen = '../../assets/image-not-available.png';

      this.marcadores.push(nuevoMarcador);

      // lo agregamos a la base de datos
      this.almacenarMarcadorServer(nuevoMarcador);

      this.snackBar.open('Marcador agregado', 'Cerrar', { duration: 1000 });
      this.guardaMarcadores();
      this.panelRestaurantesCerca.actualizarRestaurantesCerca();
  }




  }

  guardaMarcadores() {
    localStorage.setItem('marcadores', JSON.stringify(this.marcadores));
  }

  obtenerMarcadoresServer(): void {
    this.marcadorService.getAll().subscribe(
      ( res: Marcador[] ) => {
        this.marcadores = res;
        this.marcadorService.setUbicacionActual(this.lat, this.lng);
        this.panelRestaurantesCerca.actualizarRestaurantesCerca();
        localStorage.setItem('marcadores', JSON.stringify(res));
        // this.marcadorService.setMarcadoresCerca(this.lat, this.lng);
      },
      ( err ) => {
        this.error = err;   // VER DSPS: nunca recibe el mensaje de error , por loque nunca cambia.
      }
    );
  }

  almacenarMarcadorServer(nuevoMarcador: Marcador): void {
    this.marcadorService.addMarcador(nuevoMarcador).subscribe(
      ( res: string ) => {
          // muestra la salida generada por el backend
          console.log(res);
      },
      ( err ) => {
        this.error = err;   // VER DSPS: nunca recibe el mensaje de error , por loque nunca cambia.
      }
    );
  }


  markerIconUbicacionActual() {
    return ('../../../assets/my_location.svg');
  }

  markerIconRestaurante(calificacion: number) {
    if (calificacion >= 4) {
      return ('../../../assets/verde.png'); }
    else { if (calificacion >= 2) {
      return ('../../../assets/amarillo.png'); }
    else    {
      return ('../../../assets/rojo.png'); }
    }
  }

   // para ruteos
   moverseACalificar(id: number) {
    this.router.navigate(['/restaurante', id, 'calificar']);
  }

  moverseAVerMas(id: number) {
    this.router.navigate(['/restaurante', id, 'info']);
  }


  borrarMarcador( id: number ) {
      let encontre = false;
      for(let i=0; i<this.marcadores.length && !encontre; i++)
        if( this.marcadores[i].id === id ){
          encontre=true;
          this.borrarMarcadorServer(id);
          this.marcadores.splice(i, 1);
        }
      this.guardaMarcadores();
      this.panelRestaurantesCerca.actualizarRestaurantesCerca();
      this.snackBar.open('Marcador borrado', 'Cerrar', { duration: 1000 });
  }

  public borrarMarcadorServer(id: number){
    this.marcadorService.removeMarcador(id).subscribe(
      ( res: string ) => {
          //muestra la salida gnerada por el backend
          console.log(res);
      },
      ( err ) => {
        this.error = err;   // VER DSPS: nunca recibe el mensaje de error , por loque nunca cambia. 
      }
    );
  }

  editarMarcador(marcador: Marcador ) {

    //copia de los valores viejos del marcador
    let valoresViejos = new Marcador(0,0);
    valoresViejos.id = marcador.id;
    valoresViejos.cp = marcador.cp;
    valoresViejos.nombre = marcador.nombre;
    valoresViejos.descripcion = marcador.descripcion;
    valoresViejos.calificacion = marcador.calificacion;
    valoresViejos.imagen = marcador.imagen;
    
    const dialogRef = this.dialog.open(MapaEditarComponent, {
      width: '250px',
      data: { 
              id: marcador.id, 
              cp: marcador.cp,
              nombre: marcador.nombre ,
              descripcion: marcador.descripcion,
              imagen : marcador.imagen,
              tieneMenuCel : marcador.tieneMenuCel,
              calificacion : marcador.calificacion 
            }
    });
    dialogRef.afterClosed().subscribe(result => {
      if ( !result ) {
        return;
      }
      //chequeo que campos fueron modifados
      let valoresModificados = {'id': marcador.id};

      if(valoresViejos.cp !== result.cp ){
        marcador.cp = result.cp;
        Object.assign(valoresModificados,{'cp': result.cp}); 
      }
      if(valoresViejos.nombre !== result.nombre ){
        marcador.nombre = result.nombre;
        Object.assign(valoresModificados,{'nombre': result.nombre}); 
      }
      if(valoresViejos.descripcion !== result.descripcion ){
        marcador.descripcion = result.descripcion;
        Object.assign(valoresModificados,{'descripcion': result.descripcion}); 
      }
      if(valoresViejos.calificacion !== result.calificacion ){
        marcador.calificacion = result.calificacion;
        Object.assign(valoresModificados,{'calificacion': result.calificacion}); 
      }
      if(valoresViejos.imagen !== result.imagen ){
        marcador.imagen = result.imagen;
        Object.assign(valoresModificados,{'imagen': result.imagen}); 
      }
      this.actualizarMarcadorServer(valoresModificados);
      this.guardaMarcadores();
      this.snackBar.open('Marcador actualizado', 'Cerrar', { duration: 1000 });
    });
  }

  public actualizarMarcadorServer(valoresModificados){
    this.marcadorService.updateMarcador(valoresModificados).subscribe(
      ( res: string ) => {
          //muestra la salida generada por el backend
          console.log(res);
      },
      ( err ) => {
        this.error = err;   // VER DSPS: nunca recibe el mensaje de error , por loque nunca cambia. 
      }
    );
  }

}
