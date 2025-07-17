import React, {useEffect,useState,useContext,useRef} from 'react'
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import {useData} from '../data';
import { PiArrowLeftLight } from 'react-icons/pi';
import LoadingIcons from 'react-loading-icons'

const Resource = () => {
    const {resourceId} = useParams();
    const path = useLocation().pathname;
    const {parentPath} = useOutletContext();
    const [iframeSrc, setIframeSrc] = useState(null);
    const [viewed,setViewed] = useState(null);
    const [duration,setDuration] = useState(null);
    const [loading,setLoading] = useState();
    const [request,download] = useData();
    const viewedRef = useRef(viewed);

    const navigate = useNavigate();

    useEffect(() => {
        viewedRef.current = viewed;
    },[viewed])

    useEffect(() => {
        (async () => {
            setLoading(true);
            await download(`resource/download/${resourceId}`,null,true)
            .then(async (response) => {
                if(response instanceof Blob) {
                    const url = URL.createObjectURL(new Blob([response],{type:"application/pdf"}));
                    setIframeSrc(url);

                    await request('GET',`resource/${resourceId}`,null,null,true) 
                    .then((resourceResponse) => {
                        if(resourceResponse && resourceResponse.content.duration && resourceResponse.content.durationUnit) {
                            let durationInMs = resourceResponse.content.duration * resourceResponse.content.durationUnit.milliseconds;
                            setDuration(durationInMs);
                        } else {
                            setDuration(0)
                        }
                    })
                    .catch((error) => {
                        setDuration(0);
                    })

                    await request('GET','resource/view/my',null,{resourceId:resourceId},true) 
                    .then((viewResponse) => {
                        setViewed(viewResponse && viewResponse.content? viewResponse.content.viewed:0);
                    })
                    .catch((error) => {
                        setViewed(0);
                    })
                }
            })
            setLoading(false);
        })()
        
        return () => {
            if(viewedRef.current) {
                request('POST','resource/view',null,{resourceId:resourceId,viewed:viewedRef.current},true);
            }
        };
    },[path])

  return (
    <>
    {loading?
        <div className='flex w-full h-full bg-white items-center justify-center'>
            <LoadingIcons.ThreeDots width={32} height={64} fill="rgb(0,175,240)"/>
        </div>
        :
        <div className='relative w-full h-full bg-white overflow-hidden'>
            <div className='flex flex-row w-full h-10 shrink-0 px-2 items-center justify-center'>
                <button onClick={(e) => navigate(parentPath)} className='absolute flex left-0 w-10 h-10 items-center justify-center text-[rgb(68,71,70)]'>
                    <PiArrowLeftLight size={20}/>
                </button>
                <div className='flex flex-row w-fit h-fit px-2 py-1 items-center border rounded-full'>
                    <div className='flex flex-row space-x-1 w-fit h-fit items-center text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular'>
                        <p>Viewed :</p>
                        <Timer timer={viewed} setTimer={setViewed} minMs={duration}/>
                    </div>
                    &nbsp;&nbsp;&nbsp;
                    <div className='flex flex-row space-x-1 w-fit h-fit items-center text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular'>
                        <p>Duration :</p>
                        <FormatedTime time={duration}/>
                    </div>
                </div>
            </div>
            {iframeSrc && (
            <iframe
                src={iframeSrc}
                title="Resource veiwer"
                className='w-full h-full overflow-hidden'
            />
            )}
        </div>
    }
    </>
  )
}

export default Resource

const Timer = ({timer,setTimer,minMs}) => {
    const start = new Date();

    useEffect(() => {
        const timerId = setTimeout(() => {
            const elapsed = new Date().getTime() - start.getTime();
            setTimer(timer + elapsed);
        },1000);
        return () => {
            clearTimeout(timerId);
        }
    },[timer]);

    return (
        <FormatedTime time={timer} minimum={minMs}/>
    )
}

const FormatedTime = ({time, minimum}) => {
    let totalSeconds = parseInt(Math.floor(time / 1000));
    let totalMinutes = parseInt(Math.floor(totalSeconds / 60));
    let totalHours = parseInt(Math.floor(totalMinutes / 60));
    let days = parseInt(totalHours / 24);

    let seconds = parseInt(totalSeconds % 60);
    let minutes = parseInt(totalMinutes % 60);
    let hours = parseInt(totalHours % 24);

    return (
        <p className={`text-sm ${minimum && (minimum === 0 || time > minimum)?'text-green-600':'text-[rgb(68,70,71)]' }`}>
            {`${days}:${hours}:${minutes}:${seconds}`}
        </p>
    )
}