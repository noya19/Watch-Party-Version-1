import React, { useState, useRef, useContext } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { Button, TextField } from '@mui/material';
import { Reactions } from '../utils/emojis';


import classes from './chatcomponent.module.css';
import ChatChips from './ChatChips';
import ReactDOM from 'react-dom';
import playerContext from '../store/player-context';

type Message = {
    id: string,
    msg: string,
    name: string,
    avatar: string,
    time: string
}

const ChatComponent: React.FC<{
    transmit: (msg: Message) => void
    floatingReaction: (emojiId: number) => void
}> = (props) => {

    const playerCtx = useContext(playerContext);
    const [isError, setIsError] = useState(false);
    const [msg, setMessage] = useState("");
    const divRef = useRef<HTMLDivElement>(null);

    const onSend = () => {
        if (!isMessageCorrect()) {
            setIsError(true);
            return;
        }
        props.transmit({
            id: playerCtx.myId,
            msg: msg,
            name: playerCtx.name,
            avatar: playerCtx.avatarUrl,
            time: new Date().toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false })
        });
        scrollToDivRef();
        setMessage("");
    };

    const isMessageCorrect = () => {
        return msg !== ""
    }

    const scrollToDivRef = () => {
        const node = ReactDOM.findDOMNode(divRef.current) as Element;
        node.scrollIntoView({ block: "end", behavior: "smooth" });
    }

    return (
        <>
            <div className={classes.chat}>
                <div className={classes.displayMessage}>
                    {
                        playerCtx.allMessages.map((el, idx) => {
                            if (Array.isArray(el)) {
                                return <ChatChips
                                    key={idx}
                                    id={el[0].id}
                                    name={el[0].name}
                                    currentUser={playerCtx.myId}
                                    avatar={el[0].avatar}
                                    groupMessages={el}
                                />
                            } else {
                                return <ChatChips
                                    key={idx}
                                    id={el.id}
                                    currentUser={playerCtx.myId}
                                    name={el.name}
                                    msg={el.msg}
                                    time={el.time}
                                    avatar={el.avatar}
                                />
                            }
                        })
                    }
                    <div ref={divRef} ></div>
                </div>
                <div className={classes.emojiPanel}>
                    {Reactions.map((cur) => {
                        return <button key={cur.id} onClick={() => {
                            props.floatingReaction(cur.id)
                        }}>
                            {cur.emoji}
                        </button>;
                    })}
                </div>
                <div className={classes.sendMessage}>
                    <TextField
                        onChange={(e) => { setMessage(e.target.value) }}
                        value={msg}
                        error={isError}
                        onFocus={(e) => {
                            console.log(e);
                            setIsError(false)
                        }}
                        helperText={isError ? "Message Cannot be Empty" : ""}
                        fullWidth
                        sx={{
                            "& .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {
                                color: "white",
                                fontSize: "1.7rem"
                            },
                            "& .css-1d3z3hw-MuiOutlinedInput-notchedOutline": {
                                border: "none"
                            },
                        }}


                    />
                    <Button
                        variant="outlined"
                        onClick={onSend}
                        className={classes.send}
                        sx={{
                            border: "none",
                            "&:hover": {
                                border: 'none',
                                background: 'none'
                            }
                        }}
                    >{<SendIcon />}</Button>
                </div>
            </div>
        </>
    )
}

export default ChatComponent