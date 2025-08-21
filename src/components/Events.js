import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet } from 'react-router-dom';
import { PiCalendarDot, PiCalendarDotsFill} from "react-icons/pi";
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import AddEvent from './AddEvent';
import EventItem from './EventItem';

const Events = () => {
    const {setDialog} = useContext(GlobalContext);
    const [events,setEvents] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {currentUserId,eventId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();
    const location = useLocation();
    const state = location.state;

    const onAddEvent = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddEvent reload={load}/>
        })
    }

    const getEvents = async () => {
        let events = [];
        await request('GET','events',null,null,false)
        .then((response) => {
            if(response.content) {
                setEvents(response.content);
            } 
        })
    }

    const load = async () => {
        setLoading(true);
        await request('GET','hasauthority',null,{
            contextName:'EVENT',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiCalendarDot,
                        name:'Add Event',
                        handler:onAddEvent
                    }
                ])
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'EVENT',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        await getEvents();
        setLoading(false)
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{eventId?
        <Outlet/>:
        <ContentContainer previous={currentUserId?`/${currentUserId}/home`:'/home'} buttons={buttons} Icon={PiCalendarDotsFill} text='Events' loading={loading}>
            <div className='flex flex-col w-full h-fit space-y-4'>
                {events && events.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Events
                    </p>
                    {events.map((event,i) => <EventItem key={i} event={event} deleteAuthority={deleteAuthority} parent='events' reload={load} setLoading={setLoading}/>)}
                </div>
                }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default Events