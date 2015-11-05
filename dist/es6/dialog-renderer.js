import {ViewSlot} from 'aurelia-templating';

let currentZIndex = 1000;
let transitionEvent = (function() {
  let t;
  let el = document.createElement('fakeelement');

  let transitions = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
  };

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
})();

function getNextZIndex() {
  return ++currentZIndex;
}

export let globalSettings = {
  lock: true,
  centerHorizontalOnly: false
};

export class DialogRenderer {
  defaultSettings = globalSettings;
  constructor() {
    this.dialogControllers = [];
    document.addEventListener('keyup', e => {
      if (e.keyCode === 27) {
        let top = this.dialogControllers[this.dialogControllers.length - 1];
        if (top && top.settings.lock !== true) {
          top.cancel();
        }
      }
    });
  }

  createDialogHost(controller) {
    let settings = controller.settings;
    let modalOverlay = document.createElement('ai-dialog-overlay');
    let modalContainer = document.createElement('ai-dialog-container');
    let body = document.body;

    modalOverlay.style.zIndex = getNextZIndex();
    modalContainer.style.zIndex = getNextZIndex();

    document.body.appendChild(modalOverlay);
    document.body.appendChild(modalContainer);

    controller.slot = new ViewSlot(modalContainer, true);
    controller.slot.add(controller.view);

    controller.showDialog = () => {
      this.dialogControllers.push(controller);

      controller.slot.attached();

      modalOverlay.onclick = () => {
        if (!settings.lock) {
          controller.cancel();
        } else {
          return false;
        }
      };

      return new Promise((resolve) => {
        modalContainer.addEventListener(transitionEvent, onTransitionEnd);

        function onTransitionEnd() {
          modalContainer.removeEventListener(transitionEvent, onTransitionEnd);
          resolve();
        }

        modalOverlay.classList.add('active');
        modalContainer.classList.add('active');
        body.classList.add('ai-dialog-open');
      });
    };

    controller.hideDialog = () => {
      let i = this.dialogControllers.indexOf(controller);
      if (i !== -1) {
        this.dialogControllers.splice(i, 1);
      }

      return new Promise((resolve) => {
        modalContainer.addEventListener(transitionEvent, onTransitionEnd);

        function onTransitionEnd() {
          modalContainer.removeEventListener(transitionEvent, onTransitionEnd);
          resolve();
        }

        modalOverlay.classList.remove('active');
        modalContainer.classList.remove('active');
        body.classList.remove('ai-dialog-open');
      });
    };

    controller.destroyDialogHost = () => {
      document.body.removeChild(modalOverlay);
      document.body.removeChild(modalContainer);
      controller.slot.detached();
      return Promise.resolve();
    };

    return Promise.resolve();
  }

  showDialog(controller) {
    return controller.showDialog();
  }

  hideDialog(controller) {
    return controller.hideDialog();
  }

  destroyDialogHost(controller) {
    return controller.destroyDialogHost();
  }
}
