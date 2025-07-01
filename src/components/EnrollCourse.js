import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import { request } from '../App';

const EnrollCourse = ({courseId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [course,setCourse] = useState({});
    const [classes,setCourseClasses] = useState([]);
    const [courseClass,setCourseClass] = useState(null)
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(course && courseClass) {
            setLoading(true);
            request('POST','enrollment/course',null,{courseId:course.id,teacherId:courseClass.teacher.id},true)
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
            value:course && course.name?course.name:'',
            disabled:true
        },
        {
            label:'courseClass',
            type:'select',
            options:() => {
                let options = [];
                classes && classes.map((option,i) => options.push(<option key={i} value={option.teacher.id}>{option.teacher.name}</option>));
                return options;
            },
            name:'courseClass', 
            value:courseClass && courseClass.teacher?courseClass.teacher.id:'',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        }
    ]

    const onChange = (e) => {
        if(e.target.value === '') {
            setCourseClass(null);
        } else {
            let value = classes.find((clas) => {return clas.teacher.id == e.target.value});
            setCourseClass(value);
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
        request('GET','classes/course',null,{courseId:courseId},true)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content && response.content.length > 0) {

                    setCourseClasses(response.content);
                    setCourseClass(response.content[0]);
                } else {
                    setCourseClasses([]);
                }
            } else  {
                setCourseClasses([]);
            }
        })
    },[courseId]);

    return (
        <div>
            <FormDialog title='Enroll'>
                <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
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
            </FormDialog>
        </div>
      )
}

export default EnrollCourse