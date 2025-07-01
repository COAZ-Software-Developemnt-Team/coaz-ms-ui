import React,{useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import LoadingIcons from 'react-loading-icons'

const Message = ({message}) => {
    const {loading} = useContext(GlobalContext);
    return (
        <div className='flex w-full h-8 shrink-0 items-center justify-center'>
        {loading?
            <LoadingIcons.ThreeDots width={32} height={64} fill="rgb(0,175,240)"/>
            :
            <p className={`w-full font-jostBook italic text-center text-sm whitespace-nowrap overflow-hidden overflow-ellipsis ${message && !message.success?'text-red-600':'text-green-600'}`}>{message?message.content:''}</p>
        }
        </div>
    )
}

export default Message