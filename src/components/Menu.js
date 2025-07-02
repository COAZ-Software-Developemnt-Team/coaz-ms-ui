import React,{useState,useEffect,useRef,useContext} from 'react'
import { NavLink} from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { PiHouseSimple,PiList,PiSignIn} from "react-icons/pi";
import { Logo } from './CoazIcons';
import UserProfile from './UserProfile';
import MenuItem from './MenuItem';
import MsSearch from './Search';
import Scrollable from './Scrollable';

const Menu = ({user,menus,openMobileMenu,setOpenMobileMenu,onLogin,onLogout}) => {
    const {screenSize,setPopupData} = useContext(GlobalContext);
    const [expanded,setExpanded] = useState(true);
    const userProfileRef = useRef(null);
    const menuRef = useRef(null);

    const onMenu = (e) => {
        e.preventDefault();
        if(screenSize === 'xs') {
            setOpenMobileMenu(!openMobileMenu)
        } else {
            setExpanded(!expanded);
        }
    }

    useEffect(() => {
        setOpenMobileMenu && setOpenMobileMenu(false);
        if(screenSize === 'xs') {
            setExpanded(false);
        }
    },[menus]);

    return (
        <div style={{backdropFilter:'blur(20px)'}}
            ref={menuRef}
            className={`flex flex-col ${screenSize === 'xs'?'w-full':expanded?'w-60':'w-14'} h-fit sm:h-full py-4 space-y-1 overflow-hidden overflow-y-auto shrink-0 bg-[rgba(255,255,255,.2)]`}>
            <div className='flex flex-row w-full h-fit px-2 space-x-2 items-center overflow-hidden shrink-0'>
                <button onClick={onMenu} className={`flex w-10 h-10 items-center justify-center text-[rgb(68,71,70)] ${screenSize !== 'xs'?'hover:bg-[rgba(0,175,240,.2)]':''} rounded-xl shrink-0`}>
                    <PiList size={20}/>
                </button>
                <NavLink to={'/home'}>
                    <button className='flex w-10 h-10 rounded-full items-center justify-center shrink-0'>
                        <Logo fill={'rgb(0,175,240'} size={40}/>
                    </button>
                </NavLink>
                <div className='flex flex-row space-x-2 shrink-0'>
                    <p className='flex items-center font-jostSemi text-xl text-[rgb(0,175,240)]'>COAZ</p>
                </div>
            </div>
            <div className={`${screenSize === 'xs'?'hidden':'flex'} flex-col w-full h-full justify-between overflow-hidden`}>
                <div className='flex flex-col w-full h-full'>
                    <MsSearch/>
                    <Scrollable vertical={true}>
                        <div className='flex flex-col h-fit'>
                            <MenuItem name={'Home'} link={'/home'} Icon={PiHouseSimple} expanded={expanded} setOpenMobileMenu={setOpenMobileMenu}/>
                            {user && menus && menus.length> 0 && 
                                menus.map((menu,i) => <MenuItem key={i} name={menu.name} link={menu.link} Icon={menu.Icon} expanded={expanded} setOpenMobileMenu={setOpenMobileMenu}/>)
                            }
                        </div>
                    </Scrollable>
                </div>
                <div className='flex w-full'>
                    {user?
                        <button ref={userProfileRef}
                            onClick={(e) => {
                                e.stopPropagation()
                                setPopupData({
                                    show:true,
                                    parentElement:userProfileRef.current,
                                    Component:<UserProfile onLogout={onLogout}/>
                                })
                            }} 
                            className='flex flex-row w-full h-fit px-2 space-x-2 font-helveticaNeueRegular tracking-wider rounded-xl items-center'>
                            <p className='flex w-10 h-10 rounded-full text-xl font-jostMedium items-center justify-center text-white bg-[rgb(0,175,240)] shrink-0'>
                                {user.firstname.charAt(0)+user.lastname.charAt(0)}
                            </p>
                            <p className='flex w-auto text-sm font-helveticaNeueRegular tracking-wide whitespace-nowrap text-[rgb(68,71,70)]'>{user.firstname}</p>
                        </button>
                        :
                        <button onClick={onLogin}
                            className='flex flex-row w-full h-fit p-2 space-x-2 font-helveticaNeueRegular tracking-wider rounded-xl items-center'>
                            <div className='flex w-10 h-10 items-center justify-center rounded-full bg-[rgb(0,175,240)] shrink-0'>
                                <PiSignIn size={20} className='text-white'/>
                            </div>
                            <p className='text-sm font-helveticaNeueRegular tracking-wide whitespace-nowrap text-[rgb(68,71,70)]'>Login</p>
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}

export default Menu