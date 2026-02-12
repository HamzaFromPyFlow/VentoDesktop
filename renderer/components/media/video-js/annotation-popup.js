import videojs from "video.js";

const ModalDialog = videojs.getComponent("ModalDialog");
const Component = videojs.getComponent("Component");

class AnnotationPopup extends Component {
  constructor(player, options) {
    super(player, options);

    const overlay = document.querySelector(".annotation-popup-content");
    const closeBtn = overlay.querySelector("button");

    closeBtn.addEventListener("click", () => {
      this.modal.close();
    });

    this.modal = new ModalDialog(player, {
      content: overlay,
      temporary: false,
      pauseOnOpen: false,
    });

    this.modal.addClass("annotation-popup");
    player.addChild(this.modal);

    document
      .querySelector(".annotation-popup .vjs-modal-dialog-content")
      .appendChild(overlay);
  }

  toggle(enable) {
    if (enable) this.modal.open();
    else this.modal.close();

    this.modal.toggleClass("visible", enable);
  }
}

export default AnnotationPopup;

