import { MdDone } from "react-icons/md";
import { VscDebugPause } from "react-icons/vsc";
import Overlay from "./Overlay";

type OnboardingOverlayProps = {
  open: boolean;
  onComplete: () => void;
  onPause: () => void;
};

export default function OnboardingOverlay({
  open,
  onComplete,
  onPause,
}: OnboardingOverlayProps) {
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
        <p style={{ marginBottom: '1rem' }}>
          The recording won't be editable once completed. Try
          <span style={{ color: '#67E997' }}> pausing</span> to review it first in
          case there's anything you'd like to rerecord!
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={onComplete} style={{
            padding: '0.5rem 1rem',
            background: '#67E997',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <MdDone /> Complete
          </button>
          <button onClick={onPause} style={{
            padding: '0.5rem 1rem',
            background: '#f0f0f0',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <VscDebugPause />
            Pause
          </button>
        </div>
      </div>
    </Overlay>
  );
}
