import React, { useState, useContext } from 'react'

import classes from './avatarComponent.module.css';
import cat from '../../assets/cat.png';
import chicken from '../../assets/chicken.png';
import meerkat from '../../assets/meerkat.png';
import horse from '../../assets/horse.png';
import rabbit from '../../assets/rabbit.png';
import owl from '../../assets/owl.png';
import panda from '../../assets/panda.png';
import penguin from '../../assets/penguin.png';
import { useNavigate } from 'react-router-dom';
import playerContext from '../../store/player-context';

const ICONS = [
    {
        id: 1,
        icon: cat
    },
    {
        id: 2,
        icon: chicken
    },
    {
        id: 3,
        icon: meerkat
    },
    {
        id: 4,
        icon: panda
    },
    {
        id: 5,
        icon: horse
    },
    {
        id: 6,
        icon: rabbit
    },
    {
        id: 7,
        icon: owl
    },
    {
        id: 8,
        icon: penguin
    }
]


const AvatarComponent: React.FC<{ handlePrev: () => void }> = (props) => {
    const [avatarId, setAvatarId] = useState<number>();
    const [isError, setIsError] = useState<boolean>(false);
    const playerCtx = useContext(playerContext);

    const navigate = useNavigate();

    function joinRoom() {
        // Is Avatar selected
        if (!avatarId) {
            setIsError(true);
            return;
        }

        // set Avatar
        playerCtx.changeAvatarUrl(ICONS[avatarId - 1].icon)
        navigate("/player");
    }

    return (
        <div className={classes["avatar-select"]}>
            {!isError && <p className={classes['headline']}>Choose your Avatar</p>}
            {isError && <p className={classes['error']}>Please select an Avatar</p>}
            <div className={classes["avatar-container"]}>
                {ICONS.map((cur) => {
                    return <img
                        src={cur.icon}
                        className={avatarId === cur.id ? classes['highlighted'] : ''}
                        key={cur.id}
                        alt=""
                        onClick={() => {
                            setAvatarId(cur.id);
                            setIsError(false);
                        }} />
                })}
            </div>
            <div className={classes['button-container']}>
                <button className={classes['button-grp']} onClick={props.handlePrev}>
                    <div className={classes.rightArrow}><img src="https://img.icons8.com/sf-black-filled/64/000000/long-arrow-left.png" alt="long-arrow-right" /></div>
                    <p>Prev</p>
                </button>
                <button className={classes['button-grp']} onClick={joinRoom}>
                    <p>Join</p>
                    <div className={classes.rightArrow} style={{ margin: "8px" }}><img src="https://img.icons8.com/ios-glyphs/30/query-inner-join-right.png" alt="query-inner-join-right" /></div>
                </button>
            </div>
        </div>
    )
}

export default AvatarComponent