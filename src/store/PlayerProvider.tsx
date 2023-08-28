import React, { useState, useEffect, useRef, MutableRefObject, Ref } from 'react';
import playerContext from './player-context';
import { socket } from '../utils/utils';

type Message = {
    id: string,
    msg: string,
    name: string
    time: string
}

type playerContextType = {
    isHost: boolean,
    roomId: string,
    myId: string,
    name: string,
    allMessages: any[],
    isUploading: boolean,
    hasUploaded: boolean,
    avatarUrl: string,
    videoUrl: string,
    divRef: Ref<HTMLDivElement>
    currentTime: number
    confirmIsHost: (value: boolean) => void,
    confirmRoomId: (value: string) => void,
    confirmMyId: (value: string) => void,
    confirmName: (value: string) => void,
    updateMessages: (value: Message) => void
    changeIsUploading: (value: boolean) => void
    changehasUploaded: (value: boolean) => void
    changeAvatarUrl: (value: string) => void
    changeVideoUrl: (value: string) => void
    changeCurrentTime: (value: number) => void
}

const PlayerProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [isHost, setIsHost] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [myId, setMyId] = useState("");
    const [name, setName] = useState("")
    const [allMessages, setAllMessages] = useState(Array<any>);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [hasUploaded, setHasUploaded] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [currentTime, setCurrentTime] = useState(0);
    const divRef = useRef() as MutableRefObject<HTMLDivElement>

    const confirmIsHost = (value: boolean) => { setIsHost(value) }
    const confirmRoomId = (value: string) => { setRoomId(value) }
    const confirmMyId = (value: string) => { setMyId(value) }
    const confirmName = (value: string) => { setName(value) }
    const updateMessages = (value: Message) => {
        let lastValue: Message;
        // At least one msg is present in array
        if (allMessages.length > 0) {
            const isArray: boolean = Array.isArray(allMessages[allMessages.length - 1]);
            lastValue = isArray ? allMessages[allMessages.length - 1][0] : allMessages[allMessages.length - 1];
            if (isArray && lastValue.id === value.id) {
                setAllMessages((prev) => {
                    prev[prev.length - 1].push(value)
                    return [...prev];
                })

            } else if (!isArray && lastValue.id === value.id) {
                setAllMessages((prev) => {
                    return [...prev.slice(0, -1), [lastValue, value]]
                })
            }
            else {
                setAllMessages((prev) => {
                    return [...prev, value]
                })
            }
        } else { // no messages were present, push directly.
            setAllMessages((prev) => {
                return [...prev, value];
            })
        }
    }
    const changeIsUploading = (value: boolean) => { setIsUploading(value) }
    const changehasUploaded = (value: boolean) => { setHasUploaded(value) }
    const changeAvatarUrl = (value: string) => { setAvatarUrl(value) }
    const changeVideoUrl = (value: string) => { setVideoUrl(value) }
    const changeCurrentTime = (value: number) => { setCurrentTime(value) }

    useEffect(() => {
        //when receiving messages
        socket.on('message', updateMessages)
        return () => {
            socket.off('message', updateMessages)
        }
    }, [allMessages])

    const contextValue: playerContextType = {
        isHost: isHost,
        roomId: roomId,
        myId: myId,
        name: name,
        allMessages: allMessages,
        isUploading: isUploading,
        hasUploaded: hasUploaded,
        avatarUrl: avatarUrl,
        videoUrl: videoUrl,
        divRef: divRef,
        currentTime: currentTime,
        confirmIsHost,
        confirmRoomId,
        confirmMyId,
        confirmName,
        updateMessages,
        changeIsUploading,
        changehasUploaded,
        changeAvatarUrl,
        changeVideoUrl,
        changeCurrentTime
    }

    return (
        <playerContext.Provider value={contextValue}>
            {props.children}
        </playerContext.Provider >
    )
}

export default PlayerProvider