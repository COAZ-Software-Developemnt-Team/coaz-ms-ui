import React, {useState, useEffect, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Message from './Message'
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Login2 from './Login';
import {useData} from '../data';

const FinishRegistration = ({user,reload}) => {
    const {setLoading,setAccess} = useContext(GlobalContext);
    const [newUsername,setNewUsername] = useState('');
    const [email,setEmail] = useState(user?user.email:'');
    const [oldPassword,setOldPassword] = useState('');
    const [newPassword,setNewPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [message,setMessage] = useState({content:'',success:false}); 
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();

    const submit = async (e) => {
        setLoading(true);
        setMessage({content:'',success:true});
        if(user && newPassword === confirmPassword) {
            request('PUT','user/finishregistration',null,{
                userId:user.id,
                newUsername:newUsername,
                email:email,
                oldPassword:oldPassword,
                newPassword:newPassword
            })
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL') {
                        setAccess({Component:() => <Login2 reload={reload}/>})
                    } else {
                        setMessage({content:response.message,success:false});
                    }
                } else  {
                    setMessage({content:response,success:false});
                }
            })
            .catch((error) => {
                setLoading(false);
                setMessage({content:error.message,success:false});
            });
        } else {
            setLoading(false);
            setMessage({content:"New password and confirm password didn't match, try again!",success:false});
        }
    };

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);

    const inputs = [
        {
            label:"Firstname",
            type:"text", 
            id:"firstname", 
            name:"firstname",  
            value:user?user.firstname:'',
            disabled:true
        },
        {
            label:"Lastname",
            type:"text", 
            id:"lastname", 
            name:"lastname",  
            value:user?user.lastname:'',
            disabled:true
        },
        {
            label:"Current username",
            type:"text", 
            id:"username", 
            name:"username",  
            value:user?user.username:'',
            disabled:true
        },
        {
            label:"New username",
            type:"text", 
            id:"newUsername", 
            name:"newUsername",  
            value:newUsername,
            placeholder:"Enter new username...",
            onChange:(e) => handleChange(e,(e) => {
                setNewUsername(e.target.value);
            }),
            register:register,
            errors:errors
        },
        {
            label:"Email",
            type:"text",
            id:"email", 
            name:"email",  
            value:email,
            placeholder:"Enter email...",
            onChange:(e) => handleChange(e,(e) => {
                setEmail(e.target.value);
            }),
            register:register,
            errors:errors
        },
        {
            label:"Old password",
            type:"password",
            id:"oldPassword", 
            name:"oldPassword",  
            value:oldPassword,
            placeholder:"Enter old password...",
            onChange:(e) => handleChange(e,(e) => {
                setOldPassword(e.target.value);
            }),
            register:register,
            errors:errors
        },
        { 
            label:"New password",
            type:"password",
            id:"newPassword", 
            name:"newPassword",  
            value:newPassword,
            placeholder:"Enter new password...",
            onChange:(e) => handleChange(e,(e) => {
                setNewPassword(e.target.value);
            }),
            register:register,
            errors:errors
        },
        { 
            label:"Confirm password",
            type:"password",
            id:"confirmPassword", 
            name:"confirmPassword",  
            value:confirmPassword,
            placeholder:"Confirm password...",
            onChange:(e) => handleChange(e,(e) => {
                setConfirmPassword(e.target.value);
            }),
            register:register,
            errors:errors
        }
    ]

    return (
        <div className='relative flex flex-col w-[95%] sm:w-[640px] h-[95%] sm:h-fit p-8 bg-white rounded-xl shadow-md'>
            <FormValidator>
                <Scrollable vertical={true}>
                    <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='finish_reg' setCalcWidth={setInputWidth}/>
                    <Message message={message}/>
                    <button style={{'--width':inputWidth+'px'}} 
                        onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                        Submit
                    </button>
                </Scrollable>
            </FormValidator>
        </div>
    )
}

export default FinishRegistration
