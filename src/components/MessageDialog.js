import React, {useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { IoCloseOutline } from "react-icons/io5";

const MessageDialog = ({title,message,onClose}) => {
    const {setDialog} = useContext(GlobalContext);
    return (
        <div className='flex flex-col w-fit h-fit shadow-xl text-sm font-jostBook tracking-wider bg-[rgb(252,252,252)] rounded-md overflow-hidden'>
            <div className='flex flex-row w-full items-center justify-between h-8 pl-4 pr-4 shrink-0 text-[rgb(150,150,150)] bg-[rgb(247,247,247)]'>
                <p className='capitalize'>{title}</p>
                <button onClick={e => {
                        e.preventDefault();
                        onClose && onClose(e);
                        setDialog(null);
                    }} 
                    className='flex w-6 h-6 shrink-0 hover:bg-[rgb(235,235,235)]'>
                    <IoCloseOutline size={24}/>
                </button>
            </div>
            <div className='flex w-fit h-fit items-center justify-center p-4'>
                <p className='w-full max-w-md h-fit text-[rgb(68,71,70)]'>
                    {message}
                </p>
            </div>
            <div className='flex flex-row w-fit h-16 mx-auto shrink-0 items-center justify-center space-x-4'>
                <button 
                    onClick={e => {
                        e.preventDefault();
                        onClose && onClose(e);
                        setDialog(null);
                    }} 
                    className='flex shrink-0 w-32 h-8 rounded-lg items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)]'>
                    Got it, thanks!
                </button>
            </div>
        </div>
    )
}

export default MessageDialog