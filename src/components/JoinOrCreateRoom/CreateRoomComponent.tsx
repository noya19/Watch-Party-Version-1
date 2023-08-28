import React, { useContext, useEffect, useState } from 'react'
import playerContext from '../../store/player-context';
import classes from "./createRoomComponent.module.css";

const CreateRoomComponent: React.FC<{ handleClose: () => void }> = (props) => {

    const [isError, setIsError] = useState(false);
    const [hostName, setHostName] = useState("");
    const playerCtx = useContext(playerContext);



    const onCreateRoombyEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // If the key is an 'enter'.
        if (event.key === 'Enter') {

            //1. Router to /player and create a connection
            playerCtx.confirmIsHost(true);
            playerCtx.confirmName(hostName);

            //2. Close the Modal
            props.handleClose();

        }

    }

    const onCreateRoombyClick = () => {
        if (!hostNameValidation()) {
            setIsError(true);
            return;
        } else {
            playerCtx.confirmIsHost(true);
            playerCtx.confirmName(hostName);
            props.handleClose();
        }
    }

    const hostNameValidation = (): boolean => {
        return !(hostName === "")
    }


    useEffect(() => {
        const name = playerCtx.name;
        setHostName(name);
    }, [])

    return (
        <div className={classes['create-room']}>
            <label>Hostname</label>
            <input
                value={hostName}
                onChange={(e) => { setHostName(e.target.value) }}
                onKeyDown={onCreateRoombyEnter}
                className={classes['customTextField']}
                onFocus={() => setIsError(false)}
            />
            <p className={`${classes.errorText} ${isError ? classes.error : ''}`}>Hostname cannot be empty</p>
            <div className={classes['button-container']}>
                <button onClick={onCreateRoombyClick} className={classes['button-grp']} >
                    <p>Next</p>
                    <div className={classes.rightArrow}><img src="https://img.icons8.com/sf-black-filled/64/000000/long-arrow-right.png" alt="long-arrow-right" /></div>
                </button>
            </div>
        </div >
    )
}

export default CreateRoomComponent