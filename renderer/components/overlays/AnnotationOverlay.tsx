import { formatVideoDuration } from "../../lib/helper-pure";
import { Textarea } from "@mantine/core";
import { AuthorAnnotation } from "@schema/index";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { MdClose } from "react-icons/md";

import styles from "../../styles/modules/AnnotationOverlay.module.scss";
import Overlay from "./Overlay";

type AnnotationOverlayProps = {
  currentAnnotation: AuthorAnnotation | null;
  videoAnnotations: AuthorAnnotation[];
  userProfilePhoto?: string | null;
  currentVideoDuration: number;
  editingAnnotationIndex: number;
  open: boolean;
  setIsVideoEdit?: (key: boolean) => void;
  onClose: () => void;
  onVideoAnnotationsUpdate: (annotation: AuthorAnnotation[]) => void;
  onAnnotationUpdate: (annotation: AuthorAnnotation) => void;
};

export default function AnnotationOverlay({
  currentAnnotation,
  videoAnnotations,
  currentVideoDuration,
  editingAnnotationIndex,
  setIsVideoEdit,
  open,
  onClose,
  userProfilePhoto,
  onAnnotationUpdate,
  onVideoAnnotationsUpdate,
}: AnnotationOverlayProps) {
  return (
    <Overlay open={open} onClick={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!currentAnnotation) return;

          if (editingAnnotationIndex !== -1) {
            videoAnnotations[editingAnnotationIndex] = currentAnnotation;
          } else {
            videoAnnotations.push(currentAnnotation);
          }
          setIsVideoEdit && setIsVideoEdit(true)
          onVideoAnnotationsUpdate(videoAnnotations);
          onClose();
        }}
        onReset={(e) => {
          e.preventDefault();
          if (!currentAnnotation || editingAnnotationIndex === -1) return;

          videoAnnotations.splice(editingAnnotationIndex, 1);

          onVideoAnnotationsUpdate(videoAnnotations);
          onClose();
        }}
        className={styles.annotationModal}
      >
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <MdClose />
        </button>
        <h3>
          {editingAnnotationIndex !== -1 ? "Edit" : "Insert"} Text Annotation at{" "}
          {formatVideoDuration(
            editingAnnotationIndex !== -1
              ? currentAnnotation?.timestamp ?? 0
              : currentVideoDuration
          )}
        </h3>
        <p className={styles.description}>
          Forgot to mention something while recording? Add annotations that
          appear to viewers while watching
        </p>
        <Textarea
          autoFocus
          value={currentAnnotation?.text}
          name="annotationText"
          minRows={3}
          onChange={(e) => {
            if (!currentAnnotation) return;

            onAnnotationUpdate({
              ...currentAnnotation,
              text: e.target.value,
            });
          }}
          id="annotationText"
          required
          placeholder="I forgot to mention..."
        />
        <div className={styles.ctaContainer}>
          {userProfilePhoto ? (
            <img
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              src={userProfilePhoto}
              alt="profile photo"
              className={styles.userIcon}
            />
          ) : (
            <HiOutlineEmojiHappy size="4rem" className={styles.userIcon} />
          )}
          {editingAnnotationIndex !== -1 && (
            <button type="reset" className={styles.deleteCta}>
              Delete Annotation
            </button>
          )}
          <button type="submit" className={styles.insertCta}>
            Insert
          </button>
        </div>
      </form>
    </Overlay>
  );
}
