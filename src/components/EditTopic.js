import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../App';

const EditTopic = ({id,update}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [topic,setTopic] = useState({});
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [request] = useData();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(topic) {
            setLoading(true);
            await request('PUT','topic',topic,null,true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.content) {
                        update && update(response.content);
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
            value:topic && topic.course && topic.course.name?topic.course.name:''
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
        if(id) {
            request('GET',`topic/${id}`,null,null,true)          
            .then((response) => {
                if(response.status === 'SUCCESSFUL' && response.content) {
                  setTopic(response.content);
                } else {
                  setTopic(null);
                  setDialog(null);
                }
            })
            .catch((error) => {
               console.log(error);
               setTopic(null)
               setDialog(null);
            })
        }
    },[]);

    return (
        <div>
            <FormDialog title='Edit Topic'>
                {topic && <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-[240px] p-8'>
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

export default EditTopic