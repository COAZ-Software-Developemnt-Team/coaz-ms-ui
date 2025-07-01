import React, {useState,useEffect,useRef,useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { LiaAngleUpSolid,LiaAngleDownSolid,LiaAngleLeftSolid,LiaAngleRightSolid } from "react-icons/lia";

const Scrollable = ({vertical,horizontal,children}) => {
    const [showScrollUp,setShowScrollUp] = useState(false);
    const [showScrollDown,setShowScrollDown] = useState(false);
    const [showScrollLeft,setShowScrollLeft] = useState(false);
    const [showScrollRight,setShowScrollRight] = useState(false);
    const [timerId,setTimerId] = useState(null);
    const scrollableRef = useRef(null);
    const childrenRef = useRef(null);

    const checkScroll = () => {
        if(scrollableRef.current) {
            if(scrollableRef.current.scrollTop === 0) {
                setShowScrollUp(false);
            } else {
                setShowScrollUp(true);
            }
            if(Math.abs(Math.ceil(scrollableRef.current.scrollHeight - scrollableRef.current.scrollTop)%scrollableRef.current.clientHeight) < 2) {
                setShowScrollDown(false);
            } else {
                setShowScrollDown(true);
            }
            if(scrollableRef.current.scrollLeft === 0) {
                setShowScrollLeft(false);
            } else {
                setShowScrollLeft(true);
            }
            if(Math.abs(Math.ceil(scrollableRef.current.scrollWidth - scrollableRef.current.scrollLeft)%scrollableRef.current.clientWidth) < 2) {
                setShowScrollRight(false);
            } else {
                setShowScrollRight(true);
            }
        }
    }

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                checkScroll();
            }
        });

        if(scrollableRef.current) {
            observer.observe(scrollableRef.current)
        }
        if(childrenRef.current) {
            observer.observe(childrenRef.current)
        }
        return () => {
            observer.disconnect();
        }
    },[]);

    return (
        <div className='relative flex w-full h-full overflow-hidden'>
            <button 
                style={{transition:'all .3s ease-in-out'}}
                onMouseDown={(e) => {
                    if(scrollableRef.current) {
                            let id = setInterval(() => {
                            scrollableRef.current.scrollBy({
                                top: -32,
                                left: 0,
                                behavior: "smooth",
                            });
                            setTimerId(id);
                        },100);
                    } 
                }}
                onMouseUp={(e) => {
                    timerId && clearInterval(timerId);
                }}
                onMouseOut={(e) => {
                    timerId && clearInterval(timerId);
                }}
                className={`absolute hidden lg:block top-2 left-1/2 -translate-x-1/2 w-10 h-10 shrink-0 z-50 ${vertical && showScrollUp?'opacity-100 visible':'opacity-0 invisible'} bg-[rgb(255,255,255)] rounded-full shadow-lg`}>
                <LiaAngleUpSolid size={16} className='flex m-auto text-gray-600'/>
            </button>
            <button 
                style={{transition:'all .3s ease-in-out'}}
                onMouseDown={(e) => {
                    if(scrollableRef.current) {
                            let id = setInterval(() => {
                            scrollableRef.current.scrollBy({
                                top: 32,
                                left: 0,
                                behavior: "smooth",
                            });
                            setTimerId(id);
                        },100);
                    } 
                }}
                onMouseUp={(e) => {
                    timerId && clearInterval(timerId);
                }}
                onMouseOut={(e) => {
                    timerId && clearInterval(timerId);
                }}
                className={`absolute hidden lg:block bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 shrink-0 z-50 ${vertical && showScrollDown?'opacity-100 visible':'opacity-0 invisible'} bg-[rgb(255,255,255)] rounded-full shadow-lg`}>
                <LiaAngleDownSolid size={16} className='flex m-auto text-gray-600'/>
            </button>
            <button 
                style={{transition:'all .3s ease-in-out'}}
                onMouseDown={(e) => {
                    if(scrollableRef.current) {
                            let id = setInterval(() => {
                            scrollableRef.current.scrollBy({
                                top: 0,
                                left: -32,
                                behavior: "smooth",
                            });
                            setTimerId(id);
                        },100);
                    } 
                }}
                onMouseUp={(e) => {
                    timerId && clearInterval(timerId);
                }}
                onMouseOut={(e) => {
                    timerId && clearInterval(timerId);
                }}
                className={`absolute hidden lg:block left-2 top-1/2 -translate-y-1/2 w-10 h-10 shrink-0 z-50  ${horizontal && showScrollLeft?'opacity-100 visible':'opacity-0 invisible'} bg-[rgb(255,255,255)] rounded-full shadow-lg`}>
                <LiaAngleLeftSolid size={16} className='flex m-auto text-gray-600'/>
            </button>
            <button 
                style={{transition:'all .3s ease-in-out'}}
                onMouseDown={(e) => {
                    if(scrollableRef.current) {
                            let id = setInterval(() => {
                            scrollableRef.current.scrollBy({
                                top: 0,
                                left: 32,
                                behavior: "smooth",
                            });
                            setTimerId(id);
                        },100);
                    } 
                }}
                onMouseUp={(e) => {
                    timerId && clearInterval(timerId);
                }}
                onMouseOut={(e) => {
                    timerId && clearInterval(timerId);
                }}
                className={`absolute hidden lg:block right-2 top-1/2 -translate-y-1/2 w-10 h-10 shrink-0 z-50 ${horizontal && showScrollRight?'opacity-100 visible':'opacity-0 invisible'} bg-[rgb(255,255,255)] rounded-full shadow-lg`}>
                <LiaAngleRightSolid size={16} className='flex m-auto text-gray-600'/>
            </button>
            <div ref={scrollableRef}
                onScroll={(e)=>{
                    checkScroll();
                }}
                className='relative flex w-full h-full no-scrollbar overflow-auto'>
                <div ref={childrenRef} className={`${horizontal?'w-fit':'w-full'} ${vertical?'h-fit':'h-full'}`}>
                    {children}
                </div>
                
            </div>
        </div>
      )
}

export default Scrollable