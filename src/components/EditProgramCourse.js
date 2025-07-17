import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data';

const EditProgramCourse = ({programId,courseId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [programCourse,setProgramCourse] = useState({});
    const [courseClasses,setCourseClasses] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(programCourse && programCourse.program && programCourse.course) {
            setLoading(true);
            request('POST','programcourse',null,{
                programId:programCourse.program.id,
                courseId:programCourse.course.id,
                teacherId:programCourse.courseClass && programCourse.courseClass.teacherId?programCourse.courseClass.teacherId:''
            },true)
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
            label:'Program',
            type:'text', 
            name:'program',
            disabled:true,
            value:programCourse && programCourse.program?programCourse.program.name:'',   
            placeholder:'Enter program...'
        },
        {
            label:'CPD',
            type:'text', 
            name:'course',
            disabled:true,
            value:programCourse && programCourse.course?programCourse.course.name:'',   
            placeholder:'Enter cpd...'
        },
        {
            label:'Teacher',
            type:'select',
            options:() => {
                let options = [<option value=''>None</option>];
                courseClasses.map((option,i) => options.push(<option key={i} value={option.teacherId?option.teacherId:''}>{option.teacher?option.teacher.name:''}</option>));
                return options;
            },
            name:'courseClass', 
            value:programCourse.courseClass && programCourse.courseClass.teacher?programCourse.courseClass.teacherId:'',
            onChange:(e) => handleChange(e,onCourseClass)
        }
    ]

    const onCourseClass = (e) => {
        const value = e.target.value;
        if(value == '') {
            setProgramCourse({...programCourse,teacherId:null,courseClass:null});
        } else {
            let found = courseClasses.find((cousClass) => {return cousClass.teacherId && cousClass.teacherId == value});
            setProgramCourse({...programCourse,teacherId:found.teacherId,courseClass:found});
        }
    }

    const initCourseClass = async (cous) => {
        if(cous) {
            await request('GET','classes/course',null,{courseId:cous.id},true)
            .then((response) => {
                if(response.content) {
                    setCourseClasses(response.content);
                } else {
                    setCourseClasses([])
                }
            })
            .catch ((error) => {
                setCourseClasses([])
            })
        } else {
            setCourseClasses([]) 
        }
    }

    useEffect(() => {
        (async () => {
            await request('GET','programcourse',null,{
                programId:programId,
                courseId:courseId
            },true)
            .then((response) => {
                if(response.content) {
                    setProgramCourse(response.content);
                    initCourseClass(response.content.course);
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
            <FormDialog title='Add CPD'>
                {programCourse && <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_course' setCalcWidth={setInputWidth}/>
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

export default EditProgramCourse