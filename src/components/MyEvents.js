import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical,PiTag, PiCalendarDotLight, PiUserPlus, PiCalendarDotsFill, PiCalendarPlus, PiCalendarCheckLight, PiCalendarCheck, PiUserMinus } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import EventItem from './EventItem';

const MyEvents = () => {
    const [events,setEvents] = useState([]);
    const [eventUsers,setEventUsers] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {currentUserId,eventId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();
    const location = useLocation();
    const state = location.state;

    const EVENTS = 'events';
    const MY_EVENTS = 'my_events';

    const getEvents = async () => {
        await request('GET','events/available',null,{userId:currentUserId},true)
        .then((response) => {
            if(response.content) {
                setEvents(response.content);
            } else {
                setEvents([]);
            }
        })
        .catch((error) => {
            setEvents([]);
        })
    }

    const getEventUsers = async () => {
        await request('GET','event/users/user',null,{userId:currentUserId},true)
        .then((response) => {
            if(response.content) {
                setEventUsers(response.content);
            } 
        })
    }

    const load = async () => {
        setLoading(true);
        await getEvents();
        await getEventUsers();
        setLoading(false)
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{eventId?
        <Outlet/>:
        <ContentContainer previous={currentUserId?`/${currentUserId}/home`:'/home'} 
            buttons={buttons} 
            Icon={PiCalendarDotsFill} 
            text='Events' 
            loading={loading}>
            <div className='flex flex-col w-full h-fit space-y-4'>
                {eventUsers && eventUsers.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Registered Events
                    </p>
                    {eventUsers.map((eventUser,i) => <EventUserItem key={i} eventUser={eventUser} reload={load} setLoading={setLoading}/>)}
                </div>
                }
                {events && events.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Events
                    </p>
                    {events.map((event,i) => <EventItem key={i} event={event} parent={MY_EVENTS} reload={load} setLoading={setLoading}/>)}
                </div>
                }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default MyEvents

const EventUserItem = ({eventUser,reload,setLoading}) => {
    const {setDialog,screenSize} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const {currentUserId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();

    let USDecimal = new Intl.NumberFormat('en-US',{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onUnregister = (e) => {
        e.preventDefault();
        if(eventUser && eventUser.user && eventUser.event) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Unregister' 
                        message={`Are you sure you want to unregister from ${eventUser.event.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE','event/user',null,{eventId:eventUser.event.id,userId:eventUser.user.id},true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {eventUser.event && eventUser.user && currentUserId &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/${currentUserId}/my_events/event_user/${eventUser.event.id}`,{state:{parentPath:path}})}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiCalendarCheckLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${eventUser.event.name}`}
                        </p>
                        <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Registered</p>
                    </div>
                </div>
                {(highlighted || screenSize === 'xs') && 
                    <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                        <button onClick={onUnregister} 
                            className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-400 rounded-full'>
                            <PiUserMinus size={20}/>
                        </button>
                    </div>
                }
            </div>}
        </div>
    )
}