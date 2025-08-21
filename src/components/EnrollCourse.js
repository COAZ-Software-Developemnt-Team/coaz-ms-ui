import React, {useEffect,useState, useContext, useRef} from 'react';
import { useLocation,useNavigate,useParams } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import MessageDialog from './MessageDialog';
import {useData} from '../data';
import Access from './Access';
import { PiStudentDuotone } from 'react-icons/pi';

const EnrollCourse = () => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [course,setCourse] = useState({});
    const [courseTeachers,setCourseTeachers] = useState([]);
    const [courseTeacher,setCourseTeacher] = useState(null)
    const [message,setMessage] = useState({content:'',success:false});
    const {currentUserId,courseId} = useParams();
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const location = useLocation();
    const state = location.state;
    const path = useLocation().pathname;
    const {request} = useData();

    const navigate = useNavigate();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(course && courseTeacher) {
            setLoading(true);
            request('POST','enrollment/course',null,{courseId:course.id,teacherId:courseTeacher.teacher.id},true)
            .then((response) => {
                setLoading(false);
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    setDialog(null);
                    if(!response.content.paid && response.content.tariff) {
                        navigate(`/payment_options/${currentUserId}/${response.content.tariff.receivableId}/${response.content.tariff.criteriaId}`,{state:{parentPath:path}})
                    } else if(response.content.paid) {
                        close();
                    }
                } else if(response.message) {
                    setDialog({
                        show:true,
                        Component:() => 
                            <MessageDialog 
                                title='Message' 
                                message={response.message} 
                            />
                    })
                } else {
                    setDialog({
                        show:true,
                        Component:() => 
                            <MessageDialog 
                                title='Message' 
                                message={response} 
                            />
                    })
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
            value:course && course.name?course.name:'',
            disabled:true
        },
        {
            label:'Teacher',
            type:'select',
            options:() => {
                let options = [];
                courseTeachers && courseTeachers.map((option,i) => options.push(<option key={i} value={option.teacher.id}>{option.teacher.name}</option>));
                return options;
            },
            name:'courseTeacher', 
            value:courseTeacher && courseTeacher.teacher?courseTeacher.teacher.id:'',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        }
    ]

    const close = () => {
        navigate(state && state.parentPath?state.parentPath:currentUserId?`/${currentUserId}/home`:'/home')
    }


    const onChange = (e) => {
        if(e.target.value === '') {
            setCourseTeacher(null);
        } else {
            let value = courseTeachers.find((clas) => {return clas.teacher.id == e.target.value});
            setCourseTeacher(value);
        }
    }

    useEffect(() => {
        request('GET',`course/${courseId}`,null,null,true)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content) {
                    setCourse(response.content);
                } else {
                    setCourse(null);
                }
            } else  {
                setCourse(null);
            }
        })
        request('GET','courseteachers/course',null,{courseId:courseId},true)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content && response.content.length > 0) {
                    setCourseTeachers(response.content);
                    setCourseTeacher(response.content[0]);
                } else {
                    setCourseTeachers([]);
                }
            } else  {
                setCourseTeachers([]);
            }
        })
    },[courseId]);

    return (
        <div>
            <Access onClose={close}>
                <FormValidator>
                    <div className='flex flex-col w-[95%] sm:w-[640px] h-fit p-4 space-y-8 bg-white shadow-lg rounded-md'>
                        <div className='flex flex-col w-full h-fit items-center justify-center text-[rgb(0,175,240)]'>
                            <PiStudentDuotone size={64}/>
                            <span className='text-lg font-helveticaNeueRegular uppercase tracking-wider'>CPD Enrollment</span>
                        </div>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto space-y-4 shrink-0'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='enroll_course' setCalcWidth={setInputWidth}/>
                                <Message message={message}/>
                                <button style={{'--width':inputWidth+'px'}} 
                                    onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                    Submit
                                </button>
                            </div>
                        </Scrollable>
                    </div>
                </FormValidator>
            </Access>
        </div>
      )
}

export default EnrollCourse