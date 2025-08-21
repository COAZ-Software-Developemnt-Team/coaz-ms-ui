import React, { useState, useContext, useEffect } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import { PiSignOut } from "react-icons/pi";
import { useData } from '../data';

const UserProfile = ({onLogout}) => {
    const [user,setUser] = useState(null);
    const {request} = useData();

    useEffect(() => {
        request('GET','current',null,null,true)
        .then(async (currentResponse) => {
            if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
                setUser(currentResponse.content.user);
            } else {
                setUser(null);
            }
        })
        .catch((error) => {
            console.error(error);
            setUser(null);
        })
    },[])
  return (
    <div className='flex flex-col w-64 h-96 bg-white rounded-md overflow-hidden'>
        <div className='flex flex-col justify-between w-full h-full bg-[rgba(0,175,240,.09)]'>
            <div className='flex w-full h-32 pt-12 justify-center bg-[rgba(0,175,240,.1)]'>
                <div className='flex w-40 h-40 rounded-full bg-[rgb(0,175,240)] shadow-lg'>
                    {user && <p className='flex w-fit h-auto m-auto text-white text-7xl font-jostMedium overflow-hidden'>
                        {user.firstname.charAt(0).toUpperCase()+user.lastname.charAt(0).toUpperCase()}
                    </p>}
                </div>
            </div>
            <div className='flex flex-col w-full space-y-8'>
                <div className='flex flex-col w-full h-fit space-y-2'>
                    <p className='text-2xl text-center text-[rgb(68,71,70)] tracking-wide font-helveticaNeueMedium'>
                        {user && user.username}
                    </p>
                    <p className='text-center text-[rgb(68,71,70)] tracking-wide font-helveticaNeueRegular capitalize'>
                        {user && user.name}
                    </p>
                    <p className='text-sm text-center text-[rgba(68,71,70,.5)] tracking-wide font-helveticaNeueLight'>
                        {user && user.email}
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