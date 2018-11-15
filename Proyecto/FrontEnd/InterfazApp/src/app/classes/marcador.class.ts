/*        CORREGIR LOS ATRIBUTOS PARA QUE COINCIDAN CON LO DE ALE



export class Marcador {

    public lat: number;
    public lng: number;

    public titulo = ' sin Titulo';
    public desc = ' sin Descripcion';
    public calificacion = 3;

    constructor( lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;

    }

}

*/
export class Marcador {
    public cp = 8000;
    public id: number;
    public latitud: number;
    public longitud: number;
    
    public nombre = "Sin Titulo";
    public descripcion = "Sin Descripción";
    public calificacion = 1;
    public tieneMenuCel = "true";
    public imagen = "../../assets/image-not-available.png";
   
    constructor (lat: number, lng: number) {
        this.latitud = lat;
        this.longitud = lng;
    }
}

