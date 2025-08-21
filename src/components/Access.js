import React from 'react'
import { PiXLight } from "react-icons/pi";

const Access = ({onClose,children}) => {
  return (
    <div className='fixed flex flex-col w-screen h-screen bg-[url(/public/images/bg_cpd.jpg)] bg-center bg-cover'>
        <div style={{backdropFilter:'blur(64px)'}} 
            className='flex flex-col w-full h-full bg-[rgba(255,255,255,.2)] overflow-hidden'>
            <div className='flex flex-row-reverse w-full h-16 items-center shrink-0 text-[rgb(68,71,70)]'>
            <button onClick={e => 
                {
                    e.preventDefault();
                    onClose && onClose();
                }
                } className='flex w-10 h-10 mr-4 items-center justify-center bg-white rounded-full shadow-md'>
                <PiXLight size={20}/>
            </button>
            </div>
            <div className='flex w-full h-full no-scrollbar overflow-auto items-center justify-center'>
                {children}
            </div>
        </div>
    </div>
  )
}

export default Access