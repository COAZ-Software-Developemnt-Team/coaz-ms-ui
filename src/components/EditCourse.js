import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data';
import TextArea from './TextArea';

const EditCourse = ({id,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [course,setCourse] = useState(null);
    const [professionalCategories,setProfessionalCategories] = useState([]);
    const [criteriaPaths,setCriteriaPaths] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('PUT','course',course,null,true)
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
            label:'Available from',
            type:'date',
            name:'availableFrom', 
            value:course && course.availableFrom?course.availableFrom.toISOString().slice(0, 10):'',
            placeholder:'Available from...',
            onChange:(e) => handleChange(e,onDate)
        },
        {
            label:'Available upto',
            type:'date',
            name:'availableTo', 
            value:course && course.availableTo?course.availableTo.toISOString().slice(0, 10):'',
            placeholder:'Available upto...',
            onChange:(e) => handleChange(e,onDate)
        },
        {
            label:'Visible when unavailable',
            type:'checkbox',
            name:'visibleWhenUnavailable',
            value:course?course.visibleWhenUnavailable:false,   
            onChange:(e) => {
                setCourse({...course,visibleWhenUnavailable: !course.visibleWhenUnavailable});
            }
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

    const onDate = (e) => {
        const value = e.target.value;
        setCourse({...course, [e.target.name]: new Date(value)});
    };

    const onCriteriaPath = (e) => {
        if(e.target.value === '') {
            setCourse({...course, [e.target.name]: null});
        } else {
            let value = criteriaPaths.find((path) => {return path.id === e.target.value});
            setCourse({...course, criteriaPathItem: value});
        }
    }

    useEffect(() => {
        ( async () => {
            setLoading(true);
            let cours = null;
            await request('GET',`course/${id}`,null,null,true)
            .then(async (response) => {
                setLoading(false);
                if(response.content) {
                    response.content.availableFrom = response.content.availableFrom?new Date(response.content.availableFrom):null;
                    response.content.availableTo = response.content.availableTo?new Date(response.content.availableTo):null;
                    cours = response.content;
                }  else {
                    setCourse(null);
                    setDialog(null);
                }
            })
            .catch((error) => {
                console.log(error.message);
                setLoading(false);
                setCourse(null);
                setDialog(null);
            })
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

            await request('GET','criteriapath/leaves',null,null,true)
            .then((response) => {
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.content && response.content.length > 0) {
                        setCriteriaPaths(response.content);
                        if(cours && !cours.criteriaPathItem) {
                            cours.criteriaPathItem = response.content[0];
                        }
                    } else {
                        setCriteriaPaths([]);
                    }
                } else  {
                    setCriteriaPaths([]);
                }
            })
            setCourse(cours);
        }
        )();
    },[]);

    return (
        <FormDialog title='Edit Course'>
            {course && <FormValidator>
                <div className='flex flex-col w-full h-auto p-8'>
                    <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_course' setCalcWidth={setInputWidth}/>
                    <TextArea
                        label='Description'
                        id='description'
                        name='description'
                        value={course.description?course.description:''}
                        placeholder='Enter description'
                        onChange={(e) => handleChange(e,onChange)}
                    />
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

export default EditCourse