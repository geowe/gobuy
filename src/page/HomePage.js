import homeHtml from '../html/home.html';
import Page from './Page';
import establishmentListPage from './EstablishmentListPage';
import establishmentFormPage from './EstablishmentFormPage';
const API_URL = 'https://www.geowe.org/gobuy/service/api.php/records';
const TOWN_URL = API_URL + '/MUNICIPIOS?order=NOMBRE'
const CATEGORY_URL = API_URL + '/CATEGORIAS?order=NOMBRE';
class HomePage extends Page {

    constructor() {
        super();
        this.load();
    }

    async load() {
        const townData = await this.getDataFromURL(TOWN_URL);
        document.getElementById('loader-page').style.display = 'none';

        this._content.innerHTML = homeHtml.trim();

        this.completeCombo("municipiosSelect", townData, 'NOMBRE', 'ID_MUNICIPIO', this.onTownSelected.bind(this));

        const searchButton = document.getElementById("searchButton");
        searchButton.onclick = async() => {
            this.showLoader(true);
            const townSelected = this.getOptionSelected("municipiosSelect");
            const categorySelected = this.getOptionSelected("categoriasSelect");

            const data = await establishmentListPage.getData(townSelected, categorySelected);
            this.showLoader(false);

            if (data.records.length === 0)
                alert(`No se han encontrado establecimientos para ${categorySelected.text} . Pruebe con otra categoría`);
            else
                establishmentListPage.load(data);
        }

        const addButton = document.getElementById("addButton");
        addButton.onclick = () => {
            //establishmentFormPage.load();
            var win = window.open('https://geowe.org/gobuy/goBuy-formulario-alta.html', '_blank');
            win.focus();
        }
    }

    async getDataFromURL(url) {
        const response = await fetch(url);
        return await response.json();
    }

    completeCombo(comboName, data, textFieldName, valueFieldName, onChangeCallback, enabled = true) {
        const combo = document.getElementById(comboName);
        this.loadCombo(combo, data.records, textFieldName, valueFieldName);
        combo.onchange = onChangeCallback;
        combo.disabled = !enabled;
    }

    loadCombo(combo, data, textFieldName, valueFieldName) {
        for (var item of data) {
            var option = document.createElement("option");
            option.text = item[textFieldName];
            option.value = item[valueFieldName];
            combo.add(option);
        }
    }

    async onTownSelected() {
        if (document.getElementById('categoriasSelect').length == 1) {
            this.showLoader(true);
            const categoryData = await this.getDataFromURL(CATEGORY_URL);
            this.completeCombo("categoriasSelect", categoryData, 'NOMBRE', 'ID_CATEGORIA', undefined);
            this.showLoader(false);
        }
    }

    getOptionSelected(comboName) {
        const combo = document.getElementById(comboName);

        return {
            text: combo.options[combo.selectedIndex].text,
            value: combo.options[combo.selectedIndex].value
        };
    }


}

export default new HomePage();