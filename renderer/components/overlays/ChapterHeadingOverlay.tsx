import { formatVideoDuration } from "../../lib/helper-pure";
import { TextInput } from "@mantine/core";
import { ChapterHeading } from "@schema/index";
import { MdClose } from "react-icons/md";

import styles from "../../styles/modules/ChapterHeadingOverlay.module.scss";
import Overlay from "./Overlay";

type ChapterHeadingModalProps = {
  currentHeading: ChapterHeading | null;
  videoChapterHeadings: ChapterHeading[];
  currentVideoDuration: number;
  editingHeadingIndex: number;
  setIsVideoEdit?: (key: boolean) => void;
  open: boolean;
  onClose: () => void;
  onVideoChapterHeadingUpdate: (chapterHeadings: ChapterHeading[]) => void;
  onChapterHeadingUpdate: (chapterHeading: ChapterHeading) => void;
};

export default function ChapterHeadingModal({
  currentHeading,
  videoChapterHeadings,
  editingHeadingIndex,
  currentVideoDuration,
  onVideoChapterHeadingUpdate,
  onChapterHeadingUpdate,
  setIsVideoEdit,
  open,
  onClose,
}: ChapterHeadingModalProps) {
  return (
    <Overlay open={open} onClick={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!currentHeading) return;

          if (editingHeadingIndex !== -1) {
            videoChapterHeadings[editingHeadingIndex] = currentHeading;
          } else {
            videoChapterHeadings.push(currentHeading);

            if (!localStorage.getItem("showChapterHeadingToast")) {
              // Desktop version: use console.log instead of showNotification
              console.log("Chapter Heading added! Edit it by clicking on the menu icon in your timeline");
              localStorage.setItem("showChapterHeadingToast", "true");
            }
          }
          setIsVideoEdit && setIsVideoEdit(true)
          onVideoChapterHeadingUpdate(videoChapterHeadings);
          onClose();
        }}
        onReset={(e) => {
          e.preventDefault();
          if (!currentHeading || editingHeadingIndex === -1) return;

          videoChapterHeadings.splice(editingHeadingIndex, 1);

          onVideoChapterHeadingUpdate(videoChapterHeadings);
          onClose();
        }}
        className={styles.headingModal}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => onClose()}
        >
          <MdClose />
        </button>
        <h3>
          {editingHeadingIndex !== -1 ? "Edit" : "Insert new"} Chapter Heading
          at{" "}
          {formatVideoDuration(
            editingHeadingIndex !== -1
              ? currentHeading?.timestamp ?? 0
              : currentVideoDuration
          )}
        </h3>
        <div className={styles.row}>
          <p>Heading Title</p>
          <p>{currentHeading?.title.length ?? 0}/75</p>
        </div>
        <TextInput
          maxLength={75}
          autoFocus
          value={currentHeading?.title}
          name="chapterHeadingTitle"
          type="text"
          onChange={(e) => {
            if (!currentHeading) return;

            onChapterHeadingUpdate({
              ...currentHeading,
              title: e.target.value,
            });
          }}
          id="chapterHeadingTitle"
          required
          placeholder="This is where the bug starts"
        />
        <div className={styles.ctaContainer}>
          {editingHeadingIndex !== -1 && (
            <button type="reset" className={styles.deleteCta}>
              Delete Chapter Heading
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
