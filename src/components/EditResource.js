import React, {useEffect,useState, useContext,} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {request} from '../App';

const EditResource = ({id, update}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [resource,setResource] = useState({});
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(module) {
            setLoading(true);
            request('PUT','resource',resource,null,true)
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
            label:'topic',
            type:'text', 
            name:'topic',
            disabled:true,
            value:resource && resource.topic && resource.topic.name?resource.topic.name:'',   
            placeholder:'Enter name...'
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
            label:'File name',
            type:'text', 
            name:'fileName',
            disabled:true,
            value:resource && resource.fileName?resource.fileName:''
        },
        {
            type:'blank'
        },
        {
            label:'Completion by View',
            type:'checkbox',
            name:'completionByView',
            value:resource && resource.completionByView,
            disabled: false,
            onChange:(e) => {
              setResource({...resource,completionByView: !resource.completionByView});
            }
        },
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
        (async () => {
            if(id) {
                await request('GET',`resource/${id}`,null,null,true)
                .then((response) => {
                    if(response.content) {
                        setResource(response.content);
                    }
                })
            }
        })()
    },[]);

    return (
        <div>
            <FormDialog title='Edit resource'>
                {resource && <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-[380px] p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='edit_resource' setCalcWidth={setInputWidth}/>
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

export default EditResource