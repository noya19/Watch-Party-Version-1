import React, { MutableRefObject, forwardRef, useContext, useRef } from 'react';
import ConsoleHeader from './ConsoleHeader';
import VideoComponetn from './VideoComponent';
import classes from './console.module.css';
import UploadComponent from './UploadComponent';
import playerContext from '../store/player-context';

interface Props {
    requestControl: (msg: any) => void
    broadCast: (action: 'play' | 'pause' | 'seeked' | 'sync') => void
    // newUser: () => void
    uploadStart: () => void
    uploadEnded: (fileName: string) => void
    emojiArray: { id: string, element: JSX.Element }[]
}

const Console = forwardRef<HTMLVideoElement, Props>(
    (props, videoRef) => {
        const playerCtx = useContext(playerContext);
        const divRef = useRef() as MutableRefObject<HTMLDivElement>;
        playerCtx.divRef = divRef;

        return (
            <div className={classes.console} ref={divRef}>
                <ConsoleHeader
                    request={props.requestControl}
                />
                {!playerCtx.hasUploaded &&
                    <UploadComponent
                        uploadStart={props.uploadStart}
                        uploadEnd={props.uploadEnded}
                    />
                }
                {playerCtx.hasUploaded &&
                    <VideoComponetn
                        broadCast={props.broadCast}
                        ref={videoRef}
                        // newUser={props.newUser}
                        request={props.requestControl}
                    />
                }
                {props.emojiArray.map((cur) => {
                    return cur.element;
                })}
            </div>
        )
    })

export default Console;