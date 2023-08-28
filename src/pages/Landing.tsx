import React, { useState, useRef, useContext, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';

import classes from './landing.module.css';
import './transitionStyles.css'



import ModalComponent from '../components/ModalComponent';
import CreateRoomComponent from '../components/JoinOrCreateRoom/CreateRoomComponent';
import JoinRoomComponent from '../components/JoinOrCreateRoom/JoinRoomComponent';
import AvatarComponent from '../components/JoinOrCreateRoom/AvatarComponent';
import playerContext from '../store/player-context';


import inter1 from '../assets/LandingPage/interstellar.jpg';
import oppen1 from '../assets/LandingPage/Oppenheimer.jpg';
import jedi1 from '../assets/LandingPage/JEDI.jpeg';


const words = ["Communicate", "Share", "Rejoice"];

const Landing: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [word, setWord] = useState(0);
    const [show, setShow] = useState({ isCreate: false, isJoin: false, isAvatar: false })
    const playerCtx = useContext(playerContext);
    const prevModal = useRef<{ isCreate: boolean, isJoin: boolean, isAvatar: boolean }>({
        isCreate: false,
        isJoin: false,
        isAvatar: false
    });

    /*Variable for Timer Functions*/
    const time = useRef<number>(Date.now());
    const currentTime = useRef<number>()
    const timerRef = useRef<number>(-1);

    const handleOpen = (isCreate: boolean) => {
        setOpen(true);
        if (isCreate) {
            setShow((prev) => {
                return {
                    ...prev,
                    isCreate: true
                }

            })
            prevModal.current = {
                isAvatar: false,
                isCreate: true,
                isJoin: false
            };
        } else {
            setShow((prev) => {
                return {
                    ...prev,
                    isJoin: true
                }

            })
            prevModal.current = {
                isAvatar: false,
                isCreate: false,
                isJoin: true
            }
        }
    }

    const handleCloseModal = () => {
        setOpen(false);
        setShow({
            isCreate: false,
            isJoin: false,
            isAvatar: false
        })

        // Reset name and roomID global State to default
        playerCtx.confirmName("");
        playerCtx.confirmRoomId("");
    }

    const handleClose = () => {
        //Close the Room Window
        setShow({
            isCreate: false,
            isJoin: false,
            isAvatar: true
        })

    }

    const handlePrev = () => {
        if (prevModal.current.isCreate) {
            setShow((prev) => {
                return {
                    ...prev,
                    isCreate: true,
                    isAvatar: false
                }
            })
        } else if (prevModal.current.isJoin) {
            setShow((prev) => {
                return {
                    ...prev,
                    isJoin: true,
                    isAvatar: false
                }
            })
        }
    }


    function changeWord() {
        currentTime.current = Date.now();
        if (currentTime.current - time.current >= 5000) {
            setWord((prev) => {
                return (prev + 1) % 3;
            })
            time.current = Date.now();
        }
        timerRef.current = window.requestAnimationFrame(changeWord);
    }

    useEffect(() => {
        timerRef.current = window.requestAnimationFrame(changeWord);
        return () => {
            window.cancelAnimationFrame(timerRef.current)
        }
    }, [])

    return (
        <div className={classes['main-section']}>
            <div className={classes['left-section']}>
                <a className={classes['tutorial-alert']} href='https://youtu.be/AqJf7zlgarI' target='_blank'>
                    <span className={classes['tutorial-icon']}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"> <circle cx="10" cy="10" r="10" fill="#FFFFFF"></circle> <g clipPath="url(#clip0_1345_66711)"> <path d="M13.5 7.66675C13.5 6.73849 13.1313 5.84825 12.4749 5.19187C11.8185 4.5355 10.9283 4.16675 10 4.16675C9.07174 4.16675 8.1815 4.5355 7.52513 5.19187C6.86875 5.84825 6.5 6.73849 6.5 7.66675C6.5 11.7501 4.75 12.9167 4.75 12.9167H15.25C15.25 12.9167 13.5 11.7501 13.5 7.66675Z" stroke="#00031F" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M11.0091 15.2501C10.9065 15.4269 10.7593 15.5737 10.5822 15.6757C10.4051 15.7777 10.2043 15.8314 9.99989 15.8314C9.7955 15.8314 9.5947 15.7777 9.41759 15.6757C9.24048 15.5737 9.09328 15.4269 8.99072 15.2501" stroke="#00031F" strokeLinecap="round" strokeLinejoin="round"></path> </g> <defs> <clipPath id="clip0_1345_66711"> <rect width="14" height="14" fill="white" transform="translate(2.99976 3.00009)"></rect> </clipPath> </defs> </svg>
                    </span >
                    <span className={classes['tutorial-text']}>Watch the comprehensive tutorial about our platform</span>
                    <span>|</span>
                    <span className={classes['tutorial-click']}>
                        Watch Now <img width="26" height="26" src="https://img.icons8.com/ios/50/FFFFFF/forward--v1.png" alt="forward" />
                    </span>
                </a>
                <div className={classes['slider-container']}>
                    <div className={classes['slider']}>
                        <div className={classes['progress']}></div>
                    </div>
                </div>
                <div className={classes['happy-text']}>
                    <h1>One Platform to
                        <span className={classes['changing-word']}>
                            {words.map((cur, idx) => {
                                return <p key={idx} className={word === idx ? classes['show'] : classes['hide']}>{`${cur}.`}</p>
                            })}
                        </span>
                    </h1>
                    <h3>Watch together, anywhere, anytime - Uniting global audiences in cinema delight !</h3>
                    <div className={classes['happy-btn']}>
                        <button onClick={handleOpen.bind(null, true)} className={classes['button-style']}>
                            <h4>Create Room</h4>
                            <div className={classes.rightArrow}><img src="https://img.icons8.com/dotty/80/room.png" alt="room" /></div>
                        </button>
                        <button onClick={handleOpen.bind(null, false)} className={classes['button-style']}>
                            <h4>Join Room</h4>
                            <div className={classes.rightArrow}><img src="https://img.icons8.com/sf-black-filled/64/FFFFFF/long-arrow-right.png" alt="long-arrow-right" /></div>
                        </button>
                    </div>
                </div>
            </div>
            <div className={classes['right-section']}>
                <img src={inter1} alt="" className={classes['right-img-1']} />
                <img src={jedi1} alt="" className={classes['right-img-2']} />
                <img src={oppen1} alt="" className={classes['right-img-3']} />
            </div>
            <ModalComponent open={open} onClose={handleCloseModal}>

                <div style={{
                    overflow: "hidden",
                    width: "30rem",
                    position: "relative",
                    borderRadius: "20px",
                    display: "flex"
                }}>
                    <CSSTransition
                        in={show.isCreate}
                        timeout={100}
                        classNames='createRoom'
                        unmountOnExit
                    >
                        <CreateRoomComponent handleClose={handleClose} />
                    </CSSTransition>
                    <CSSTransition
                        in={show.isJoin}
                        timeout={100}
                        classNames='joinRoom'
                        unmountOnExit
                    >
                        <JoinRoomComponent handleClose={handleClose} />
                    </CSSTransition>
                    <CSSTransition
                        in={show.isAvatar}
                        timeout={100}
                        classNames='avatarSelect'
                        unmountOnExit
                    >
                        <AvatarComponent handlePrev={handlePrev} />
                    </CSSTransition>
                </div>
            </ModalComponent>
        </div>
    )
}

export default Landing;