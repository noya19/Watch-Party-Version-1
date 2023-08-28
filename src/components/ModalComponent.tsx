import React from 'react'
import { Modal, Backdrop, Fade, Box } from '@mui/material';

type prop = {
    children: React.ReactNode
    open: boolean
    onClose: () => void
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(115,6,122,0.55)',
    backdropFilter: 'blur(10px)',
    border: "1px solid rgba(115,6,122,0.275)",
    boxShadow: 24,
    p: 4,
    borderRadius: "5px",
    padding: "10px 5px",
    width: "auto",
    height: 'auto'
};


const ModalComponent: React.FC<prop> = (props) => {
    return (
        <React.Fragment>
            <Modal
                open={props.open}
                onClose={props.onClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={props.open}>
                    <Box sx={modalStyle}>
                        {props.children}
                    </Box>
                </Fade>
            </Modal>
        </React.Fragment >
    )
}

export default ModalComponent