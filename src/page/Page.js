import home from './HomePage';
import mapViewer from '../map/MapViewer';

const REFRESH_INTERVAL = 60000;

export default class Page {
    constructor() {
        this._content = document.getElementById("content");
    }

    toHomeButton() {
        const cancelButton = document.getElementById("cancelBtn");
        cancelButton.onclick = () => {
            this.showLoader(true);
            this.stopRefreshInterval();
            mapViewer.clearMap();
            home.load();
        }
    }

    showLoader(status) {
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
        if (status)
            loader.style.display = 'block';
    }

    startRefreshInterval(callback) {
        this._intervalId = setInterval(this.updateCounterData.bind(this), REFRESH_INTERVAL);
    }


    stopRefreshInterval() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
    }
}