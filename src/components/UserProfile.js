import React, { useContext, useEffect } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import { PiSignOut } from "react-icons/pi";

const UserProfile = ({onLogout}) => {
    const {currentUser,setPopupData} = useContext(GlobalContext);

  return (
    <div className='flex flex-col w-64 h-96 bg-white rounded-md overflow-hidden'>
        <div className='flex flex-col justify-between w-full h-full bg-[rgba(0,175,240,.09)]'>
            <div className='flex w-full h-32 pt-12 justify-center bg-[rgba(0,175,240,.1)]'>
                <div className='flex w-40 h-40 rounded-full bg-[rgb(0,175,240)] shadow-lg'>
                    {currentUser && <p className='flex w-fit h-auto m-auto text-white text-7xl font-jostMedium overflow-hidden'>
                            {currentUser.firstname.charAt(0)+currentUser.lastname.charAt(0)}
                    </p>}
                </div>
            </div>
            <div className='flex flex-col w-full space-y-8'>
                <div className='flex flex-col w-full h-fit space-y-2'>
                    <p className='text-2xl text-center text-[rgb(68,71,70)] tracking-wide font-helveticaNeueMedium'>
                        {currentUser && currentUser.username}
                    </p>
                    <p className='text-center text-[rgb(68,71,70)] tracking-wide font-helveticaNeueRegular capitalize'>
                        {currentUser && currentUser.name}
                    </p>
                    <p className='text-sm text-center text-[rgba(68,71,70,.5)] tracking-wide font-helveticaNeueLight'>
                        {currentUser && currentUser.email}
                    </p>
                </div>
                <div className='flex w-full h-10 pl-4 items-center border-t border-[rgba(0,175,240,.2)]'>
                    <button onClick={onLogout}
                        className='flex flex-row space-x-4'>
                        <PiSignOut size={20} className='text-[rgb(0,175,240)]'/>
                        <p className='text-sm text-[rgb(68,71,70)]'>Logout</p>
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default UserProfile