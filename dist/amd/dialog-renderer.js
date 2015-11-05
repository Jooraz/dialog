define(['exports', 'aurelia-templating'], function (exports, _aureliaTemplating) {
  'use strict';

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var currentZIndex = 1000;
  var transitionEvent = (function () {
    var t = undefined;
    var el = document.createElement('fakeelement');

    var transitions = {
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

  var globalSettings = {
    lock: true,
    centerHorizontalOnly: false
  };

  exports.globalSettings = globalSettings;

  var DialogRenderer = (function () {
    function DialogRenderer() {
      var _this = this;

      _classCallCheck(this, DialogRenderer);

      this.defaultSettings = globalSettings;

      this.dialogControllers = [];
      document.addEventListener('keyup', function (e) {
        if (e.keyCode === 27) {
          var _top = _this.dialogControllers[_this.dialogControllers.length - 1];
          if (_top && _top.settings.lock !== true) {
            _top.cancel();
          }
        }
      });
    }

    DialogRenderer.prototype.createDialogHost = function createDialogHost(controller) {
      var _this2 = this;

      var settings = controller.settings;
      var modalOverlay = document.createElement('ai-dialog-overlay');
      var modalContainer = document.createElement('ai-dialog-container');
      var body = document.body;

      modalOverlay.style.zIndex = getNextZIndex();
      modalContainer.style.zIndex = getNextZIndex();

      document.body.appendChild(modalOverlay);
      document.body.appendChild(modalContainer);

      controller.slot = new _aureliaTemplating.ViewSlot(modalContainer, true);
      controller.slot.add(controller.view);

      controller.showDialog = function () {
        _this2.dialogControllers.push(controller);

        controller.slot.attached();

        modalOverlay.onclick = function () {
          if (!settings.lock) {
            controller.cancel();
          } else {
            return false;
          }
        };

        return new Promise(function (resolve) {
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

      controller.hideDialog = function () {
        var i = _this2.dialogControllers.indexOf(controller);
        if (i !== -1) {
          _this2.dialogControllers.splice(i, 1);
        }

        return new Promise(function (resolve) {
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

      controller.destroyDialogHost = function () {
        document.body.removeChild(modalOverlay);
        document.body.removeChild(modalContainer);
        controller.slot.detached();
        return Promise.resolve();
      };

      return Promise.resolve();
    };

    DialogRenderer.prototype.showDialog = function showDialog(controller) {
      return controller.showDialog();
    };

    DialogRenderer.prototype.hideDialog = function hideDialog(controller) {
      return controller.hideDialog();
    };

    DialogRenderer.prototype.destroyDialogHost = function destroyDialogHost(controller) {
      return controller.destroyDialogHost();
    };

    return DialogRenderer;
  })();

  exports.DialogRenderer = DialogRenderer;
});