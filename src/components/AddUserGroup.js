import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data'

const AddUserGroup = ({reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [userGroup,setUserGroup] = useState({});
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 320;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();
    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('POST','usergroup',userGroup,null,true)
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
            Group:'text', 
            name:'name',
            value:userGroup && userGroup.name?userGroup.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setUserGroup({...userGroup, [e.target.name]: null});
        } else {
            setUserGroup({...userGroup, [e.target.name]: value});
        }
    }

    return (
        <div>
            <FormDialog title='Add User Group'>
                {userGroup && <FormValidator>
                    <div className='flex flex-col w-full h-auto p-8'>
                        <div className='flex flex-col w-full h-auto shrink-0'>
                            <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                            <Message message={message}/>
                            <button style={{'--width':inputWidth+'px'}} 
                                onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                Submit
                            </button>
                        </div>
                    </div>
                </FormValidator>}
            </FormDialog>
        </div>
      )
}

export default AddUserGroup