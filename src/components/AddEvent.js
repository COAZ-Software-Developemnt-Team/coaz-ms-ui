import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Scrollable from './Scrollable';
import Inputs from './Inputs';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../App';
import TextArea from './TextArea';

const AddEvent = ({reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [event,setEvent] = useState({});
    const [criteriaPaths,setCriteriaPaths] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const [request] = useData()
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setEvent({...event, [e.target.name]: null});
        } else {
            setEvent({...event, [e.target.name]: value});
        }
    }

    const onCriteriaPath = (e) => {
        if(e.target.value === '') {
            setEvent({...event, [e.target.name]: null});
        } else {
            let value = criteriaPaths.find((path) => {return path.id === e.target.value});
            setEvent({...event, criteriaPathItem: value});
        }
    }

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('POST','event',event,null,true)
        .then((response) => {
            setLoading(false);
            if(response.status) {
                if(response.status === 'SUCCESSFUL') {
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
            value:event && event.name?event.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Tariff Applicable',
            type:'checkbox',
            name:'tariffApplicable',
            value:event?event.tariffApplicable:false,   
            onChange:(e) => {
                setEvent({...event,tariffApplicable: !event.tariffApplicable});
            }
        },
        {
            label:'Criteria paths',
            type:'select',
            options:() => {
                let options = [];
                event && event.tariffApplicable && criteriaPaths.map((option,i) => options.push(<option key={i} value={option.id}>{option.id}</option>));
                return options;
            },
            name:'criteriaPathItem', 
            value:event && event.criteriaPathItem?event.criteriaPathItem.id:'',
            disabled:event && !event.tariffApplicable,
            onChange:(e) => handleChange(e,onCriteriaPath)
        }
    ]

    useEffect(() => {
        request('GET','criteriapath/leaves',null,null,true)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content && response.content.length > 0) {
                    setCriteriaPaths(response.content);
                    setEvent({...event, criteriaPathItem: response.content[0]});
                } else {
                    setCriteriaPaths([]);
                }
            } else  {
                setCriteriaPaths([]);
            }
        })
    },[])

    return (
        <FormDialog title='Add Event'>
            {event && <FormValidator>
                <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                    <Scrollable vertical={true}>
                        <div className='flex flex-col w-full h-auto shrink-0 space-y-2'>
                            <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                            <TextArea
                                label='Description'
                                id='description'
                                name='description'
                                value={event.description?event.description:''}
                                placeholder='Enter description'
                                onChange={(e) => handleChange(e,onChange)}
                            /> 
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
    )
}

export default AddEvent