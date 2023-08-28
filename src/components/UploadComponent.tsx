import React, { MutableRefObject, useContext, useRef, useState } from 'react';
import { Button } from '@mui/material';
import ProgressBar from '@ramonak/react-progress-bar';

import classes from './uploadComponent.module.css'
import UploadIcon from '@mui/icons-material/Upload';
import playerContext from '../store/player-context';

interface props {
    uploadStart: () => void
    uploadEnd: (fileName: string) => void
}

const UploadComponent: React.FC<props> = (props) => {
    const playerCtx = useContext(playerContext);
    const [uploadPercent, setUploadPercent] = useState<number>(0)
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [fNameIsSet, setFNameIsSet] = useState<boolean>(false)
    const [fileName, setFileName] = useState<string>("");
    const inputTypeRef = useRef() as MutableRefObject<HTMLInputElement>;


    function ChooseContent() {
        inputTypeRef.current.click();
    }

    function updateName() {
        if (inputTypeRef.current.files) setFileName(inputTypeRef.current.files[0].name)
        setFNameIsSet(true);
    }

    function uploadMovie() {
        setIsUploading(true);
        if (inputTypeRef.current.files) {
            // Emit that uploading has started.
            props.uploadStart();


            // client API available to allow the user to select a File from his system.
            const fileReader = new FileReader();
            const theFile = inputTypeRef.current.files[0];

            // read the file as an array of bytes.
            fileReader.readAsArrayBuffer(theFile);

            // onload is triggered when the file loading from the device to the
            // chrome buffer is successful
            fileReader.onload = async (ev: ProgressEvent<FileReader>) => {
                console.log('File loaded successfully');

                const CHUNK_SIZE = 1000000; // 1 MB
                const totalChunksAvailable = ev.total / CHUNK_SIZE;

                // create a unique filename to identify the chunks for the same file.
                const fileName = playerCtx.roomId + "_" + theFile.name;

                for (let chunkId = 0; chunkId < totalChunksAvailable; chunkId++) {
                    const start = chunkId * CHUNK_SIZE;
                    const end = Math.min(chunkId * CHUNK_SIZE + CHUNK_SIZE, ev.total);
                    const chunk = ev.target?.result?.slice(start, end) as unknown as ArrayBuffer
                    const res = await fetch('http://localhost:3000/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Length': `${chunk.byteLength}`,
                            'file-name': fileName,
                        },
                        body: chunk,
                    });
                    console.log(res.statusText);
                    const percent = Math.round((end * 100) / ev.total);
                    setUploadPercent(percent);

                    //UpdateFileName
                    playerCtx.changeVideoUrl(fileName);
                }

                //Emit that uploading has ended
                props.uploadEnd(fileName);
            }

            //emit an event to the server to let the server know that the upload is
            //complete.
        }
    }


    return (
        <div className={classes.uploadContainer}>
            {playerCtx.isHost &&
                <>
                    <div className={`${classes.uploadFileSelect} ${fNameIsSet ? classes.hide : ""}`}>
                        <button onClick={ChooseContent} className={classes.uploadButton}>
                            <div className={classes.upArrow}><img src="https://img.icons8.com/ios-filled/26/00000/long-arrow-up.png" alt="long-arrow-up" /></div>
                            <p>Upload</p>
                        </button>
                        <input ref={inputTypeRef} type='file' accept='video/mp4' onChange={updateName} hidden></input>
                        <p>Upload your favourite Movie 🎥 and get the party started.</p>
                    </div>
                    {fNameIsSet && !isUploading &&
                        <div className={classes.afterFileSelect}>
                            <p>{fileName}</p>
                            <Button variant='contained' onClick={uploadMovie}><UploadIcon /></Button>
                        </div>
                    }
                    {isUploading &&
                        <div className={classes.uploadingFile}>
                            <ProgressBar completed={uploadPercent} maxCompleted={100} width='300px' />
                        </div>
                    }
                </>
            }
            {!playerCtx.isHost && !playerCtx.hasUploaded && // Youre a normal user, and host hasn't uploaded anything
                <p>Your host has not uploaded anything yet  </p>
            }
            {!playerCtx.isHost && playerCtx.isUploading &&                     // You're a normal user, and the host is uploading.
                <p>Host is uploading!!</p>
            }
        </div>
    )
}

export default UploadComponent