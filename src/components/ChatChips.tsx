import React from 'react'
import classes from './chatChips.module.css';

const ChatChips: React.FC<{
    id: string,
    name?: string,
    msg?: string,
    time?: string,
    currentUser: string
    avatar: string
    groupMessages?: Array<{
        id: string,
        name: string,
        msg: string,
        time: string,
        currentUser: string
    }>
}> = (props) => {


    const groupMessages = () => {
        return (
            <div className={`${classes.groupMessageContainer} ${props.id === props.currentUser ? '' : classes.notMyGroupMessage}`}>
                <img src={props.avatar}></img>
                <div className={`${classes.info2} ${props.id === props.currentUser ? '' : classes.notMyInfo2}`}>
                    {
                        props.groupMessages?.map((el) => {
                            return <div className={`${classes.info1} ${props.id === props.currentUser ? '' : classes.notMyInfo1}`}>
                                <p className={classes.chats} key={el.time}>{el.msg}</p>
                                <p className={classes.time}>{el.time}</p>
                            </div>
                        })
                    }
                    <p className={classes.username}>{props.id === props.currentUser ? "Me" : props.name}</p>
                </div>
            </div>
        )
    }

    const singleMessages = () => {
        return (
            <div className={`${classes.singleMessageContainer} ${props.id === props.currentUser ? '' : classes.notMySingleMessage}`}>
                <p className={classes.time}>{props.time}</p>
                <div className={`${classes.singleInfo1} ${props.id === props.currentUser ? '' : classes.notMySingleInfo1} `}>
                    <p className={classes.chats} key={props.id}>{props.msg}</p>
                    <p className={classes.username}>{props.id === props.currentUser ? "Me" : props.name}</p>

                </div>
                <img src={props.avatar}></img>
            </div>
        )
    }

    return (
        <div className={`${classes.message} `}>
            {props.groupMessages ? groupMessages() : singleMessages()}
        </div >
    )
}

export default ChatChips