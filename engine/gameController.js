export default class Controller {
    constructor(model, view) {

        this.model = model;
        this.view = view;

        view.addResetListener((e) => {
            model.setupNewGame();
        });

        view.addMoveListener((e) => {
            switch (e.direction) {
                case 'up':
                    model.move('up');
                    break;
                case 'down':
                    model.move('down');
                    break;
                case 'left':
                    model.move('left');
                    break;
                case 'right':
                    model.move('right');
                    break;
            }
        });

    }

}