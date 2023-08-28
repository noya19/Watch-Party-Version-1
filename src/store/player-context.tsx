/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Ref } from "react";

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
    allMessages: any[]
    isUploading: boolean
    hasUploaded: boolean
    videoUrl: string
    avatarUrl: string
    divRef: any
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

const playerContext = React.createContext<playerContextType>({
    isHost: false,
    roomId: "",
    myId: "",
    name: "",
    allMessages: [],
    hasUploaded: false,
    isUploading: false,
    avatarUrl: "",
    videoUrl: "",
    divRef: null,
    currentTime: 0,
    confirmIsHost: () => { },
    confirmRoomId: () => { },
    confirmMyId: () => { },
    confirmName: () => { },
    updateMessages: () => { },
    changeIsUploading: () => { },
    changehasUploaded: () => { },
    changeAvatarUrl: () => { },
    changeVideoUrl: () => { },
    changeCurrentTime: () => { }
});

export default playerContext;