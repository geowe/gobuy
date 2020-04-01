class SearchTool {

    load(callback) {
        const search = document.getElementById('search');

        search.addEventListener('input', (e) => {
            callback.createCardList.bind(callback, e.srcElement.value)();
        });
    }
}

export default new SearchTool();