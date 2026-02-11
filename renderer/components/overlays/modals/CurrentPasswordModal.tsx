import { Loader, Modal, PasswordInput } from "@mantine/core";
import { useState } from "react";

type CurrentPasswordModalProps = {
  opened: boolean;
  loading: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

export default function CurrentPasswordModal({
  opened,
  loading,
  errorMessage,
  onClose,
  onSubmit
}: CurrentPasswordModalProps) {
  const handleClose = () => {
    if (!loading) {
      setPassword("");
      onClose();
    }
  };
  const [password, setPassword] = useState("");
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Enter password to change your email"
      centered
      withCloseButton={false}
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
        <p>Once you confirm your password, <b>we&apos;ll redirect you to the login screen to login with your new email.</b></p>
        <form
          onSubmit={async(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const currentPassword = formData.get("password")
            onSubmit(currentPassword as string)
          }}
          style={{marginTop:"20px"}}
        >
          <PasswordInput
            placeholder="Enter your password..."
            label="Current Password"
            name="password"
            withAsterisk
            required
            autoFocus
            value={password}
            onChange={handlePasswordChange}
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <br />
          <div className="cta-container">
            <button onClick={handleClose} type="reset" className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={!password}>
              {loading?               
                <Loader
                  color="dark"
                  size="sm"
                  className="loader"
                /> : <p>Change Email</p>}
            </button>
          </div>
        </form>
    </Modal>
  );
}
