import React,{useState,useEffect} from 'react'
import { NavLink, useLocation} from 'react-router-dom';

const MenuItem = ({name,link,Icon,count,expanded,setOpenMobileMenu}) => {
    
    return (
        <div className={`flex flex-col w-full h-auto px-2 shrink-0`}>
            <NavLink to={link?link:''}
                onClick={(e) => {
                    setOpenMobileMenu(false);
                }}
                className={({isActive}) => {return `flex flex-row w-full h-fit space-x-2 font-helveticaNeueRegular tracking-wider rounded-xl items-center ${isActive?'text-[rgb(0,175,240)]':'text-[rgb(68,71,70)]'} hover:bg-[rgba(0,175,240,.2)] focus:outline-none`}}>
                <div className='flex w-10 h-10 items-center justify-center rounded-full shrink-0'>
                    <Icon size={20}/>
                </div>
                <div className={`${expanded?'flex':'hidden'} flex-row w-full items-center justify-between pr-2`}>
                    <p className={`text-sm whitespace-nowrap overflow-ellipsis`}>{name}</p>
                    {count != null && count != undefined && 
                        <p className='w-fit min-w-[16px] h-fit text-xs px-1 text-white bg-[rgb(0,175,240)] rounded-full text-center'>{count}</p>
                    }
                </div>
            </NavLink>
        </div>
    )
}

export default MenuItem