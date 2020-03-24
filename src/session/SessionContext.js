import LocalStorageContext from './LocalStorageContext';

class SessionContext extends LocalStorageContext {
    constructor() {
        super();
        
        this.fields = {
            onTheWay: "onTheWay",
            entering: "enter"
        };
    }

    setOnTheWay(shopId) {
        this.remove(this.fields.entering);
        this.set(this.fields.onTheWay, shopId);
    }

    getOnTheWay() {
        return this.get(this.fields.onTheWay);
    }

    setEntering(shopId) {
        this.remove(this.fields.onTheWay);
        this.set(this.fields.entering, shopId);
    }

    getEntering() {
        return this.get(this.fields.entering);
    }

    clear() {
        this.remove(this.fields.onTheWay);
        this.remove(this.fields.entering);                
    }
}

export default new SessionContext();
