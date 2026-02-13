import { Modal, Transition } from "@mantine/core";
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
        <Transition
            mounted={opened}
            transition="slide-up"
            duration={500}
            timingFunction="ease"
        >
            {(transitionStyles) => (
            <Modal
                opened={opened}
                onClose={onClose}
                centered
                trapFocus={true}
                size="auto"
                overflow="outside"
                style={transitionStyles}
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
                <Pricing hideHeader={true}/>
            </Modal>
            )}
        </Transition>
      );
}
