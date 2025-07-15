import React, {useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {PiArrowLeft,PiDotsThreeVertical} from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

const Header = ({previous,buttons,Icon,text}) => {
    const {screenSize,setPopupData} = useContext(GlobalContext);
    const moreRef = useRef(null);
    const navigate = useNavigate();

  return (
    <div style={{backdropFilter:'blur(2px)'}}
        className='flex flex-row w-[95%] h-fit p-2 sm:p-4 mt-[2%] text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)] rounded-2xl shadow-xl overflow-hidden shrink-0'>
        <div className='flex flex-row w-full h-fit justify-between shrink-0 space-x-2 items-center'>
            {previous && <button 
                onClick={(e) => navigate(previous)}
                className='flex w-10 h-10 hover:bg-[rgba(0,175,240,.1)]  shrink-0 rounded-full'
            >
                <PiArrowLeft size={32} className='flex m-auto'/>
            </button>}
            {Icon && <Icon size={40} className=' shrink-0'/>}
            <div className='flex flex-col w-full overflow-hidden'>
                {text &&
                    <p style={{display:'-webkit-box', WebkitBoxOrient:'vertical',WebkitLineClamp:'2'}} 
                        className='w-full h-auto text-xl sm:text-2xl text-[rgb(0,175,240)] font-jostSemi break-words overflow-hidden uppercase'>
                        {text}
                    </p>
                }
            </div>
            {buttons && buttons.length > 0 &&
                <button ref={moreRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPopupData({
                            show:true,
                            parentElement:moreRef.current,
                            Component:
                                <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                    {
                                        buttons.map((button,i) => 
                                            <button key={i}
                                                onClick={button.handler}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <button.Icon size={20} className='flex shrink-0'/>
                                                <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    {button.name}
                                                </p>
                                            </button>
                                        )
                                    }
                                </div>
                        })
                    }}
                    className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,175,240,.1)] rounded-full'>
                    <PiDotsThreeVertical size={32} />
                </button>
            }
        </div>
        <div className='flex flex-row w-full h-full items-center space-x-4'>
        </div>
    </div>
  )
}

export default Header