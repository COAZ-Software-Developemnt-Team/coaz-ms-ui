import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate } from 'react-router-dom';
import FormValidator, {useFormValidator} from './FormValidator';
import Scrollable from './Scrollable';
import Inputs from './Inputs';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data';
import TextArea from './TextArea';

const AddEventDay = ({eventId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [eventDay,setEventDay] = useState({});
    const [event,setEvent] = useState(null);
    const [message,setMessage] = useState({content:'',success:false});
    const {request} = useData();
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const onDate = (e) => {
        const value = e.target.value;
        setEventDay({...eventDay, [e.target.name]: new Date(value)});
    };

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(eventDay && event) {
            setLoading(true);
            eventDay.event = event;
            request('POST','event/day',eventDay,null,true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL') {
                        reload && reload();
                        setDialog(null);
                    } else {
                        setMessage({content:response.message,success:false});
                    }
                } else  {
                    setMessage({content:response,success:false});
                }
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
                setLoading(false);
            });
        }
    };

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);

    const inputs = [
        {
            label:'Event',
            type:'text', 
            name:'event',
            value:event?event.name:'',
            disabled:true
        },
        {
            label:'Date',
            type:'date', 
            name:'date',
            value:eventDay && eventDay.date?eventDay.date.toISOString().slice(0, 10):'',   
            placeholder:'Enter description...',
            onChange:(e) => handleChange(e,onDate),
            register:register,
            errors:errors
        },
        {
            label:'Start',
            id:'start',
            type:'time', 
            value:eventDay? {
                hour:eventDay.startHour?eventDay.startHour:'',
                min:eventDay.startMin?eventDay.startMin:''
            }:null,   
            onChange:(e) => {handleChange(e,(e)=>{
                if(e.target.name.includes('hour')) {
                    setEventDay({...eventDay,startHour:e.target.value});
                } else if(e.target.name.includes('min')) {
                    setEventDay({...eventDay,startMin:e.target.value});
                }
            })},
            register:register,
            errors:errors
        },
        {
            label:'End',
            id:'end',
            type:'time', 
            value:eventDay? {
                hour:eventDay.endHour?eventDay.endHour:'',
                min:eventDay.endMin?eventDay.endMin:''
            }:null,   
            onChange:(e) => {handleChange(e,(e)=>{
                if(e.target.name.includes('hour')) {
                    setEventDay({...eventDay,endHour:e.target.value});
                } else if(e.target.name.includes('min')) {
                    setEventDay({...eventDay,endMin:e.target.value});
                }
            })},
            register:register,
            errors:errors
        }
    ]

    useEffect(() => {
        request('GET',`event/${eventId}`,null,null,false)
        .then((response) => {
            if(response.content) {
                setEvent(response.content);
            }
        })
    },[])
    return (
        <FormDialog title='Add Event Day'>
            {eventDay && <FormValidator>
                <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                    <Scrollable vertical={true}>
                        <div className='flex flex-col w-full h-auto shrink-0'>
                            <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                            <Message message={message}/>
                            <button style={{'--width':inputWidth+'px'}} 
                                onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                Submit
                            </button>
                        </div>
                    </Scrollable>
                </div>
            </FormValidator>}
        </FormDialog>
    )
}

export default AddEventDay