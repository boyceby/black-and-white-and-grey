import Model from "./gameModel.js";
import Controller from "./gameController.js";
import View from "./gameView.js";

window.addEventListener('load', () => {

    let model = new Model(4);
    let view = new View(model);
    let controller = new Controller(model, view);

    let body = document.querySelector('body');
    body.append(view.div);
    
})