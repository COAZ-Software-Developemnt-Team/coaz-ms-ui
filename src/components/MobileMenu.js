import React,{useState,useEffect,useRef,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { PiHouseSimple,PiSignIn} from "react-icons/pi";
import UserProfile from './UserProfile';
import MsMenuItem from './MenuItem';
import MsSearch from './Search';

const MobileMenu = ({user,menus,onLogin,onLogout,openMobileMenu, setOpenMobileMenu}) => {
    const {setPopupData} = useContext(GlobalContext);
    const [expanded,setExpanded] = useState(true);
    const userProfileRef = useRef(null);

    useEffect(() => {
    },[]);
  return (
    <div style={{backdropFilter:'blur(20px)'}}
        className={`flex flex-col w-full h-full py-4 space-y-1 overflow-hidden overflow-y-auto shrink-0 bg-[rgba(208,241,252)] shadow-xl rounded-b-2xl`}>
        <div className={`flex flex-col w-full h-full justify-between overflow-hidden `}>
            <div className='flex flex-col w-full h-fit'>
                <MsSearch/>
                <MsMenuItem name={'Home'} link={'/home'} Icon={PiHouseSimple} expanded={expanded} setOpenMobileMenu={setOpenMobileMenu}/>
                <div className='flex flex-col h-fit'>
                    {user && menus && menus.length > 0 && 
                        menus.map((menu,i) => <MsMenuItem key={i} name={menu.name} link={menu.link} Icon={menu.Icon} expanded={expanded} setOpenMobileMenu={setOpenMobileMenu}/>)
                    }
                </div>
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
                    </button>:
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

export default MobileMenu