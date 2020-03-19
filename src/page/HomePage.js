import homeHtml from '../html/home.html';
import Page from './Page';
import establishmentListPage from './EstablishmentListPage';
import establishmentFormPage from './EstablishmentFormPage';

class HomePage extends Page {

    constructor() {
        super();
        this.load();
    }

    load() {
        this._content.innerHTML = homeHtml.trim();

        const searchButton = document.getElementById("searchButton");
        searchButton.onclick = () => {
            establishmentListPage.load();
        }

        const addButton = document.getElementById("addButton");
        addButton.onclick = () => {
            //establishmentFormPage.load();
            var win = window.open('https://geowe.org/goBuy/goBuy-formulario-alta.html', '_blank');
            win.focus();
        }
    }
}

export default new HomePage();