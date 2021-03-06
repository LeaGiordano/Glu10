import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-mapa-editar',
  templateUrl: './mapa-editar.component.html',
  styleUrls: ['./mapa-editar.component.css']
})
export class MapaEditarComponent implements OnInit {

  forma: FormGroup;
  constructor( private fb: FormBuilder,
               private dialogRef: MatDialogRef<MapaEditarComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.forma = fb.group({
        'id' : data.id,
        'nombre': data.nombre,
        'descripcion': data.descripcion,
        'latitud' : data.latitud,
        'longitud': data.longitud,
        'tieneMenuCel' : data.tieneMenuCel,
        'imagen' : data.imagen,
        'calificacion' : data.calificacion 
      });
     }

  ngOnInit() {
  }
  guardarCambios() {
    console.log(this.forma.value);
    this.dialogRef.close(this.forma.value);

  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
