import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, useOutletContext } from 'react-router-dom';
import { PiDotsThreeVertical,PiTag,PiTrash, PiPencilSimple, PiMaskHappy, PiCalendarDotFill, PiCloudSunLight } from 'react-icons/pi';
import YesNoDialog from './YesNoDialog';
import AddTariff from './AddTariff';
import Tariff from './Tariff';
import { useData} from '../App';
import Detail from './Detail';
import ContentContainer from './ContentContainer';
import EditEvent from './EditEvent';
import AddEventDay from './AddEventDay';
import UserItem from './UserItem';
import EditEventDay from './EditEventDay';

const Event = () => {
    const {setDialog} = useContext(GlobalContext);
    const [event,setEvent] = useState(null);
    const [eventDays,setEventDays] = useState([]);
    const [tariffs,setTariffs] = useState([]);
    const [eventUsers,setEventUsers] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [readUsersAuthority,setReadUsersAuthority] = useState(false);
    const {eventId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;
    const [request] = useData;
    const onEdit = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <EditEvent id={eventId} reload={load}/>
        })
    }

    const onAddEventDay = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddEventDay eventId={eventId} reload={load}/>
        })
    }

    const onAddTariff = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddTariff receivableId={eventId} reload={load}/>
        })
    }

    const getEvent = async () => {
        let updateAuth = false;
        let createTariffAuth = false;
        await request('GET','hasauthority',null,{
            contextName:'EVENT',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                setUpdateAuthority(true);
                updateAuth = true;
            }
        })

        await request('GET','hasauthority',null,{
            contextName:'TARIFF',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                createTariffAuth = true;
            }
        })

        await request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                setReadUsersAuthority(true)
            }
        })

        if(eventId) {
            await request('GET',`event/${eventId}`,null,null,false)
            .then((response) => {
                if(response.content) {
                    setEvent(response.content);
                    let btns = [];
                    if(updateAuth) {
                        btns.push(
                            {
                                Icon:PiPencilSimple,
                                name:'Edit',
                                handler:onEdit
                            }
                        );
                        btns.push(
                            {
                                Icon:PiMaskHappy,
                                name:'Add Event Day',
                                handler:onAddEventDay
                            }
                        );
                    }

                    if(response.content.tariffApplicable && updateAuth && createTariffAuth) {
                        btns.push({
                            Icon:PiTag,
                            name:'Add Tariff',
                            handler:onAddTariff
                        })
                    }
                    setButtons(btns);
                }  else {
                    setEvent(null);
                }
            })
            .catch((error) => {
                setEvent(null);
            })
        }
    }

    const getEventDays = async () => {
        await request('GET','event/days/event',null,{
            eventId:eventId
        },true)
        .then((response) => {
            if(response.content && response.content.length > 0) {
                for(let eventDay of response.content) {
                    if(eventDay.date) {
                        eventDay.date = new Date(eventDay.date);
                    } else {
                        eventDay.date = new Date();
                    }
                }
                let sortedDays = response.content.sort((day1,day2) => (day1.date < day2.date)?-1:(day1.date > day2.date)?1:0)
                setEventDays(sortedDays);
            } else {
                setEventDays([])
            }
        })
        .catch((error) => {
            setEventDays([])
        })
    }

    const getEventUsers = async () => {
        await request('GET','event/users/event',null,{
            eventId:eventId
        },true)
        .then((response) => {
            if(response.content) {
                setEventUsers(response.content);
            } else {
                setEventUsers([])
            }
        })
        .catch((error) => {
            setEventUsers([])
        })
    }

    const getTariffs = async () => {
        if(eventId) {
            request('GET',`tariffs/${eventId}`,null,null,true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    setTariffs(response.content);
                } else {
                    setTariffs([]);
                }
            })
            .catch((error) => {
                setTariffs([]);
            })
        }
    }

    const load = async () => {
        setLoading(true);
        await getEvent();
        await getEventDays();
        await getTariffs();
        await getEventUsers();
        setLoading(false);
    }

    useEffect(() => {
        load()
    },[path])

  return (
    <div className='flex flex-col w-full h-full space-y-8 items-center overflow-hidden'>
        <ContentContainer previous={parentPath} buttons={buttons} Icon={PiCalendarDotFill} text={event?event.name:''} subText={event?event.description:''} loading={loading}>
            {event &&
            <div className='flex flex-col w-full h-fit space-y-4'>
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                    <Detail label='Tariff Applicable' value={event.tariffApplicable?'Yes':'No'}/>
                    {event.tariffApplicable && event.criteriaPathItem &&
                        <Detail label='Tariff Criteria Path' value={event.criteriaPathItem.id}/>
                    }
                </div>
                {eventDays && eventDays.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Days</p>
                    {eventDays.map((eventDay,i) => <EventDay key={i} eventDay={eventDay} updateAuthority={updateAuthority} reload={load}/>)}
                </div>
                }
                {event.tariffApplicable && tariffs && tariffs.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Tariffs</p>
                    {tariffs.map((tariff,i) => <Tariff key={i} tariff={tariff} reload={load}/>)}
                </div>
                }
                {readUsersAuthority && eventUsers && eventUsers.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Users</p>
                    {eventUsers.map((eventUser,i) => <UserItem key={i} user={eventUser.user} reload={load}/>)}
                </div>
                }
            </div>
            }
        </ContentContainer>
    </div>
  )
}

export default Event

const EventDay = ({eventDay,updateAuthority,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [request] = useData();
    const path = useLocation().pathname;
    const moreRef = useRef(null)

    const onEdit = (e) => {
        e.preventDefault();
        if(eventDay && eventDay.event && updateAuthority) {
            setDialog({
                show:true,
                Component:() => <EditEventDay eventDayId={eventDay.id} reload={reload}/>
            })
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(eventDay && eventDay.event && updateAuthority) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Delete event day' 
                        message={`Are you sure you want to delete ${eventDay.event.name.toLowerCase()} ${eventDay.date.toLocaleString('default', { month: 'long' })+' '+eventDay.date.getDate()+', '+eventDay.date.getFullYear()}?`} 
                        onYes={async (e) => {
                            await request('DELETE',`event/day/${eventDay.id}`,null,null,true)
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
            {eventDay && 
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <PiCloudSunLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {eventDay.date.toLocaleString('default', { month: 'long' })+' '+eventDay.date.getDate()+', '+eventDay.date.getFullYear()}
                        </p>
                        <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular capitalize'>
                            {`From ${eventDay.startHour}:${eventDay.startMin} to ${eventDay.endHour}:${eventDay.endMin}`}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && eventDay.event && updateAuthority &&
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            <button 
                                                onClick={onEdit}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiPencilSimple size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Edit
                                                </p>
                                            </button>
                                            <button 
                                                onClick={onDelete}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiTrash size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Delete
                                                </p>
                                            </button>
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

