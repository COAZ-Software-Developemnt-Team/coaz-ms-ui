import {useState,useEffect,useRef} from 'react';
import { LiaAngleUpSolid,LiaAngleDownSolid} from "react-icons/lia";

const ScrollableMenus = ({vertical,horizontal,children}) => {
    const [showScrollUp,setShowScrollUp] = useState(false);
    const [showScrollDown,setShowScrollDown] = useState(false);
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
        <div className='relative flex flex-col w-full h-full items-center overflow-hidden'>
            <div className='flex flex-row w-full h-6 px-4 items-center overflow-hidden'>
                <span className='w-full h-[1px] border-t border-[rgba(0,175,240,.2)]'/>
                {showScrollUp && <ScrollButton scrollableRef={scrollableRef} timerId={timerId} setTimerId={setTimerId}/>}
                <span className='w-full h-[1px] border-t border-[rgba(0,175,240,.2)]'/>
            </div>
            <div ref={scrollableRef}
                onScroll={(e)=>{
                    checkScroll();
                }}
                className='relative flex w-full h-full no-scrollbar overflow-auto'>
                <div ref={childrenRef} className={`${horizontal?'w-fit':'w-full'} ${vertical?'h-fit':'h-full'}`}>
                    {children}
                </div>
            </div>
            <div className='flex flex-row w-full h-6 px-4 items-center overflow-hidden'>
                <span className='w-full h-[1px] border-t border-[rgba(0,175,240,.2)]'/>
                {showScrollDown && <ScrollButton scrollableRef={scrollableRef} timerId={timerId} setTimerId={setTimerId} down={true}/>}
                <span className='w-full h-[1px] border-t border-[rgba(0,175,240,.2)]'/>
            </div>
        </div>
      )
}

const ScrollButton = ({scrollableRef,timerId,setTimerId,down}) => {
    useEffect(() => {
        return () => {
            timerId && clearInterval(timerId);
        }
    },[])
    return (
        <button 
            onMouseDown={(e) => {
                if(scrollableRef.current) {
                        let id = setInterval(() => {
                        scrollableRef.current.scrollBy({
                            top: down?32:-32,
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
            className='flex w-16 h-4 items-center text-[rgb(0,175,240)] justify-center shrink-0'>
            {down?<LiaAngleDownSolid size={16}/>:<LiaAngleUpSolid size={16}/>}
        </button>
    )
}

export default ScrollableMenus