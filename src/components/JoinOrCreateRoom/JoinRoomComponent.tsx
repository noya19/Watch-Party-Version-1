import React, { useContext, useEffect, useState } from 'react'
import playerContext from '../../store/player-context';
import classes from './joinRoom.module.css';


const JoinRoomComponent: React.FC<{ handleClose: () => void }> = (props) => {
    const [isError, setIsError] = useState({
        roomID: false,
        username: false,
    });
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const playerCtx = useContext(playerContext);

    const onJoinRoombyEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const isRoomIdValid = roomIdValidation();
            const isUserIdValid = userIdValidation();

            if (isRoomIdValid && isUserIdValid) {
                playerCtx.confirmIsHost(false);
                playerCtx.confirmName(username);
                playerCtx.confirmRoomId(roomId);
                props.handleClose();
            }

            if (!isRoomIdValid) {
                setIsError((prevState) => {
                    return {
                        roomID: true,
                        username: prevState.username
                    }
                });
            }

            if (!isUserIdValid) {
                setIsError((prevState) => {
                    return {
                        ...prevState,
                        username: true,
                    }
                });
            }
        }
    }

    const onJoinRoombyClick = () => {
        const isRoomIdValid = roomIdValidation();
        const isUserIdValid = userIdValidation();

        if (isRoomIdValid && isUserIdValid) {
            playerCtx.confirmIsHost(false);
            playerCtx.confirmName(username);
            playerCtx.confirmRoomId(roomId);
            props.handleClose();
        }

        if (!isRoomIdValid) {
            setIsError((prevState) => {
                return {
                    roomID: true,
                    username: prevState.username
                }
            });
        }

        if (!isUserIdValid) {
            setIsError((prevState) => {
                return {
                    ...prevState,
                    username: true,
                }
            });
        }
    }

    const roomIdValidation = (): boolean => {
        return !(roomId === "");
    }
    const userIdValidation = (): boolean => {
        return !(username === '');
    }

    useEffect(() => {
        const username = playerCtx.name;
        const roomId = playerCtx.roomId;
        setRoomId(roomId);
        setUsername(username);
    }, [])


    return (
        <div className={classes['join-room']}>
            <label>Username</label>
            <input
                value={username}
                onChange={(e) => { setUsername(e.target.value) }}
                className={classes['customTextField']}
                onFocus={() => setIsError((prev) => {
                    return {
                        ...prev,
                        username: false
                    }
                })}
            />
            <p className={`${classes.errorText} ${isError.username ? classes.error : ''}`}>Username cannot be empty</p>
            <label>RoomId</label>
            <input
                value={roomId}
                onChange={(e) => { setRoomId(e.target.value) }}
                className={classes['customTextField']}
                onKeyDown={onJoinRoombyEnter}
                onFocus={() => setIsError(() => {
                    return {
                        username: false,
                        roomID: false
                    }
                })}
            />
            <p className={`${classes.errorText} ${isError.roomID ? classes.error : ''}`}>RoomId cannot be empty</p>
            <div className={classes['button-container']}>
                <button onClick={onJoinRoombyClick} className={classes['button-grp']} >
                    <p>Next</p>
                    <div className={classes.rightArrow}><img src="https://img.icons8.com/sf-black-filled/64/000000/long-arrow-right.png" alt="long-arrow-right" /></div>
                </button>
            </div>
        </div>
    )
}

export default JoinRoomComponent