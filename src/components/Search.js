import React,{useState} from 'react'
import { PiMagnifyingGlass} from "react-icons/pi";

const MsSearch = () => {
    const [focused,setFocused] = useState(false);
    return (
        <div onFocus={(e) => setFocused(true)} onBlur={(e) => setFocused(false)} 
            className={`flex flex-row w-full h-8 pl-4 space-x-4 items-center rounded-xl ${focused?'bg-white shadow-md':''} `}>
            <button className='flex w-6 h-6 rounded-full items-center justify-center shrink-0'>
                <PiMagnifyingGlass   size={20} className='text-[rgb(68,71,70)]'/>
            </button>
            <input className='w-full text-sm font-helveticaNeueRegular tracking-wider bg-transparent focus:outline-none placeholder-[rgb(68,71,70)]' 
                placeholder='Search...'/>
        </div>
    )
}

export default MsSearch