import React, { useContext, useState } from 'react';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import info from '../assets/about-24.png';
import copy from '../assets/icons8-copy-64.png';
import correct from '../assets/checked.png';

import classes from './consoleHeader.module.css';
import { Button, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseIcon from '@mui/icons-material/Pause';
import playerContext from '../store/player-context';

const actions = [
    { icon: <PlayCircleIcon />, name: 'Ask host to play', action: "play" },
    { icon: <PauseIcon />, name: 'Ask host to pause', action: "pause" },
];


const ConsoleHeader: React.FC<{ request: (msg: any) => void }> = (props) => {
    const playerCtx = useContext(playerContext);
    const [iscopied, setIsCopied] = useState(false);

    function onClickCopyButton() {
        navigator.clipboard.writeText(playerCtx.roomId);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }


    return (
        <div className={classes.consoleHeader}>
            <div className={classes.roomInfo}>
                <img src={info} className={classes.icon} />
                <div>
                    <p>{playerCtx.roomId}</p>
                    <Button
                        variant='contained'
                        color={iscopied ? 'success' : 'primary'}
                        onClick={onClickCopyButton}
                    >
                        <img src={`${iscopied ? correct : copy}`} />
                    </Button>
                </div>

            </div>
            {!playerCtx.isHost && playerCtx.hasUploaded &&
                <div className={classes.hostControls}>
                    <SpeedDial
                        ariaLabel="SpeedDial basic example"
                        icon={<SpeedDialIcon />}
                        direction='left'
                        sx={{
                            "& .MuiSpeedDial-fab": {
                                width: 40, height: 40
                            }
                        }}
                    >
                        {actions.map((action) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.icon}
                                tooltipTitle={action.name}
                                onClick={() => {
                                    props.request(action.action);
                                }}
                            />
                        ))}
                    </SpeedDial>
                </div>}
        </div >
    )
}

export default ConsoleHeader