import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Input from './Input';
import TextArea from './TextArea';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {request} from '../App';

const AddQuestion = ({id,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [question,setQuestion] = useState({});
    const [message,setMessage] = useState({content:'',success:false});

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('POST','question',question,null,true)
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

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setQuestion({...question, [e.target.name]: null});
        } else {
            setQuestion({...question, [e.target.name]: value});
        }
    }

    useEffect(() => {
        ( async () => {
            setLoading(true);
            await request('GET',`activity/${id}`,null,null,true)
            .then((response) => {
                setLoading(false);
                if(response.content) {
                    setQuestion({...question,activity:response.content});
                } 
            })
            .catch((error) => {
                console.log(error.message);
                setLoading(false);
            })
        }
        )();
    },[]);

    return (
        <div>
            <FormDialog title='Add Question'>
                <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto space-y-4 shrink-0'>
                                <TextArea
                                    label='Description'
                                    id='description'
                                    name='description'
                                    value={question?question.description:''}
                                    placeholder='Enter description'
                                    onChange={(e) => handleChange(e,onChange)}
                                    register={register}
                                    errors={errors}
                                /> 
                                <Input
                                    label='Marks' 
                                    type='number'
                                    id='marks' 
                                    name='marks'
                                    value={question && question.marks?question.marks:''}
                                    onChange={(e) => handleChange(e,onChange)}
                                    register={register}
                                    errors={errors}
                                    width={256}
                                />
                                <Message message={message}/>
                                <button onClick={handleSubmit} className='flex shrink-0 w-64 h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
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

export default AddQuestion