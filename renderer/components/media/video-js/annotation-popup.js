import videojs from "video.js";

const ModalDialog = videojs.getComponent("ModalDialog");
const Component = videojs.getComponent("Component");

class AnnotationPopup extends Component {
  constructor(player, options) {
    super(player, options);

    // Wait for the DOM element to be available
    // Note: This element only exists in ViewRecording page, not in Editor page
    const overlay = document.querySelector(".annotation-popup-content");
    if (!overlay) {
      // Silently skip initialization if element doesn't exist - this is expected in some contexts
      this.modal = null;
      return;
    }

    const closeBtn = overlay.querySelector("button");
    if (!closeBtn) {
      // Silently skip initialization if close button doesn't exist
      this.modal = null;
      return;
    }

    closeBtn.addEventListener("click", () => {
      if (this.modal) {
        this.modal.close();
      }
    });

    this.modal = new ModalDialog(player, {
      content: overlay,
      temporary: false,
      pauseOnOpen: false,
    });

    this.modal.addClass("annotation-popup");
    player.addChild(this.modal);

    const modalContent = document.querySelector(".annotation-popup .vjs-modal-dialog-content");
    if (modalContent) {
      modalContent.appendChild(overlay);
    }
  }

  toggle(enable) {
    if (!this.modal) return;
    
    if (enable) this.modal.open();
    else this.modal.close();

    this.modal.toggleClass("visible", enable);
  }
}

export default AnnotationPopup;

