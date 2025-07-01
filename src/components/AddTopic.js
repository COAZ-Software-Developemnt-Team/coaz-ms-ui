import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {request} from '../App'

const AddTopic = ({courseId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [topic,setTopic] = useState({});
    const [course,setCourse] = useState(null);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(course) {
            setLoading(true);
            topic.course = course;
            request('POST','topic',topic,null,true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.content) {
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
            label:'cpd',
            type:'text', 
            name:'cpd',
            disabled:true,
            value:course && course.name?course.name:'',   
            placeholder:'Enter name...'
        },
        {
            label:'Name',
            type:'text', 
            name:'name',
            value:topic && topic.name?topic.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setTopic({...topic, [e.target.name]: null});
        } else {
            setTopic({...topic, [e.target.name]: value});
        }
    }

    useEffect(() => {
        (async () => {
            await request('GET',`course/${courseId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setCourse(response.content);
                } else {
                    setDialog(null);
                }
            })
            .catch((error) => {
                setDialog(null);
            })
        })()
    },[]);

    return (
        <div>
            <FormDialog title='Add Topic'>
                {topic && <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_topic' setCalcWidth={setInputWidth}/>
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
        </div>
    )
}

export default AddTopic