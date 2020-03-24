
const WebStorageES6 = require('web-storage-es6');

export default class LocalStorageContext {
    constructor() {
        this.localStorage = new WebStorageES6('Local');
    }

    set(key, value) {
        this.localStorage.put(key, value);
    }

    get(key) {        
        return this.localStorage.get(key);
    }

    remove(key) {
        return this.localStorage.forget(key);
    }
}
