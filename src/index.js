import './page/HomePage';

function onExit() {
    return '¿Estás seguro de salir de goBuy?';
}

window.onbeforeunload = onExit;