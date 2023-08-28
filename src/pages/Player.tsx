import React, { useEffect, useRef, MutableRefObject, useContext, useState } from "react";
import playerContext from "../store/player-context";
import classes from "./player.module.css";
import { socket } from '../utils/utils';
import ChatComponent from "../components/ChatComponent";
import Console from "../components/Console";
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@mui/material';
import "react-toastify/dist/ReactToastify.css";
import { Reactions } from "../utils/emojis";
import './player.css';



type Message = {
    id: string,
    msg: string,
    name: string
    time: string
}

type info = {
    roomId?: string,
    myId: string
    name: string
    hasUploaded: boolean
    videoUrl: string
}

type controls = 'play' | 'pause' | 'seeked' | 'sync';

let timer: any;

const Player: React.FC = () => {
    const [emojiArray, setEmojiArray] = useState<{ id: string; element: JSX.Element }[]>([]);
    const playerCtx = useContext(playerContext);

    const videoRef = useRef() as MutableRefObject<HTMLVideoElement>;
    const valuesRef = useRef<{ isHost: boolean, myId: string, roomId: string }>();

    valuesRef.current = { isHost: playerCtx.isHost, roomId: playerCtx.roomId, myId: playerCtx.myId }


    // This will run only the first time the component is mounted,
    // hence we can call the socket client here. 
    useEffect(() => {
        socket.connect();

        //check if it is a host or not
        if (playerCtx.isHost) {
            socket.emit("host", playerCtx.name);
        } else {
            socket.emit("newUser", { name: playerCtx.name, roomId: playerCtx.roomId });
        }

        //----register all the events.

        socket.on('info', (value: info) => {
            if (value.roomId) {
                playerCtx.confirmRoomId(value.roomId);
            }
            playerCtx.confirmMyId(value.myId);
            if (value.hasUploaded) {
                playerCtx.changehasUploaded(true);
                playerCtx.changeVideoUrl(value.videoUrl)
            }
            // setName(value.name); This will already be set in global state.
        })

        socket.on('engageRequest', (msg: { name: string, action: controls }) => {
            activateToast(msg);
        })

        socket.on('updateUser', () => {
            playerCtx.confirmIsHost(true);
        })

        socket.on('play_video', (data) => {
            console.log("play_video");
            videoRef.current.play();
        })

        socket.on('pause_video', (data) => {
            console.log("pause_video");
            videoRef.current.pause();
        })

        socket.on('seek_video', (data) => {
            console.log("seek_video");
            if (videoRef.current) videoRef.current.currentTime = data.seekedTo;
        })

        socket.on('uploadHasStarted', () => {
            console.log("uploading started")
            playerCtx.changeIsUploading(true);
        })

        socket.on('uploadHasEnded', (data) => {
            console.log("uploading ended")
            playerCtx.changeVideoUrl(data.videoUrl);

            playerCtx.changeIsUploading(false);
            playerCtx.changehasUploaded(true);
        })

        socket.on('reactionEventFromServer', (data) => {
            console.log("Hellooo", data)
            ReactionFloating(data.emojiId);
        })

        return () => {
            // de-register all events on component un-mount.
            socket.off("info");
            socket.off("message");
            socket.off("engageRequest");
            socket.off("play_video");
            socket.off("pause_video");
            socket.off("updateUser");
            socket.off("uploadHasStarted");
            socket.off("uploadHasEnded");
            socket.off("reactionEventFromServer");
            endBroadCastingCurrentTime();
            socket.emit("disconnectMe", valuesRef.current)
        }
    }, [])


    useEffect(() => {
        const timer = setTimeout(() => {
            setEmojiArray(() => {
                return [];
            });
        }, 5000);
        return () => {
            clearTimeout(timer);
        };
    }, [emojiArray]);


    function ReactionFloating(emojiId: number) {
        //1. get the div of the parent element
        const totalWidth = playerCtx.divRef?.current.offsetWidth;

        //2.Create a new Emoji Element.
        const randomSpawnLocation = Math.floor(Math.random() * (totalWidth - 2));
        const emoji = {
            id: window.crypto.randomUUID(),
            element: (
                <div
                    style={{
                        position: "absolute",
                        bottom: "0",
                        left: `${randomSpawnLocation}px`,
                        opacity: 0,
                    }}
                    key={window.crypto.randomUUID()}
                    className={classes.floatUp}
                >
                    {Reactions[emojiId].emoji}
                </div>
            ),
        };

        //3. Add emoji to the emoji Array.
        setEmojiArray((prev) => {
            return [...prev, emoji];
        });


        //4. transmit message to others.
        socket.emit('reactionEventFromClient', { emojiId: emojiId, roomId: playerCtx.roomId })
    }

    function transmitMessage(msg: Message) {
        socket.emit("message", { msg, roomId: playerCtx.roomId })
    }

    const requestControl = (action: controls) => {
        socket.emit("request", {
            roomId: playerCtx.roomId,
            action,
            name: playerCtx.name
        });
    }

    function broadCastControls(action: controls, context?: any, vidRef?: any, isRequest?: boolean, time?: number) {
        switch (action) {
            case 'play':
                startBroadCastingCurrentTime(context, vidRef);
                if (isRequest) {
                    vidRef.current.play();
                }
                socket.emit('play', { roomId: context ? context.roomId : playerCtx.roomId });
                break;
            case 'pause':
                endBroadCastingCurrentTime();
                if (isRequest) {
                    vidRef.current.pause();
                }
                socket.emit('pause', { roomId: context ? context.roomId : playerCtx.roomId });
                break;
            case 'seeked':
                if (isRequest) {
                    // seek itself to the time (this is automatically trigger a broadcast.)
                    vidRef.current.currentTime = time;
                    console.log(time);
                }
                else {
                    socket.emit('seeked', {
                        roomId: playerCtx.roomId,
                        seekedTo: videoRef.current.currentTime
                    });
                }
                break;
            // This is for non-admin user
            case 'sync':
                socket.emit('sync', {
                    roomId: context ? context.roomId : playerCtx.roomId
                });
                break;
        }
    }

    function startBroadCastingCurrentTime(context?: any, vidRef?: any) {
        timer = setInterval(() => {
            socket.emit('currentTime', {
                roomId: context ? context.roomId : playerCtx.roomId,
                time: vidRef ? vidRef.current.currentTime : videoRef.current.currentTime
            })
            if (vidRef) playerCtx.changeCurrentTime(videoRef.current.currentTime);
        }, 1000);
    }

    function endBroadCastingCurrentTime() {
        clearInterval(timer);
    }

    function uploadingHasStarted() {
        playerCtx.changeIsUploading(true);
        socket.emit('uploadingStarted', { roomId: playerCtx.roomId })
    }

    function uploadingHasEnded(fileName: string) {
        // playerCtx.changeIsUploading(false);
        // playerCtx.changehasUploaded(true);
        socket.emit('uploadingEnded', { roomId: playerCtx.roomId, fileName: fileName })
    }


    type args = {
        props: any,
        toastProps?: any
    }

    const CustomToast = (args: args) => {
        const plctx = useContext(playerContext);
        const vidRef = videoRef;
        const action = args.props.action.split(" ")[0];
        let time;
        if (action === 'skip') {
            time = format(Number(args.props.action.split(" ")[1]));
        }

        return (
            <div className={classes.myToast}>
                <h4>{`${args.props.name} has requested to ${action === 'skip' ? action + ' ' + time : args.props.action}`}</h4>
                <div>
                    <Button onClick={() => {
                        const arr = args.props.action.split(" ");
                        if (arr[0] === 'skip')
                            broadCastControls('seeked', plctx, vidRef, true, Number.parseInt(arr[1]));
                        else
                            broadCastControls(args.props.action, plctx, vidRef, true)
                        args.toastProps.closeToast();
                    }}><img src="https://img.icons8.com/fluency/48/checkmark--v1.png" alt="checkmark--v1" /></Button>
                    <Button onClick={args.toastProps?.closeToast}>
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAECElEQVR4nO2Y21IaWRiFeYB4B2JLBLRBGwwedqONCgooB+UghxiNOjd5APVu5jmnOCggSIhBoHezUXByYdWe6gsMM1H7QKMzVayq727/618L7YbaKtVQQw011P9G7aM4gb9ERwblj79ER/gdAzH/cZw8uf8t+fDX8Ue2c5xklPbvHCcZ3pvf8eNo71RZ86P42f1hAnfpfI63Okdxh2L+hzH6/jDB9e64/5z4Qxnzg92zzkEM/8J+rNX51H+JzmGM7uzHuKd2tPdj/ZW424uetj9F8fNEUOcgKvvfqXMQZXiPl3bc7UVPZJm34wHiNhl6uPsYxi+SDKNWckdyCX7mLhlGQv58hvbezpjkAo1odOQ2sc3eJnawIPEdSSX4s/zMrRjvxDZb29t4p5KjZjwAWrtB2IoFsSC7QdSKBwWfCRTz061YgFPS80U1wwHQjPggivixIGE/akW2nl2IQn4aRXycEl6SS3ChLdgM+bAIEBv8dTEfngttcf149KVmwAvgthdy25tYGO8/AqCQh4bBTU7OrKKqB7yADbghDHiwEGzAjdjghqPh99Cs38NJmVENUqzPzTR864j1bWAh+HNSzrI+t+I/UZ5U3esCda8LNjZdWAnqXidi3c7XCd9bouZeg3XPGu6HmnsNVV87/GMJlwPU1ldgbX0Fy+HGtYKqTuZtwnd17XKAG+cyvHEyWArVNebtw3d17aBBddUOq6tLWAzfV5dQ1Un/N8Lz+s4A+pqxc9cOOxYJqiyDwb4upYT/tgS4b8sAS2Px7UuUAaAr9gWuYl/A8phHFfBGJcrARn9dnOO+Ls7hvliwoQqwvW6Jss1Gl+dnufL8B6wIc7OoZHulEsU5C3P1wYqubFYsCH9OwtninGWwb6ayjaKL1hmuNEthQawUKloszBVFgeLsDBQ7U6KowfwlChRFX1JmrmiZxiJARYv58dO8okhwSZmh2NkSZVK2RIEi6cK0ibucMWERoKL5Z/iu8hQJCtMkFOtRUqpEgSTpvJnkCmYSC5E3k+jiifCPJUgS5E0kFOuVM/VZgg+fm5rk8lOTWIjclBFdGI2CD2Ge1IP81CQU65kzGOSVyM7MjOSMBjZnNGAhLgx6UeG74s/yMzkR3jmDoZGyaqRfq2T0euJcP/FwoZ/AL3E+8R5d6HSSX3/8zDk/K+Svn3hIGQzSL7Z4ZXW6k/P3OvwcWd24rPC9JbK6cfTyDl1/N9UZgjjLjhP432QIAqV12r6/eDIEAbLEGHxmhzI31Bli9CwzpsVd0mNalNb2H763REY7Cnt3ZLTa31VKKq1Wn6Y0moeUWt1QMnxXvGdKrWb5HWm1Wt6NtJD+HB3VpjQy3ggildJo3qU0GnkP7FBDDTWU6i30N4TdCC3jWDERAAAAAElFTkSuQmCC" />
                    </Button>
                </div>
            </div >
        );
    }

    const leadingZerosFormatter = new Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    })

    function format(time: number): string {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60) % 60;
        const hours = Math.floor(time / 3600);
        if (hours === 0) {
            return `${minutes}:${leadingZerosFormatter.format(seconds)}`
        } else {
            return `${hours}:${leadingZerosFormatter.format(minutes)}:${leadingZerosFormatter.format(seconds)}`
        }
    }

    const activateToast = (msg: { name: string, action: controls }) => {
        toast.info(<CustomToast props={msg} />);
    };


    return (
        <div className={classes.mainContainer}>
            <div className={classes.player}>
                <Console
                    requestControl={requestControl}
                    broadCast={broadCastControls}
                    // newUser={emitOnNewUser}
                    ref={videoRef}
                    uploadStart={uploadingHasStarted}
                    uploadEnded={uploadingHasEnded}
                    emojiArray={emojiArray}
                />
                <ChatComponent
                    transmit={transmitMessage}
                    floatingReaction={ReactionFloating}
                />
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover={false}
                    theme="dark"
                />
            </div>

        </div>
    )
}

export default Player