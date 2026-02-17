import { useEffect, useState } from 'react';
import { Menu, Popover } from '@mantine/core';
import { formatVideoDuration } from '@lib/helper-pure';
import { logClientEvent } from '@lib/misc';
import { isUserFreePlan } from '@lib/payment-helper';
import { useAuth } from '@stores/authStore';
import { IoDiamondOutline } from 'react-icons/io5';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import styles from '../../styles/modules/EditorDropdown.module.scss';

export const Action = {
  INSERT: 'insert',
  HEADING: 'heading',
  ANNOTATION: 'annotation',
  TRIM: 'trim',
  BLUR: 'blur',
  CTA: 'cta',
};

/**
 * Editor Edit Dropdown component for desktop.
 * Adapted from the web version.
 */
export default function EditorEditDropdown({
  currentVideoDuration,
  onAction,
  openTooltip,
  setOpenTooltip,
  isVideoDisconnected = false,
}) {
  const formattedDuration = formatVideoDuration(currentVideoDuration);
  const { ventoUser } = useAuth();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      logClientEvent('click.editor.metadata', {
        action: 'open-edit-dropdown',
      });
    }
  }, [open]);

  return (
    <>
      <Menu
        onChange={(val) => {
          setOpen(val);
        }}
        opened={open}
        shadow="md"
        position="top-end"
        radius="md"
        offset={15}
      >
        <Popover opened={openTooltip} width={400} position="top-end" withArrow>
          <Popover.Target>
            <button style={{ position: 'absolute', right: '0rem' }}></button>
          </Popover.Target>

          <Popover.Dropdown className="editor-dropdown-tooltip">
            <div className="item">
              <h4>📒 Long Video? Sharing to multiple people?</h4>
              <p>
                Add Chapter Headings so after your audience watches it they can
                come back and re-find something you talked about!
              </p>
            </div>
            <div className="item">
              <h4> 🖍 Forget to say something while recording?</h4>
              <p>
                Add Author Annotations so your audience can get added context
                while watching!
              </p>
            </div>
          </Popover.Dropdown>
        </Popover>

        <Menu.Target>
          <button
            onClick={() => setOpenTooltip(false)}
            className={styles.editBtn}
          >
            <span className={styles.editBtnText}>
              <span>Edit</span>
              <span>Video</span>
            </span>
            <MdKeyboardArrowUp />
          </button>
        </Menu.Target>

        <Menu.Dropdown className={styles.dropdown}>
          <Menu.Item
            onClick={() => onAction(Action.BLUR)}
            className={isUserFreePlan(ventoUser) ? styles.premiumMenuItem : ''}
          >
            <span>
              Blur Video
              <p className={styles.description}>
                Obscure sensitive areas of your video{' '}
              </p>
            </span>
            {isUserFreePlan(ventoUser) && (
              <span>
                <IoDiamondOutline size={20} />
              </span>
            )}
          </Menu.Item>

          <Menu.Item
            onClick={() => onAction(Action.TRIM)}
            className={styles.doubleColumnMenuItem}
          >
            <span>
              Trim Video
              <p className={styles.description}>
                Remove unwanted portions of your video{' '}
              </p>
            </span>
          </Menu.Item>

          <Menu.Item
            onClick={() => onAction(Action.CTA)}
            className={isUserFreePlan(ventoUser) ? styles.premiumMenuItem : ''}
          >
            <span>
              Add CTA at {formattedDuration}
              <p className={styles.description}>
                Link to other videos or anywhere else on the internet
              </p>
            </span>
            {isUserFreePlan(ventoUser) && (
              <span>
                <IoDiamondOutline size={20} />
              </span>
            )}
          </Menu.Item>

          <Menu.Item
            onClick={() => onAction(Action.ANNOTATION)}
            disabled={isUserFreePlan(ventoUser)}
          >
            Add Author Annotation at {formattedDuration}
            <p className={styles.description}>
              Forgot to mention something while recording? Add annotations that
              appear to viewers while watching
            </p>
          </Menu.Item>
          <Menu.Item onClick={() => onAction(Action.HEADING)}>
            Add Chapter Heading at {formattedDuration}
            <p className={styles.description}>
              Help your viewers skip to important parts of your recording
            </p>
          </Menu.Item>
          <a
            href="https://equable-learning-85f.notion.site/Vento-s-Unique-Video-Editing-Features-d4253ba9cd454cacac48392064d76818"
            target="_blank"
            rel="noreferrer"
            className={styles.featureLink}
            onClick={() => {
              logClientEvent('click.editor.metadata', {
                action: 'click-what-are-these-features',
              });
            }}
          >
            <Menu.Item>What are these features?</Menu.Item>
          </a>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
