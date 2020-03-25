import establishmentListHtml from '../html/establishmentList.html';
import Page from './Page';
import mapViewer from '../map/MapViewer';
import sessionContext from '../session/SessionContext';
const proxy = 'https://geowe.org/proxy/proxy.php?url=';
const ESTABLISHMENT_URL = 'https://geowe.org/gobuy/service/api.php/records/ESTABLECIMIENTOS?';
const counterInfoURL = 'https://geowe.org/gobuy/service/api.php/records/ESTABLECIMIENTOS?include=ID_ESTABLECIMIENTO,CONTADOR_CLIENTES_ACTUALES,CONTADOR_LLEGADAS_PREVISTAS&';
const incrementURL = 'https://geowe.org/gobuy/service/inc_counter.php?';
const decrementURL = 'https://geowe.org/gobuy/service/dec_counter.php?';
// const ESTABLISHMENT_URL = 'http://localhost/php-crud/api.php/records/establecimientos?';
// const incrementURL = 'http://localhost/php-crud/inc_counter.php?';
// const decrementURL = 'http://localhost/php-crud/dec_counter.php?';

const HOME_BUTTON = ` <div  id="loader" style="display:none">
<i  class="fas fa-cog fa-spin"></i>
</div><input id="cancelBtn" type="submit" value="Volver">`;

class EstablishmentListPage extends Page {
    constructor() {
        super()
    }

    async getData(town, category) {
        this._town = town;
        this._category = category;
        const response = await fetch(`${ESTABLISHMENT_URL}filter=ID_MUNICIPIO,eq,${town.value}&filter=ID_CATEGORIA,eq,${category.value}`);
        return await response.json();
    }

    async getCounterData() {
        const response = await fetch(`${counterInfoURL}filter=ID_MUNICIPIO,eq,${this._town.value}&filter=ID_CATEGORIA,eq,${this._category.value}`);
        return await response.json();
    }

    updateCounterData() {     
        console.log("Actualizando contadores...");
        this.showLoader(true);

        this.getCounterData().
        then((data) => {            
            for (let establishment of data.records) {
                let establishmentId = establishment.ID_ESTABLECIMIENTO;
    
                let walkingCounter = document.getElementById(`walking_${establishmentId}Count`);
                let enterCounter = document.getElementById(`enter_${establishmentId}Count`);
    
                walkingCounter.innerHTML = establishment.CONTADOR_LLEGADAS_PREVISTAS;
                enterCounter.innerHTML = establishment.CONTADOR_CLIENTES_ACTUALES;
            }
        }).
        catch((exception) => {
            console.log(exception);
        }).
        finally(() => {
            this.showLoader(false);
        });        
    }

    load(data) {
        this.stablishments = {};

        this._content.innerHTML = establishmentListHtml.trim();
        const title = document.getElementById("title");
        title.innerHTML = `${this._town.text}/${this._category.text} ${data.records.length} establecimientos`;
        const cardList = document.getElementById("card-list");

        var row = ` <div class="row">`;
        var cont = 0;
        for (let establishment of data.records) {

            row = row + this.getEstablishmentCard(establishment);
            cont++;
            if (cont === 4) {
                row = row + "</div>";
                cardList.innerHTML = cardList.innerHTML + row;
                cont = 0;
                row = ` <div class="row">`;
            }
        }
        row = row + "</div>";
        cardList.innerHTML = cardList.innerHTML + row;

        cardList.innerHTML = cardList.innerHTML + HOME_BUTTON;
        this.toHomeButton();
        
        for (var establishment of data.records) {
            var id = establishment.ID_ESTABLECIMIENTO;
            this.stablishments[id] = establishment;

            const obj = { establishment: establishment };
            this.registerButtonEvent(`walking_${id}Btn`, this.onOnTheWayClick.bind(this));
            this.registerButtonEvent(`enter_${id}Btn`, this.onEnterClick.bind(this));
            this.registerButtonEvent(`leave_${id}Btn`, this.onLeaveClick.bind(this));
            this.registerButtonEvent(`map_${id}Btn`, () => { this.onMapClick(obj); });
        }

        setInterval(this.updateCounterData.bind(this), 10000);
    }

    registerButtonEvent(nameId, callback) {
        var button = document.getElementById(nameId);
        
        if (button !== null) {
            var id = button.getAttribute("data-id");
            button.onclick = () => { callback(id); };
        }
    }

    onOnTheWayClick(id) {
        if (sessionContext.getOnTheWay() != undefined) {
            alert("Usted ya se encuentra en camino al establecimiento " + this.stablishments[sessionContext.getOnTheWay()].NOMBRE);
            return;
        }
        if (sessionContext.getEntering() != undefined) {
            alert("Usted ya se encuentra dentro del establecimiento " + this.stablishments[sessionContext.getEntering()].NOMBRE);
            return;
        }

        fetch(`${incrementURL}id=${id}&counter=CONTADOR_LLEGADAS_PREVISTAS`).
        then((response) => {
            sessionContext.setOnTheWay(id);
            this.setButtonStateChange(`walking_${id}Btn`, true);
            alert("Que tenga una buena compra!. Avise cuando llegue.");
            //document.getElementById(`walking_${id}Btn`).style['background-color'] = '#4CAF50';
            this.updateCounterData();
        }).
        catch((exception) => { alert("Error al incrementar") });
    }

    onEnterClick(id) {
        if (sessionContext.getOnTheWay() != undefined) {
            let onTheWayId = sessionContext.getOnTheWay();

            fetch(`${decrementURL}id=${onTheWayId}&counter=CONTADOR_LLEGADAS_PREVISTAS`).
            then((response) => {
                this.setButtonStateChange(`walking_${id}Btn`, false);
            }).
            catch((exception) => { alert("Error al decrementar") });
        }

        if (sessionContext.getEntering() == undefined) {
            fetch(`${incrementURL}id=${id}&counter=CONTADOR_CLIENTES_ACTUALES`).
            then((response) => {
                sessionContext.setEntering(id);
                this.setButtonStateChange(`enter_${id}Btn`, true);
                alert("Bienvenido al establecimiento!. Avise cuando salga.");
                this.updateCounterData();
            }).
            catch((exception) => { alert("Error al incrementar") });
        } else {
            alert("Usted ya se encuentra dentro del establecimiento " + this.stablishments[sessionContext.getEntering()].NOMBRE);
        }
    }

    onLeaveClick(id) {        
        if (sessionContext.getEntering() == undefined) {
            alert("Usted NO ha entrado a ningún establecimiento");
        } else if (sessionContext.getEntering() != id) {
            alert("Usted NO ha entrado a este establecimiento. Ha registrado la entrada en " + this.stablishments[sessionContext.getEntering()].NOMBRE);
        } else {
            fetch(`${decrementURL}id=${id}&counter=CONTADOR_CLIENTES_ACTUALES`).
            then((response) => {
                sessionContext.clear();
                this.setButtonStateChange(`enter_${id}Btn`, false);
                alert("Hasta la próxima!");
                this.updateCounterData();
            }).
            catch((exception) => { alert("Error al decrementar") });
        }
    }

    onMapClick(obj) {
        var establishment = obj.establishment;
        var infoMap = document.getElementById("infoMap");
        infoMap.innerHTML = `${this._town.text} / ${this._category.text} / ${establishment.NOMBRE}`;

        mapViewer.loadMap(establishment);
    }

    getEstablishmentCard(establishment) {
        let reparto = establishment.REPARTO ? 'Si' : 'No';
        let establishmentId = establishment.ID_ESTABLECIMIENTO;
        let coords = establishment.COORDENADAS;
        //let mapButton = coords === null ? '' : `<input id="map_${establishmentId}Btn" type="submit" value="Mapa" style="padding:10px 5px;width:50px; ">`;
        let mapButton = coords === null ? '' : `<button id="map_${establishmentId}Btn" class="btn" data-id="${establishmentId}" ><i class="fas fa-map-marked-alt"></i></button>`;
        let phonesLink = this.getPhonesLink(establishment.TELEFONO);
        let contacto = establishment.CONTACTO === null ? '' : establishment.CONTACTO;


        // <input id="leave_${establishmentId}Btn" type="submit" value="Salgo" data-id="${establishmentId}" style="padding:10px 5px;width:50px; ">
        return `<div class="column">
                <div class="card">
                    <label class="title">${establishment.NOMBRE}</label>
                    <p><i class="fas fa-location-arrow"></i> ${establishment.DIRECCION}</p>
                    <p><i class="fa fa-phone"></i> ${phonesLink}</p>
                    <p><i class="far fa-clock"></i> ${establishment.HORARIO}</p> 
                    <p><i class="far fa-user-circle"></i> ${contacto}</p>
                    <p><i class="fas fa-truck"></i> ${reparto}</p>
                    <p><i class="fas fa-users"></i> [actuales] <span id="walking_${establishmentId}Count">${establishment.CONTADOR_CLIENTES_ACTUALES}</span></p>
                    <p><i class="fas fa-walking"></i> [en camino] <span id="enter_${establishmentId}Count">${establishment.CONTADOR_LLEGADAS_PREVISTAS}</span></p>
                    <hr>     
                    <button id="walking_${establishmentId}Btn" class="btn" data-id="${establishmentId}" ><i class="fas fa-walking"></i></button>                                  
                    <button id="enter_${establishmentId}Btn" class="btn" data-id="${establishmentId}" ><i class="fas fa-user-plus"></i></button>
                    <button id="leave_${establishmentId}Btn" class="btn" data-id="${establishmentId}" ><i class="fas fa-user-minus"></i></button>                    
                    ${mapButton}
                </div>
            </div>`;
    }

    getPhonesLink(phones) {
        let phonesLink = '';
        if (phones !== null) {
            let phonesSplited = phones.split("-");
            for (let phone of phonesSplited) {
                let link = `<a href="tel:${phone}">${phone}</a>`;
                phonesLink = phonesLink.concat('|' + link + '|');
            }
        }
        return phonesLink;
    }

    setButtonStateChange(buttonName, pressed) {
        const button = document.getElementById(buttonName);
        button.style['color'] = 'white';

        if (pressed)
            button.style['background-color'] = '#4CAF50';
        else
            button.style['background-color'] = '#d54d7b';
    }

}

export default new EstablishmentListPage();