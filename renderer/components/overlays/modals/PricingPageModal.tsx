import { Modal } from "@mantine/core";
import Pricing from "../../../pages/pricing/Pricing";

type PricingPageModalProps = {
    opened: boolean;
    onClose: () => void;
  };
  
export default function PricingPageModal({
  opened,
  onClose,
}: PricingPageModalProps) {
    
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            trapFocus={true}
            size="auto"
            overflow="outside"
            styles={{
                close:{
                    svg: {
                        width: '24px',
                        height: '24px',
                      },
                }
            }}
            classNames={{
                root: "modalRoot",
                modal: "modalContent",
                body: "modalBody",
                header: "modalHeader",
            }} 
        >
            <div style={{ padding: '20px' }}>
                <Pricing />
            </div>
        </Modal>
      );
}
