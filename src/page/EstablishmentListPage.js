import establishmentListHtml from '../html/establishmentList.html';
import Page from './Page';
const URL = 'https://geowe.org/goBuy/service/api.php/records/ESTABLECIMIENTOS';
const HOME_BUTTON = `<input id="cancelBtn" type="submit" value="Volver">`;

class EstablishmentListPage extends Page {
    constructor() {
        super()
    }

    async load() {

        const response = await fetch(URL);
        const data = await response.json();

        this._content.innerHTML = establishmentListHtml.trim();
        const content = document.getElementById("content");

        var row = ` <div class="row">`;
        var cont = 0;
        for (var establishment of data.records) {
            row = row + this.getEstablishmentCard(establishment);
            cont++;
            if (cont === 4) {
                row = row + "</div>";
                content.innerHTML = content.innerHTML + row;
                cont = 0;
                row = ` <div class="row">`;
            }
        }

        content.innerHTML = content.innerHTML + HOME_BUTTON;
        this.toHomeButton();

        for (var establishment of data.records) {
            var id = establishment.ID_ESTABLECIMIENTO;

            this.registerButtonEvent(`enter_${id}Btn`, this.onEnterClick);
            this.registerButtonEvent(`leave_${id}Btn`, this.onLeaveClick);
            this.registerButtonEvent(`map_${id}Btn`, this.onMapClick);
        }
    }

    registerButtonEvent(nameId, callback) {
        var button = document.getElementById(nameId);
        if (button !== null) {
            button.onclick = callback;
        }
    }

    onEnterClick() {
        alert("Entramos en el establecimiento con id: " + this.getAttribute("data-id"));
    }

    onLeaveClick() {
        alert("Salimos del establecimiento con id: " + this.getAttribute("data-id"));
    }

    onMapClick() {
        alert("Map del establecimiento con id: " + this.getAttribute("data-id") + " coordenadas " + this.getAttribute("data-coordinates"));
    }

    getEstablishmentCard(establishment) {
        let reparto = establishment.REPARTO ? 'Si' : 'No';
        let establishmentId = establishment.ID_ESTABLECIMIENTO;
        let coords = establishment.COORDENADAS;
        let mapButton = coords === null ? '' : `<input id="map_${establishmentId}Btn" type="submit" value="Mapa" data-id="${establishmentId}" data-coordinates="${coords}" style="padding:10px 5px;width:50px; ">`;
        return `<div class="column">
                <div class="card">
                    <label class="title">${establishment.NOMBRE}</label>
                    <h4>${establishment.DIRECCION}</h4>
                    <p>Tfno.: ${establishment.TELEFONO}</p>
                    <p>Horario: ${establishment.HORARIO}</p> 
                    <p>Contacto: ${establishment.CONTACTO}</p>
                    <p>Reparto: ${reparto}</p>
                    <p>Clientes actuales: ${establishment.CONTADOR_CLIENTES_ACTUALES}</p>
                    <p>llegadas previstas: ${establishment.CONTADOR_LLEGADAS_PREVISTAS}</p>
                    <hr>                    
                    <input id="enter_${establishmentId}Btn" type="submit" value="Entro" data-id="${establishmentId}" style="padding:10px 5px;width:50px;">
                    <input id="leave_${establishmentId}Btn" type="submit" value="Salgo" data-id="${establishmentId}" style="padding:10px 5px;width:50px; ">
                    ${mapButton}
                </div>
            </div>`;
    }
}

export default new EstablishmentListPage();