import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {request} from '../App'

const AddHtmlResource = ({courseId,teacherId,topicId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [resource,setResource] = useState({});
    const [courseClass,setCourseClass] = useState(null);
    const [topic,setTopic] = useState(null);
    const [file,setFile] = useState(null);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(courseClass) {
            setLoading(true);
            resource.courseClass = courseClass;
            resource.topic = topic;
            const formData = new FormData();
            formData.append('resource', new Blob([JSON.stringify(resource)],{type:'application/json'}));
            formData.append('file',file);
            request('POST','resource/html',formData,null,true)
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
            label:'Course',
            type:'text', 
            name:'course',
            disabled:true,
            value:courseClass && courseClass.course?courseClass.course.name:'',   
            placeholder:'Enter course...'
        },
        {
            label:'Topic',
            type:'text', 
            name:'topic',
            disabled:true,
            value:topic?topic.name:'',   
            placeholder:'Enter topic...'
        },
        {
            label:'Teacher',
            type:'text', 
            name:'teacher',
            disabled:true,
            value:courseClass && courseClass.teacher?courseClass.teacher.name:'',   
            placeholder:'Enter teacher...'
        },
        {
            label:'Name',
            type:'text', 
            name:'name',
            value:resource && resource.name?resource.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Minimum view minutes',
            type:'number', 
            name:'minimumViewMinutes',
            value:resource && resource.minimumViewMinutes?resource.minimumViewMinutes:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,(e) => {
                const value = e.target.value;
                if(isNaN(value)) {
                    return;
                }
                if(value === '' && value) {
                    setResource({...resource, minimumViewMinutes: null});
                } else {
                    setResource({...resource, minimumViewMinutes: value});
                }
            })},
            register:register,
            errors:errors
        },
        {
            label:'Upload Html',
            type:'file', 
            name:'fileName',
            accept:'.zip',   
            placeholder:'Upload file...',
            onChange:(e) => {handleChange(e,(e) => {
                setFile(e.target.files[0]);
            })},
            register:register,
            errors:errors
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setResource({...resource, [e.target.name]: null});
        } else {
            setResource({...resource, [e.target.name]: value});
        }
    }

    useEffect(() => {
        if(courseId && teacherId) {
            request('GET','class',null,{
                courseId:courseId,
                teacherId:teacherId
            },true)
            .then((response) => {
                if(response.content) {
                    setCourseClass(response.content);
                } else {
                    setDialog(null);
                }
            })
            .catch((error) => {
                setDialog(null);
            })
        }
        if(topicId) {
            request('GET',`topic/${topicId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setTopic(response.content);
                } else {
                    setDialog(null);
                }
            })
            .catch((error) => {
                setDialog(null);
            })
        }
    },[]);

    return (
        <div>
            <FormDialog title='Add html resource'>
                {resource && <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_resource' setCalcWidth={setInputWidth}/>
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

export default AddHtmlResource