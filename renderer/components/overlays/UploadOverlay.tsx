import { Loader } from "@mantine/core";
import Overlay from "./Overlay";

export default function UploadOverlay({
  open,
  free,
}: {
  open: boolean;
  free?: boolean;
}) {
  return (
    <Overlay open={open}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <Loader color="green" size="xl" />
        <b>Give us a couple seconds to upload your video!</b>
        {free && (
          <p>
            Sorry if it&apos;s a little slow! This process is almost
            instantaneous on premium vento, we only turn them on for premium
            users for server cost reasons!
          </p>
        )}
      </div>
    </Overlay>
  );
}
