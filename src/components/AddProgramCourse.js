import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data';

const AddProgramCourse = ({programId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [program,setProgram] = useState({});
    const [course,setCourse] = useState(null);
    const [courses,setCourses] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const {request} = useData();
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(program && course) {
            setLoading(true);
            request('POST','programcourse',null,{
                programId:program.id,
                courseId:course.id
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
            value:program && program.name?program.name:'',   
            placeholder:'Enter program...'
        },
        {
            label:'CPD',
            type:'select',
            options:() => {
                let options = [];
                courses.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'course', 
            value:course?course.id:'',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        }
    ]

    const onChange =  (e) => {
        if(e.target.value === '') {
            setCourse(null);
        } else {
            let value = courses.find((cours) => {return cours.id == e.target.value});
            if(value) {
                setCourse(value);
            } else {
                setCourse(null);
            }
            
        }
    }

    useEffect(() => {
        (async () => {
            await request('GET',`program/${programId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setProgram(response.content);
                } else {
                    setDialog(null);
                }
            })
            .catch((error) => {
                setDialog(null);
            })

            let programCourses = []
            await request('GET','programcourses/program',null,{
                programId:programId
            },true)
            .then((response) => {
                if(response.content && response.content.length > 0) {
                    programCourses = response.content;
                }
            })
            await request('GET','courses/all',null,null,true)
            .then((response) => {
                if(response.content && response.content.length > 0) {
                    let arr = [];
                    for(let course of response.content) {
                        let found = false;
                        for(let programCourse of programCourses) {
                            if(programCourse.courseId === course.id) {
                                found = true;
                            }
                        }
                        if(!found) {
                            arr.push(course);
                        }
                    }
                    if(arr.length > 0) {
                        setCourses(arr);
                        setCourse(arr[0])
                    } else {
                        setDialog(null);
                    }
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
                {program && <FormValidator>
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

export default AddProgramCourse