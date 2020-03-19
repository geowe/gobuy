import establishmentFormHtml from '../html/establishmentForm.html';
import Page from './Page';

class EstablishmentFormPage extends Page {
    constructor() {
        super()
    }
    load() {
        this._content.innerHTML = establishmentFormHtml.trim();
        this.toHomeButton();
    }
}

export default new EstablishmentFormPage();