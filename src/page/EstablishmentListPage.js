import establishmentListHtml from '../html/establishmentList.html';
import Page from './Page';
import mapViewer from '../map/MapViewer';
import sessionContext from '../session/SessionContext';
import searchTool from '../tool/SearchTool';
const proxy = 'https://geowe.org/proxy/proxy.php?url=';
const ESTABLISHMENT_URL = 'https://geowe.org/gobuy/service/api.php/records/ESTABLECIMIENTOS?';
const counterInfoURL = 'https://geowe.org/gobuy/service/api.php/records/ESTABLECIMIENTOS?include=ID_ESTABLECIMIENTO,CONTADOR_CLIENTES_ACTUALES,CONTADOR_LLEGADAS_PREVISTAS&';
const incrementURL = proxy + 'https://geowe.org/gobuy/service/inc_counter.php?';
const decrementURL = proxy + 'https://geowe.org/gobuy/service/dec_counter.php?';
const TOWNS_URL = 'https://geowe.org/gobuy/service/api.php/records/MUNICIPIOS?';
const CATEGORIES_URL = 'https://geowe.org/gobuy/service/api.php/records/CATEGORIAS?';
const ESTABLISMENT_LINK ='https://geowe.org/gobuy/web/?establecimiento=';

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

    async getEstablismentData(id) {
        const response = await fetch(`${ESTABLISHMENT_URL}filter=ID_ESTABLECIMIENTO,eq,${id}`);
        let json = await response.json();  
        let establecimiento = json.records[0];
        
        this._town = await this.getMunicipio(establecimiento.ID_MUNICIPIO);
        
        this._category = await this.getCategoria(establecimiento.ID_CATEGORIA);
        
        return json;
    }

    async getMunicipio(id){
        let municipio = await fetch(`${TOWNS_URL}filter=ID_MUNICIPIO,eq,${id}`);
        let mun = await municipio.json();
        return {
            text: mun.records[0].NOMBRE,
            value: mun.records[0].ID_MUNICIPIO
        };
    }

    async getCategoria(id){
        let categoria = await fetch(`${CATEGORIES_URL}filter=ID_CATEGORIA,eq,${id}`);
        let cat = await categoria.json();
        console.log(cat);
        return {
            text: cat.records[0].NOMBRE,
            value: cat.records[0].ID_CATEGORIA
        };
    }

    updateCounterData() {
        this.showLoader(true);

        this.getCounterData().
        then((data) => {
            for (let establishment of data.records) {
                let establishmentId = establishment.ID_ESTABLECIMIENTO;

                let walkingCounter = document.getElementById(`walking_${establishmentId}Count`);
                let enterCounter = document.getElementById(`enter_${establishmentId}Count`);

                if (walkingCounter)
                    walkingCounter.innerHTML = establishment.CONTADOR_LLEGADAS_PREVISTAS;

                if (enterCounter)
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
        this._data = data;
        this._content.innerHTML = establishmentListHtml.trim();
        this.toHomeButton();
        searchTool.load(this);
        this._cardOriginalLoad = this.createCardList();
        this.startRefreshInterval(this.updateCounterData.bind(this));
    }

    createCardList(filter) {
        this.showLoader(true);
        const cardList = document.getElementById("card-list");
        cardList.innerHTML = "";

        var row = ` <div class="row">`;
        var columnCount = 0;
        this.stablishments = {};
        this.allStablishments = {};
        var establishmentCard = [];

        for (let establishment of this._data.records) {
            let nombre = establishment.NOMBRE === null ? '' : establishment.NOMBRE;
            let contacto = establishment.CONTACTO === null ? '' : establishment.CONTACTO;
            let direccion = establishment.DIRECCION === null ? '' : establishment.DIRECCION;

            this.allStablishments[establishment.ID_ESTABLECIMIENTO] = establishment;

            if (!filter ||
                (filter && (nombre.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
                    direccion.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
                    contacto.toLowerCase().indexOf(filter.toLowerCase()) !== -1
                ))) {
                row = row + this.getEstablishmentCard(establishment);
                columnCount++;
                establishmentCard.push(establishment);

                if (columnCount === 4) {
                    columnCount = 0;
                    row = row + "</div>";
                    cardList.innerHTML = cardList.innerHTML + row;
                    row = ` <div class="row">`;
                }
            }
        }

        row = row + "</div>";
        cardList.innerHTML = cardList.innerHTML + row;

        this.setTitle(`/ ${this._town.text} / ${this._category.text}`, ` ${establishmentCard.length} resultados `)

        for (var establishment of establishmentCard) {
            var id = establishment.ID_ESTABLECIMIENTO;
            this.stablishments[id] = establishment;

            const obj = { establishment: establishment };
            this.registerButtonEvent(`walking_${id}Btn`, this.onOnTheWayClick.bind(this));
            this.registerButtonEvent(`enter_${id}Btn`, this.onEnterClick.bind(this));
            this.registerButtonEvent(`leave_${id}Btn`, this.onLeaveClick.bind(this));
            this.registerButtonEvent(`map_${id}Btn`, () => { this.onMapClick(obj); });
            this.registerButtonEvent(`share_${id}Btn`, () => { this.onShareClick(obj); });
        }

        if (sessionContext.getOnTheWay() != undefined) {
            this.setButtonStateChange(`walking_${sessionContext.getOnTheWay()}Btn`, true);
        } else if (sessionContext.getEntering() != undefined) {
            this.setButtonStateChange(`enter_${sessionContext.getEntering()}Btn`, true);
        }

        this.showLoader(false);
        return cardList.innerHTML;;
    }

    setTitle(category, resultCount) {
        const title = document.getElementById("title");
        const result = document.getElementById("result");
        title.innerHTML = category;
        result.innerHTML = resultCount;
    }

    registerButtonEvent(nameId, callback) {
        var button = document.getElementById(nameId);

        if (button !== null) {
            var id = button.getAttribute("data-id");
            button.onclick = () => { callback(id); };
        }
    }

    onOnTheWayClick(id) {
        this.showLoader(true);
        if (sessionContext.getOnTheWay() != undefined) {

            if (sessionContext.getOnTheWay() === id) {
                let onTheWayId = sessionContext.getOnTheWay();

                fetch(`${decrementURL}id=${onTheWayId}&counter=CONTADOR_LLEGADAS_PREVISTAS`).
                then((response) => {
                    this.updateCounterData();
                    this.setButtonStateChange(`walking_${id}Btn`, false);
                    sessionContext.clear();
                    alert("¡Nos vemos pronto!")
                    this.showLoader(false);
                }).
                catch((exception) => { alert("Error al decrementar. " + exception.message) });

                return;
            }

            alert("Usted ya se encuentra en camino al establecimiento " + this.allStablishments[sessionContext.getOnTheWay()].NOMBRE);
            this.showLoader(false);
            return;
        }
        if (sessionContext.getEntering() != undefined) {            
            alert("Usted ya se encuentra dentro del establecimiento " + this.allStablishments[sessionContext.getEntering()].NOMBRE);
            this.showLoader(false);
            return;
        }

        fetch(`${incrementURL}id=${id}&counter=CONTADOR_LLEGADAS_PREVISTAS`).
        
        then((response) => {
            sessionContext.setOnTheWay(id);
            this.setButtonStateChange(`walking_${id}Btn`, true);
            alert("Que tenga una buena compra!. Avise cuando llegue.");
            //document.getElementById(`walking_${id}Btn`).style['background-color'] = '#4CAF50';
            this.updateCounterData();
            this.showLoader(false);
        }).
        catch((exception) => { alert("Error al incrementar") });
    }

    onEnterClick(id) {
        this.showLoader(true);
        if (sessionContext.getOnTheWay() != undefined) {
            let onTheWayId = sessionContext.getOnTheWay();

            fetch(`${decrementURL}id=${onTheWayId}&counter=CONTADOR_LLEGADAS_PREVISTAS`).
            then((response) => {
                this.setButtonStateChange(`walking_${id}Btn`, false);
                this.showLoader(false);
            }).
            catch((exception) => { alert("Error al decrementar. " + exception.message) });
        }

        if (sessionContext.getEntering() == undefined) {
            fetch(`${incrementURL}id=${id}&counter=CONTADOR_CLIENTES_ACTUALES`).
            then((response) => {
                sessionContext.setEntering(id);
                this.setButtonStateChange(`enter_${id}Btn`, true);
                alert("Bienvenido al establecimiento!. Avise cuando salga.");
                this.updateCounterData();
                this.showLoader(false);
            }).
            catch((exception) => { alert("Error al incrementar") });
        } else {
            alert("Usted ya se encuentra dentro del establecimiento " + this.allStablishments[sessionContext.getEntering()].NOMBRE);
        }
    }

    onLeaveClick(id) {
        if (sessionContext.getEntering() == undefined) {
            alert("Usted NO ha entrado a ningún establecimiento");
        } else if (sessionContext.getEntering() != id) {
            alert("Usted NO ha entrado a este establecimiento. Ha registrado la entrada en " + this.allStablishments[sessionContext.getEntering()].NOMBRE);
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

    onShareClick(obj){
        var establishment = obj.establishment;
        var input = document.createElement("input");        
        let link = ESTABLISMENT_LINK+establishment.ID_ESTABLECIMIENTO;
        input.value = link;
        
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        alert('El enlace al establecimiento:\n\n'
            +link+'\n\nSe ha copiado al portapapeles'
            +'\n¡Compártelo!');

        document.body.removeChild(input);
    }

    getEstablishmentCard(establishment) {
        let reparto = establishment.REPARTO ? 'Si' : 'No';
        let establishmentId = establishment.ID_ESTABLECIMIENTO;
        let coords = establishment.COORDENADAS;
        let mapButton = coords === null ? '' : `<button id="map_${establishmentId}Btn" class="btn" data-id="${establishmentId}" title="Ver ubicación en el mapa"><i class="fas fa-map-marked-alt"></i></button>`;
        let phonesLink = this.getPhonesLink(establishment.TELEFONO);
        let contacto = establishment.CONTACTO === null ? '' : establishment.CONTACTO;
        let aforo = establishment.AFORO === "0" ? 'N/A' : establishment.AFORO;

        return `<div class="column">
                <div class="card">
                    <label class="title">${establishment.NOMBRE}</label>
                    <p><i class="fas fa-location-arrow"></i> ${establishment.DIRECCION}</p>
                    <p><i class="fa fa-phone"></i> ${phonesLink}</p>
                    <p><i class="far fa-clock"></i> ${establishment.HORARIO}</p> 
                    <p><i class="far fa-user-circle"></i> ${contacto}</p>
                    <p><i class="fas fa-truck"></i> ${reparto}</p>
                    <p><i class="fas fa-users"></i> [aforo] ${aforo}</p>                    
                    <p><i class="fas fa-user-friends"></i> [actuales] <span id="enter_${establishmentId}Count">${establishment.CONTADOR_CLIENTES_ACTUALES}</span></p>
                    <p><i class="fas fa-walking"></i> [en camino] <span id="walking_${establishmentId}Count">${establishment.CONTADOR_LLEGADAS_PREVISTAS}</span></p>
                    <hr>     
                    <button id="walking_${establishmentId}Btn" class="btn" data-id="${establishmentId}" title="Voy en camino"><i class="fas fa-walking"></i></button>                                  
                    <button id="enter_${establishmentId}Btn" class="btn" data-id="${establishmentId}" title="Estoy en el establecimiento"><i class="fas fa-user-plus"></i></button>
                    <button id="leave_${establishmentId}Btn" class="btn" data-id="${establishmentId}" title="Salgo del establecimiento"><i class="fas fa-user-minus"></i></button>                    
                    <button id="share_${establishmentId}Btn" class="btn" data-id="${establishmentId}" title="Compartir enlace del establecimiento"><i class="fas fa-share"></i></button>                    
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
        if (button == null) return;

        button.style['color'] = 'white';

        if (pressed)
            button.style['background-color'] = '#4CAF50';
        else
            button.style['background-color'] = '#d54d7b';
    }

}

export default new EstablishmentListPage();