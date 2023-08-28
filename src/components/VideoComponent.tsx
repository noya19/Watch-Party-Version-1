import { forwardRef, useState, useRef, useEffect, MutableRefObject, useContext } from 'react';
import classes from './videoComponent.module.css';
import { Box, Modal } from '@mui/material';
import playerContext from '../store/player-context';
import loader from '../assets/loader.gif';

interface Props {
    broadCast: (action: 'play' | 'pause' | 'seeked' | 'sync') => void
    // newUser: () => void
    request: (msg: any) => void
}

let previousTimeOfHover: 0;

const VideoComponent = forwardRef<HTMLVideoElement, Props>((props, vidRef) => {
    const playerCtx = useContext(playerContext);
    const [open, setIsOpen] = useState(false);
    const [streamingUrl, setStreamingURL] = useState(`http://localhost:3000/streaming/${playerCtx.videoUrl}`);
    const [playing, setIsPlaying] = useState({
        isPlaying: false,
        wasPlaying: false,
    });
    const [openQualityMenu, setOpenQualityMenu] = useState(false);
    const [qualitySelected, setQualitySelected] = useState({
        "720p": true,
        "360p": false,
        "144p": false,
    })
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isMiniPlayer, setIsMiniPlayer] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState(`http://localhost:3000/resources/${playerCtx.videoUrl.replace(".mp4", '')}_1.jpeg`);
    const videoContainer = useRef() as MutableRefObject<HTMLDivElement>;
    const volumeSlider = useRef() as MutableRefObject<HTMLInputElement>;
    const currentTime = useRef() as MutableRefObject<HTMLDivElement>;
    const TotalTime = useRef() as MutableRefObject<HTMLDivElement>;
    // const playBackSpeed = useRef() as MutableRefObject<HTMLButtonElement>;
    const timelineContainer = useRef() as MutableRefObject<HTMLDivElement>;
    const isScrubbing = useRef() as MutableRefObject<boolean>;
    const videoRef = vidRef as unknown as MutableRefObject<HTMLVideoElement>;




    useEffect(() => {
        if (!playerCtx.isHost) {
            setIsOpen(true);
            //Close this when the video starts playing or if it is paused close after 4 secs.
            setTimeout(() => {
                setIsOpen(false);
            }, 4000);
        }
        window.addEventListener("keydown", onKeyPress)

        return () => {
            window.removeEventListener('keydown', onKeyPress)
        }

    }, [])

    useEffect(() => {
        window.addEventListener("mouseup", checkScrubbing)
        window.addEventListener("mousemove", checkIsMoving)

        return () => {
            window.removeEventListener('mouseup', checkScrubbing)
            window.removeEventListener('mousemove', checkIsMoving)
        }
    }, [playing])

    const checkScrubbing = (e: any) => {
        if (isScrubbing.current) toggleScrubbing(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>)
    }

    const checkIsMoving = (e: any) => {
        if (isScrubbing.current) toggleScrubbing(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>)
    }

    function toggleTheaterMode() {
        setIsTheaterMode((prev) => {
            return !prev;
        })
    }

    function toggleFullScreen() {
        if (document.fullscreenElement === null) {
            videoContainer.current?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            setIsFullScreen(false);
            document.exitFullscreen();
        }

    }

    function toggleMiniPlayer() {
        if (videoContainer.current?.classList.contains("mini-player")) {
            setIsMiniPlayer(false);
            document.exitPictureInPicture();
        } else {
            videoRef.current?.requestPictureInPicture();
            setIsMiniPlayer(true);
        }
    }

    function togglePlay() {
        setIsPlaying((prev) => {
            return { isPlaying: !prev.isPlaying, wasPlaying: prev.isPlaying };
        })
        videoRef.current?.paused ? playVideo() : pauseVideo();
    }

    function toggleMute() {
        videoRef.current.muted = !videoRef.current.muted;
    }

    // This is for slider
    function volumeInputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
        videoRef.current.volume = Number(e.target.value);
        const isMutedBySlider: boolean = e.target.value === "0";
        videoRef.current.muted = isMutedBySlider;
    }

    // This is event triggered by the videoElement
    function onVolumeChange() {
        volumeSlider.current.value = videoRef.current.volume.toString();
        let volumeLevel;
        if (videoRef.current.muted || videoRef.current.volume === 0) {
            volumeSlider.current.value = "0"
            volumeLevel = "muted";
        } else if (videoRef.current.volume > 0.5) {
            volumeLevel = "high";
        } else {
            volumeLevel = "low";
        }

        videoContainer.current.dataset.volumeLevel = volumeLevel;
    }

    function onKeyPress(ev: KeyboardEvent) {
        const tagName = document.activeElement?.tagName.toLowerCase();
        if (tagName === "input") return;
        switch (ev.key.toLowerCase()) {
            case " ":
            case "k":
                togglePlay();
                break;
            case "f":
                toggleFullScreen();
                break
            case "t":
                toggleTheaterMode();
                break;
            case "i":
                toggleMiniPlayer();
                break;
            case "m":
                toggleMute();
                break;
            case "arrowleft":
                skip(-1);
                break;
            case "arrowright":
                skip(1);
                break;
            case "Escape":
                setIsFullScreen(false);
                document.exitFullscreen();
                break;
            default:
            //do nothing  
        }
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

    function videoOnLoad() {
        TotalTime.current.textContent = format(videoRef.current.duration);
    }

    function onTimeUpdate() {
        currentTime.current.textContent = format(videoRef.current.currentTime);
        const percent = videoRef.current.currentTime / videoRef.current.duration;
        timelineContainer.current.style.setProperty("--progress-position", `${percent}`);
    }

    function skip(skipping: number) {
        videoRef.current.currentTime += skipping;
    }

    // function changePlayBackSpeed() {
    //     let newPlaybackRate = videoRef.current.playbackRate + 0.25;
    //     if (newPlaybackRate > 2) newPlaybackRate = 0.25;
    //     videoRef.current.playbackRate = newPlaybackRate;
    //     playBackSpeed.current.textContent = `${newPlaybackRate}x`;
    // }

    function toggleScrubbing(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const rect = timelineContainer.current.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
        isScrubbing.current = (e.buttons & 1) === 1;
        // On Scrubbing
        if (isScrubbing.current) {
            if (playerCtx.isHost) {
                videoRef.current.pause();
            }
        }
        // On Scrubbing End.
        else {
            if (playerCtx.isHost) {
                videoRef.current.currentTime = percent * videoRef.current.duration;
                //Now if the host is not playing, then after scrubbing don't play the video - else
                //play the video.
                console.log("Admin wasplaying", playing.wasPlaying);
                if (playing.wasPlaying) videoRef.current.play();
            } else {
                // send a request to the host to request to skip to that pt.
                props.request(`skip ${percent * videoRef.current.duration}`)
                // If before playing the non-admin user was playing the song, than continue playing
                // else don't play but update the pointer.
                if (playing.isPlaying) {
                    videoRef.current.play();
                } else {
                    const vidPercent = videoRef.current.currentTime / videoRef.current.duration;
                    timelineContainer.current.style.setProperty("--progress-position", `${vidPercent}`);
                }
            }
        }

        handleTimelineUpdate(e);
    }

    function handleTimelineUpdate(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        // console.log("handletimelineupdate")
        const rect = timelineContainer.current.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
        //get preview Image
        timelineContainer.current.style.setProperty("--preview-position", `${percent}`);
        if (isScrubbing.current) {
            e.preventDefault();
            timelineContainer.current.style.setProperty("--progress-position", `${percent}`);
        }

        // console.log("Hurraaayyy", percent * videoRef.current.duration);
        let timeofHover = Math.floor((percent * videoRef.current.duration) / 30);
        timeofHover = timeofHover === 0 ? 1 : timeofHover

        //if timeofHover is different that before that update
        if (timeofHover != previousTimeOfHover) {
            setPreviewImageUrl(`http://localhost:3000/resources/${playerCtx.videoUrl.replace(".mp4", '')}_${timeofHover}.jpeg`)
        }

    }


    // -----------------Utility Code--------------------------------//

    function playVideo() {
        if (playerCtx.isHost) {
            //1. Broadcast a message to play for all
            props.broadCast('play');
            videoRef.current?.play();
            return;
        }
        //2. else sync with other.
        props.broadCast('sync')
        // 3. wait for 2 secs by opening Modal.
        setIsOpen(true);
        setTimeout(() => {
            setIsOpen(false);
        }, 3000)


    }

    function pauseVideo() {
        if (playerCtx.isHost) {
            //1. Broadcast a message to pause for all
            props.broadCast('pause');
        }
        //2. Just pause for myself
        videoRef.current?.pause();
    }

    function seekVideo() {
        if (playerCtx.isHost) {
            //1. Seek for all
            props.broadCast('seeked');
        } else {
            //2. Send a request to the host to seek
            //3. Seek to ongoing time.
        }
    }

    function switchQuality(quality: string) {
        const baseName = playerCtx.videoUrl.replace(".mp4", "")
        setStreamingURL(`http://localhost:3000/streaming/${baseName}_${quality}.mp4?quality=${quality}`);
        //2. else sync with other.
        props.broadCast('sync')

        // 3. wait for 2 secs by opening Modal.
        setIsOpen(true);
        setTimeout(() => {
            setIsOpen(false);
        }, 3000)
    }

    return <>
        <div
            ref={videoContainer}
            data-volume-level="high"
            className={
                `
                ${classes.video_container} 
                ${playing.isPlaying ? "" : classes.paused}
                ${isTheaterMode ? classes.theater : ""}
                ${isFullScreen ? classes.full_screen : ""}
                ${isMiniPlayer ? classes.mini_player : ""}
                `}
        >
            <div className={classes.video_controls_container}>
                <div className={classes.timeline_container}
                    onMouseMove={(e) => { handleTimelineUpdate(e) }}
                    onMouseDown={(e) => { toggleScrubbing(e) }}
                    onMouseUp={(e) => { toggleScrubbing(e) }}
                    ref={timelineContainer}
                >
                    <div className={classes.timeline}
                    >
                        <img className={classes.preview_image} src={previewImageUrl} />
                        <div className={classes.thumb_indicator}></div>
                    </div>
                </div>
                <div className={classes.controls}>
                    <button className={classes.play_pause_btn}
                        onClick={togglePlay}

                    >
                        <svg className={classes.play_icon} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                        </svg>
                        <svg className={classes.pause_icon} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                        </svg>
                    </button>
                    <div className={classes.volume_container}>
                        <button className={classes.mute_btn}
                            onClick={toggleMute}>
                            <svg className={classes.volume_high_icon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                            </svg>
                            <svg className={classes.volume_low_icon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z" />
                            </svg>
                            <svg className={classes.volume_muted_icon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" />
                            </svg>
                        </button>
                        <input className={classes.volume_slider}
                            ref={volumeSlider}
                            type="range"
                            min={0}
                            max={1}
                            step={"any"}
                            onChange={(e) => { volumeInputChangeHandler(e) }}
                        ></input>
                    </div>
                    <div className={classes.duration_container}>
                        <div className={classes.current_time} ref={currentTime}>0:00</div>
                        /
                        <div className={classes.total_time} ref={TotalTime}></div>
                    </div>
                    {!playerCtx.isHost &&
                        <button
                            className={`${classes.settings}`}
                            onClick={() => {
                                setOpenQualityMenu((prev) => {
                                    return !prev;
                                })
                            }}
                        >
                            <img src="https://img.icons8.com/ios/50/FFFFFF/settings--v1.png" alt="settings--v1" className={openQualityMenu ? classes.rotateTransition : classes.reverseTransition} />
                            <div
                                className={`${classes.qualitySelect} ${openQualityMenu ? '' : classes.hideQualityMenu}`}
                                onBlur={() => { setOpenQualityMenu(false) }}
                            >
                                <div
                                    className={`${classes.qualitySelectOptions}`}
                                    onClick={() => {
                                        switchQuality("720p");
                                        setQualitySelected((prev) => {
                                            return {
                                                "720p": true,
                                                "360p": false,
                                                "144p": false
                                            }
                                        })
                                    }}
                                    onBlur={() => {
                                        setQualitySelected((prev) => {
                                            return {
                                                ...prev,
                                                "720p": false
                                            }
                                        })
                                    }}
                                >
                                    <img src="https://img.icons8.com/ios-glyphs/30/1A1A1A/checkmark--v1.png" alt="checkmark--v1" className={`${classes.tick} ${qualitySelected['720p'] ? classes.showTick : ''}`} />
                                    <label>720p</label>
                                </div>
                                <div className={`${classes.qualitySelectOptions}`}
                                    onClick={() => {
                                        switchQuality("360p")
                                        setQualitySelected((prev) => {
                                            return {
                                                "720p": false,
                                                "360p": true,
                                                "144p": false
                                            }
                                        })
                                    }}
                                    onBlur={() => {
                                        setQualitySelected((prev) => {
                                            return {
                                                ...prev,
                                                "360p": false
                                            }
                                        })
                                    }}>
                                    <img src="https://img.icons8.com/ios-glyphs/30/1A1A1A/checkmark--v1.png" alt="checkmark--v1" className={`${classes.tick} ${qualitySelected['360p'] ? classes.showTick : ''}`} />
                                    <label>360p</label>
                                </div>
                                <div className={`${classes.qualitySelectOptions}`}
                                    onClick={() => {
                                        switchQuality("144p")
                                        setQualitySelected((prev) => {
                                            return {
                                                "720p": false,
                                                "360p": false,
                                                "144p": true
                                            }
                                        })
                                    }}
                                    onBlur={() => {
                                        setQualitySelected((prev) => {
                                            return {
                                                ...prev,
                                                "144p": false
                                            }
                                        })
                                    }}
                                >
                                    <img src="https://img.icons8.com/ios-glyphs/30/1A1A1A/checkmark--v1.png" alt="checkmark--v1" className={`${classes.tick} ${qualitySelected['144p'] ? classes.showTick : ''}`} />
                                    <label>144p</label>
                                </div>
                            </div>
                        </button>}
                    <button className={classes.mini_player_btn}
                        onClick={toggleMiniPlayer}
                    >
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z" />
                        </svg>
                    </button>
                    <button className={classes.theater_btn}
                        onClick={toggleTheaterMode}>
                        <svg className={classes.tall} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" />
                        </svg>
                        <svg className={classes.wide} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z" />
                        </svg>
                    </button>
                    <button className={classes.full_screen_btn}
                        onClick={toggleFullScreen}
                    >
                        <svg className={classes.open} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                        <svg className={classes.close} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                        </svg>
                    </button>
                </div>
            </div>
            <video
                src={streamingUrl}
                ref={videoRef}
                onVolumeChange={onVolumeChange}
                onLoadedData={videoOnLoad}
                onTimeUpdate={onTimeUpdate}
                onSeeked={seekVideo}
                onPlay={() => {
                    if (open) {
                        setIsOpen(false);
                    }
                    setIsPlaying((prev) => {
                        return { isPlaying: true, wasPlaying: prev.isPlaying }
                    })
                }}
                onPause={() => {
                    setIsPlaying((prev) => {
                        return { isPlaying: false, wasPlaying: prev.isPlaying }
                    })
                }}
            ></video>
            <Modal
                open={open}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'transparent'
                }}>
                    <div className={classes.loader}>
                        <img src={loader}></img>
                        <p>Please wait while we sync you with others. . . .</p>
                    </div>
                </Box>
            </Modal>
        </div >
    </>



    // return (
    //     <div className={classes.consolePlayer}>
    //         <video
    //             src="http://localhost:3000/streaming"
    //             controls
    //             preload="auto"
    //             ref={ref}
    //             onPause={pauseVideo}
    //             onPlay={playVideo}
    //             onSeeked={seekVideo}
    //         ></video>

    //     </div >
    // )
})

export default VideoComponent