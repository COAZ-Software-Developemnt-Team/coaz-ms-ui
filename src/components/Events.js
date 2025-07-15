import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical,PiTag, PiCalendarDot, PiCalendarDotLight, PiUserPlus, PiCalendarDotsFill, PiCalendarPlus, PiCalendarCheckLight, PiCalendarCheck } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import {useData} from '../App'
import ContentContainer from './ContentContainer';
import AddEvent from './AddEvent';
import Payment from './MobilePayment';
import PaymentOptions from './PaymentOptions';

const Events = () => {
    const {currentUser,setDialog} = useContext(GlobalContext);
    const [registeredEvents,setRegisteredEvents] = useState([]);
    const [availableEvents,setAvailableEvents] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {eventId} = useParams();
    const path = useLocation().pathname;
    const [request] = useData;
    const onAddEvent = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddEvent reload={load}/>
        })
    }

    const getEvents = async () => {
        if(!currentUser) {
            setRegisteredEvents([]);
            setAvailableEvents([]);
            return;
        }
        let events = [];
        await request('GET','events',null,null,false)
        .then((response) => {
            if(response.content) {
                events = response.content;
            } 
        })

        let eventUsers = [];
        await request('GET','event/users/user',null,{userId:currentUser.id},false)
        .then((response) => {
            if(response.content) {
                setRegisteredEvents(response.content);
                eventUsers = response.content;
            } 
        })
        let available = [];
        for(let event of events) {
            let found = eventUsers.find((eventUser) => {return eventUser.event && eventUser.event.id == event.id});
            if(!found) {
                available.push(event);
            }
        }
        setAvailableEvents(available);
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
        <Outlet context={{parentPath:`/events`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiCalendarDotsFill} text='Events' loading={loading}>
            <div className='flex flex-col w-full h-fit space-y-4'>
                {registeredEvents && registeredEvents.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Registered Events
                    </p>
                    {registeredEvents.map((registeredEvent,i) => <EventItem key={i} event={registeredEvent.event} user={registeredEvent.user} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
                </div>
                }
                {availableEvents && availableEvents.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Available Events
                    </p>
                    {availableEvents.map((availableEvent,i) => <EventItem key={i} event={availableEvent} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
                </div>
                }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default Events

const EventItem = ({event,user,deleteAuthority,reload,setLoading}) => {
    const {currentUser,setDialog,setPopupData,setAccess} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [tariff,setTariff] = useState(null);
    const [request] = useData();
    const moreRef = useRef(null);

    let USDecimal = new Intl.NumberFormat('en-US',{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onRegister = (e) => {
        e.preventDefault();
        if(!currentUser) {
            return;
        }
        setDialog({
            show:true,
            Component:() =>                       
                <YesNoDialog 
                    title='Events' 
                    message={`Are you sure you want to register for ${event.name}?`} 
                    onYes={async (e) => {
                        setLoading(true);
                        if(event.tariffApplicable) {
                            await request('GET','tariff/receivable',null,{receivableId:event.id,rootValueId:currentUser.id},true)
                            .then(async (response) => {
                                if(response.status && response.status === 'SUCCESSFUL') {
                                    if(response.content && response.content.price > 0) {
                                        /* setAccess({Component:() => <Payment user={currentUser} tariff={response.content}  reload={reload}/>}); */
                                        setDialog({show:true,Component:() => <PaymentOptions user={currentUser} tariff={response.content}  reload={reload}/>});
                                    } else {
                                        await request('POST','event/user/self',null,{eventId:event.id},true);
                                    }
                                }
                            })
                        } else {
                            await request('POST','event/user/self',null,{eventId:event.id},true);
                        }
                        reload? reload():setLoading(false);
                    }}
                />
        })
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(event && !event.reserved && deleteAuthority) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Event' 
                        message={`Are you sure you want to delete ${event.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE',`event/${event.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    const getTariff = () => {
        if(event) {
            request('GET','tariff/default',null,{receivableId:event.id},true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    setTariff(response.content);
                }
            })
        }
    }

    useEffect(() => {
        getTariff();
    },[event])

    return (
        <div className='flex flex-row w-full h-auto'>
            {event &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/events/${event.id}`)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    {user?
                    <PiCalendarCheckLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                    <PiCalendarDotLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${event.name}`}
                        </p>
                        {user?
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Registered</p>
                            :
                        event.tariffApplicable? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{tariff && tariff.price?`K ${USDecimal.format(tariff.price)}`:'No default tariff'}</p>
                            </div>
                            :
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && (!user || deleteAuthority) &&
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            {!user && 
                                                <button 
                                                    onClick={onRegister}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiCalendarCheck size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Register
                                                    </p>
                                                </button>
                                            }
                                            {deleteAuthority && 
                                                <button 
                                                    onClick={onDelete}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiTrash size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Delete
                                                    </p>
                                                </button>
                                            }
                                        </div>
                                })
                            }}
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDotsThreeVertical size={20} />
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}