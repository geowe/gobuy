import home from './HomePage';

export default class Page {
    constructor() {
        this._content = document.getElementById("content");
    }

    toHomeButton() {
        const cancelButton = document.getElementById("cancelBtn");
        cancelButton.onclick = () => {
            home.load();
        }
    }
}