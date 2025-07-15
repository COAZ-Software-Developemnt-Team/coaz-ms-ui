import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Message from './Message';
import FormDialog from './FormDialog';
import {request} from '../App';

const AddCourse = ({reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [course,setCourse] = useState({});
    const [professionalCategories,setProfessionalCategories] = useState([]);
    const [criteriaPaths,setCriteriaPaths] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('POST','course',course,null,true)
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
    };

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);

    const inputs = [
        {
            label:'name',
            type:'text', 
            name:'name',
            value:course && course.name?course.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'External Id',
            type:'number', 
            name:'externalId',
            value:course && course.externalId?course.externalId:'',   
            placeholder:'Enter external id...',
            onChange:(e) => {handleChange(e,onNumber)},
            register:register,
            errors:errors
        },
        {
            label:'Points',
            type:'number', 
            name:'points',
            value:course && course.points?course.points:'',   
            placeholder:'Enter points...',
            onChange:(e) => {handleChange(e,onNumber)}
        },
        {
            label:'Professional Category',
            type:'select',
            options:() => {
                let options = [<option value={''}>None</option>];
                professionalCategories.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'professionalCategory', 
            value:course && course.professionalCategory?course.professionalCategory:'',
            placeholder:'Select professional category...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Tariff Applicable',
            type:'checkbox',
            name:'tariffApplicable',
            value:course?course.tariffApplicable:false,   
            onChange:(e) => {
                setCourse({...course,tariffApplicable: !course.tariffApplicable});
            }
        },
        {
            label:'Criteria paths',
            type:'select',
            options:() => {
                let options = [];
                course && course.tariffApplicable && criteriaPaths.map((option,i) => options.push(<option key={i} value={option.id}>{option.id}</option>));
                return options;
            },
            name:'criteriaPathItem', 
            value:course && course.criteriaPathItem?course.criteriaPathItem.id:'',
            disabled:course && !course.tariffApplicable,
            onChange:(e) => handleChange(e,onCriteriaPath)
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
          setCourse({...course, [e.target.name]: null});
        } else {
          setCourse({...course, [e.target.name]: value});
        }
    }

    const onNumber = (e) => {
        const value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        if(value === '' && value) {
          setCourse({...course, [e.target.name]: null});
        } else {
          setCourse({...course, [e.target.name]: value});
        }
    }

    const onCriteriaPath = (e) => {
        if(e.target.value === '') {
            setCourse({...course, [e.target.name]: null});
        } else {
            let value = criteriaPaths.find((path) => {return path.id === e.target.value});
            setCourse({...course, criteriaPathItem: value});
        }
    }

    useEffect(() => {
        request('GET','professionalcategories',null,null,false)
        .then((response) => {
            if(response.content) {
                setProfessionalCategories(response.content);
            }  else {
                setProfessionalCategories([]);
            }
        })
        .catch((error) => {
            setProfessionalCategories([]);
        })

        request('GET','criteriapath/leaves',null,null,true)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content && response.content.length > 0) {
                    setCriteriaPaths(response.content);
                    setCourse({...course, criteriaPathItem: response.content[0]});
                } else {
                    setCriteriaPaths([]);
                }
            } else  {
                setCriteriaPaths([]);
            }
        })
    },[]);

    return (
        <FormDialog title='Add Course'>
            {course && <FormValidator>
                <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                    <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_course' setCalcWidth={setInputWidth}/>
                    <Message message={message}/>
                    <button style={{'--width':inputWidth+'px'}} 
                        onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                        Submit
                    </button>
                </div>
            </FormValidator>}
        </FormDialog>
      )
}

export default AddCourse