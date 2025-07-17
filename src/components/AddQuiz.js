import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data';

const AddQuiz = ({courseId,teacherId,topicId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [quiz,setQuiz] = useState({});
    const [courseClass,setCourseClass] = useState({});
    const [topic,setTopic] = useState(null);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();
    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(courseClass) {
            setLoading(true);
            quiz.courseClass = courseClass;
            quiz.topic = topic;
            request('POST','quiz',quiz,null,true)
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
            value:quiz && quiz.name?quiz.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Pass Grade',
            type:'number', 
            name:'passGrade',
            value:quiz && quiz.passGrade?quiz.passGrade:'',   
            placeholder:'Enter pass grade...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Duration in minutes',
            type:'number', 
            name:'duration',
            value:quiz && quiz.duration?quiz.duration:'',   
            placeholder:'Enter duration...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Maximum Attempts',
            type:'number', 
            name:'attempts',
            value:quiz && quiz.attempts?quiz.attempts:'',   
            placeholder:'Enter attempts...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setQuiz({...quiz, [e.target.name]: null});
        } else {
            setQuiz({...quiz, [e.target.name]: value});
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
            <FormDialog title='Add quiz'>
                <div className='flex w-full sm:w-[640px] h-full sm:h-[500px] p-8'>
                    <Scrollable vertical={true}>
                        {quiz && <FormValidator>
                            <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_quiz' setCalcWidth={setInputWidth}/>
                                <Message message={message}/>
                                <button style={{'--width':inputWidth+'px'}} 
                                    onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                    Submit
                                </button>
                            </div>
                        </FormValidator>}
                    </Scrollable>
                </div>
            </FormDialog>
        </div>
    )
}

export default AddQuiz