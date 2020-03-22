import home from './HomePage';

export default class Page {
    constructor() {
        this._content = document.getElementById("content");
    }

    toHomeButton() {
        const cancelButton = document.getElementById("cancelBtn");
        cancelButton.onclick = () => {
            this.showLoader(true);
            home.load();
        }
    }

    showLoader(status) {
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
        if (status)
            loader.style.display = 'block';
    }
}