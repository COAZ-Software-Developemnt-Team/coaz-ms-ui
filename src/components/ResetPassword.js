import React, {useState, useContext, useEffect} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { PiLockKeyOpenDuotone } from "react-icons/pi";
import FormValidator, {useFormValidator} from './FormValidator';
import Scrollable from './Scrollable';
import Inputs from './Inputs';
import FormDialog from './FormDialog';
import Message from './Message';
import {useData} from '../data'

const ResetPassword = ({userId}) => {
    const {setLoading,setDialog,logout} = useContext(GlobalContext);
    const [username,setUsername] = useState('');
    const [autoPassword, setAutoPassword] = useState(true);
    const [newPassword, setNewPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [message,setMessage] = useState({content:'',success:false}); 
    const {request} = useData();

    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(newPassword === confirmPassword) {
            setLoading(true);
            request('PUT','user/resetpassword',null,
            {
                userId:userId,
                autoPassword:autoPassword,
                password:newPassword
            },true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL') {
                        setDialog(null);
                    } else {
                        setMessage({content:response.message,success:false});
                    }
                } else  {
                    setMessage({content:response,success:false});
                }
            })
            .catch((error) => {
                logout();
                setMessage({content:error.message,success:false});
                setLoading(false);
            });
        } else {
            setMessage({content:"New password and confirm password didn't match, try again!",success:false});
        }
    };

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);

    const inputs = [
        {
            label:"Username",
            type:"text", 
            id:"username", 
            name:"username",  
            value:username,
            placeholder:"Enter username...",
            disable:true
        },
        {
            label:"Auto password",
            type:'checkbox', 
            name:"autoPassword",  
            value:autoPassword,
            onChange:(e) => {
                setAutoPassword(!autoPassword)
            }
        },
        { 
            label:"New Password",
            type:"password",
            id:"newPassword", 
            name:"newPassword",  
            value:newPassword,
            placeholder:"Enter new password...",
            onChange:(e) => handleChange(e,(e) => {
                setNewPassword(e.target.value);
            }),
            disabled:autoPassword,
            register:register,
            errors:errors
        },
        { 
            label:"Confirm Password",
            type:"password",
            id:"confirmPassword", 
            name:"confirmPassword",  
            value:confirmPassword,
            placeholder:"Confirm password...",
            onChange:(e) => handleChange(e,(e) => {
                setConfirmPassword(e.target.value);
            }),
            disabled:autoPassword,
            register:register,
            errors:errors
        }
    ]

    useEffect(() => {
        request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                request('GET',`user/${userId}`,null,null,true)
                .then((userResponse) => {
                    if(userResponse.status === 'SUCCESSFUL' && userResponse.content && 
                        (userResponse.content.status === 'ACTIVE' || userResponse.content.status === 'OTP')  && 
                        userResponse.content.username) {
                        setUsername(userResponse.content.username);
                    } else {
                        setDialog(null);
                    }
                })
                .catch((error) => {
                    setDialog(null);
                })
            } else {
                setDialog(null);
            }
        })
        .catch((error) => {
            setDialog(null);
        })
    },[])

    return (
        <FormDialog title='Reset password'>
            <FormValidator>
                <div className='flex flex-col w-full h-auto p-8'>
                    <div className='flex flex-col w-full h-full no-scrollbar space-y-8 overflow-auto'>
                        <PiLockKeyOpenDuotone size={64} className='flex mx-auto mb-4 text-[rgb(0,175,240)] shrink-0'/>
                        <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='finish_registration' setCalcWidth={setInputWidth}/>
                        <Message message={message}/>
                        <button style={{width:inputWidth+'px'}} 
                            onClick={handleSubmit} className='flex shrink-0 h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                            Submit
                        </button>
                    </div>
                </div>
            </FormValidator>
        </FormDialog>
    )
}

export default ResetPassword
