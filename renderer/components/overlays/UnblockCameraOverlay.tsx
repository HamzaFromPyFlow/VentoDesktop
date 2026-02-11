import { useSettingsStore } from "../../stores/settingsStore";
import { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function UnblockCameraOverlay() {
  const { getVideoInputs } = useSettingsStore((state) => ({
    getVideoInputs: state.getVideoInputs,
  }));

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });

        if (navigator.permissions) {
          navigator.permissions.query({ name: "camera" } as any).then((result) => {
            if (result.state === "granted") {
              useSettingsStore.setState({ showUnblockInstructions: "none" });
              getVideoInputs();
            }
          });
        } else {
          // Fallback for browsers without permissions API
          useSettingsStore.setState({ showUnblockInstructions: "none" });
          getVideoInputs();
        }
      } catch (err) {
        // Permission not granted yet
      }
    }, 250);

    return () => clearInterval(interval);
  }, [getVideoInputs]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>vento</p>
      
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Allow Vento to access your <strong>camera</strong>
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          In the address bar above, click the camera icon with the red X,
          <br /> then select Always allow, then Done
        </p>
        <button
          onClick={() =>
            useSettingsStore.setState({ showUnblockInstructions: "none" })
          }
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto',
          }}
        >
          <FaArrowLeft />
          Continue without Camera access
        </button>
      </div>
    </div>
  );
}
