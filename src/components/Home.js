import React, {useEffect} from 'react'
import { useLocation,NavLink} from 'react-router-dom';
import { PiArrowLeft } from "react-icons/pi";

const Home = () => {
    const path = useLocation().pathname;

    useEffect(() => {
      
    },[path]);

  return (
    <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}} 
        className='flex flex-col w-full h-full items-center justify-center overflow-hidden'>
        <div style={{backdropFilter:'blur(2px)'}} 
          className='flex flex-col lg:w-[640px] w-[90%] h-96 space-y-4 items-center justify-center rounded-2xl shadow-xl bg-[rgba(0,175,240,.2)]'>
          <p className=' text-[rgb(0,175,240)] font-helveticaNeueRegular tracking-wide'>WELCOME TO</p>
          <p className='text-7xl sm:text-9xl text-[rgb(0,175,240)] font-jostSemi'>COAZ</p>
          <p className='text-3xl sm:text-5xl text-[rgba(0,175,240)] font-helveticaNeueRegular tracking-wide text-center'>MANAGEMENT SYSTEM</p>
          <div className='flex flex-row w-full h-fit justify-center text-[rgb(0,175,240)]'>
            <NavLink to={'/home'}>
              <button className='flex flex-row w-fit h-fit space-x-2 items-center hover:underline'>
                <PiArrowLeft size={20}/>
                <p className='text-xs font-helveticaNeueRegular tracking-wide'>To main site</p>
              </button>
            </NavLink>
          </div>
        </div>
    </div>
  )
}

export default Home