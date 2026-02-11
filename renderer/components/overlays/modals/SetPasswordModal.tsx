import { getStrength } from "../../../lib/helper-pure";
import { Loader, Modal, PasswordInput } from "@mantine/core";
import { useEffect, useState } from "react";

type SetPasswordModalProps = {
  opened: boolean;
  loading: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

export default function SetPasswordModal({
  opened,
  loading,
  errorMessage,
  onClose,
  onSubmit
}: SetPasswordModalProps) {
  const handleClose = () => {
    if (!loading) {
      setPassword("");
      setConfirmPassword("");
      onClose();
    }
  };
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    newPasswordError: '',
    newConfirmedPasswordError: '',
  });
  const [submitPasswordBtnDisabled, setSubmitPasswordBtnDisabled] = useState(true);
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };
  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.currentTarget.value);
  };
  // Handle Password Validation
  useEffect(() => {
    setPasswordErrors({
      newPasswordError: '',
      newConfirmedPasswordError: '',
    })
    setSubmitPasswordBtnDisabled(false)
    if (password == '' || confirmPassword == '') {
      setSubmitPasswordBtnDisabled(true)
    }
    if ((getStrength(password)!== 100) && password !== "") {
        setPasswordErrors((prev) => ({
          ...prev,
          newPasswordError: "Password Strength is Low",
        }));
        setSubmitPasswordBtnDisabled(true)
      }
    if (confirmPassword != "" && confirmPassword !== password) {
      setPasswordErrors((prev) => ({
        ...prev,
        newConfirmedPasswordError: "Passwords do not match",
      }));
      setSubmitPasswordBtnDisabled(true)
    }
  },[password, confirmPassword])
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Set Password"
      centered
      withCloseButton={false}
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
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
            label="New Password"
            name="password"
            withAsterisk
            required
            autoFocus
            value={password}
            onChange={handlePasswordChange}
            style={{ width: '350px', marginBottom: '20px' }}
            error={passwordErrors.newPasswordError}
          />
         <PasswordInput
            label="Confirm Password"
            name="password"
            withAsterisk
            required
            autoFocus
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            style={{ width: '350px'}}
            error={passwordErrors.newConfirmedPasswordError}
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <br />
          <div className="cta-container">
            <button onClick={handleClose} type="reset" className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={submitPasswordBtnDisabled}>
              {loading?               
                <Loader
                  color="dark"
                  size="sm"
                  className="loader"
                /> : <p>Set Password</p>}
            </button>
          </div>
        </form>
    </Modal>
  );
}
