import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation, useNavigate,useParams } from 'react-router-dom';
import { PiTrash,PiTag, PiCalendarDotLight, PiUserPlus } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import PaymentOptions from './PaymentOptions';
import {useData} from '../data';

const EventItem = ({event,deleteAuthority,parent,reload}) => {
    const {setDialog,screenSize,setLoading} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [tariff,setTariff] = useState(null);
    const {currentUserId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();

    let USDecimal = new Intl.NumberFormat('en-US',{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const EVENTS = 'events';
    const MY_EVENTS = 'my_events';

    const navigate = useNavigate();

    const onRegister = (e) => {
        e.preventDefault();
        if(!currentUserId) {
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
                            let paid = false;
                            await request('GET','paid',null,{receivableId:event.id},true)
                            .then((response) => {
                                if(response.status == 'YES') {
                                    paid = true;
                                }
                            })
                            if(paid) {
                                await request('POST','event/user/self',null,{eventId:event.id},true);
                            } else {
                                await request('GET','tariff/receivable',null,{receivableId:event.id,rootValueId:currentUserId},true)
                                .then(async (response) => {
                                    if(response.status && response.status === 'SUCCESSFUL') {
                                        if(response.content && response.content.price > 0) {
                                            navigate(`/payment_options/${currentUserId}/${tariff.receivableId}/${tariff.criteriaId}`,{state:{parentPath:path}})
                                        } else {
                                            await request('POST','event/user/self',null,{eventId:event.id},true);
                                        }
                                    }
                                })
                            }
                        } else {
                            await request('POST','event/user/self',null,{eventId:event.id},true);
                        }
                        reload && reload();
                        setLoading(false);
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
            {event && parent &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/${currentUserId}/${parent}/${event.id}`,{state:{parentPath:path}})}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiCalendarDotLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${event.name}`}
                        </p>
                        {event.tariffApplicable? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{tariff && tariff.price?`K ${USDecimal.format(tariff.price)}`:'No default tariff'}</p>
                            </div>
                            :
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </div>
                {(highlighted || screenSize === 'xs') && parent && 
                    <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                        {parent === EVENTS && deleteAuthority?
                            <button onClick={onDelete}
                                className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-500 rounded-full'>
                                <PiTrash size={20} />
                            </button>:
                        parent === MY_EVENTS?
                            <button onClick={onRegister}
                                className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-[rgb(0,175,240)] rounded-full'>
                                <PiUserPlus size={20}/>
                            </button>:
                            <></>
                        }
                    </div>
                }
            </div>}
        </div>
    )
}

export default EventItem