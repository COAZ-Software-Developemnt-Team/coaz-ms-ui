import React, {useState, useEffect, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Message from './Message'
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Login2 from './Login';
import {useData} from '../data';
import { useLocation,useNavigate } from 'react-router-dom';
import Access from './Access';
import { PiUserDuotone } from 'react-icons/pi';
import {useIAgree,IAgree} from './PrivacyPolicy';

const FinishRegistration = () => {
    const {setLoading,setAccess} = useContext(GlobalContext);
    const [newUsername,setNewUsername] = useState('');
    const [oldPassword,setOldPassword] = useState('');
    const [newPassword,setNewPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [message,setMessage] = useState({content:'',success:false}); 
    const location = useLocation();
    const state = location.state;
    const [email,setEmail] = useState(state && state.user?state.user.email:'');
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();

    const {iAgree,setIAgree} = useIAgree();

    const navigate = useNavigate();

    const close = () => {
        navigate('/home')
    }

    const submit = async (e) => {
        setLoading(true);
        setMessage({content:'',success:true});
        if(state && state.user && newPassword === confirmPassword) {
            await request('PUT','user/finishregistration',null,{
                userId:state.user.id,
                newUsername:newUsername,
                email:email,
                oldPassword:oldPassword,
                newPassword:newPassword
            })
            .then((response) => {
                if(response.status) {
                    if(response.status === 'SUCCESSFUL') {
                        navigate('/login');
                    } else {
                        setMessage({content:response.message,success:false});
                    }
                } else  {
                    setMessage({content:response,success:false});
                }
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
            });
            setLoading(false);
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
            value:state && state.user?state.user.firstname:'',
            disabled:true
        },
        {
            label:"Lastname",
            type:"text", 
            id:"lastname", 
            name:"lastname",  
            value:state && state.user?state.user.lastname:'',
            disabled:true
        },
        {
            label:"Current username",
            type:"text", 
            id:"username", 
            name:"username",  
            value:state && state.user?state.user.username:'',
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
        <Access onClose={close}>
            <div className='relative flex flex-col w-[95%] sm:w-[640px] h-[95%] sm:h-fit space-y-4 p-8 bg-white rounded-xl shadow-md'>
                <div className='flex flex-col w-full h-fit items-center justify-center text-[rgb(0,175,240)]'>
                    <PiUserDuotone size={64}/>
                    <span className='text-lg font-helveticaNeueRegular uppercase tracking-wider'>Finish Registration</span>
                </div>
                <FormValidator>
                    <Scrollable vertical={true}>
                        <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='finish_reg' setCalcWidth={setInputWidth}/>
                        <Message message={message}/>
                        <IAgree iAgree={iAgree} setIAgree={setIAgree}/>
                        <button style={{'--width':inputWidth+'px'}} 
                            onClick={handleSubmit}
                            disabled={!iAgree}
                            className={`flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center ${iAgree?'bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)]':'bg-gray-300'} text-white`}>
                            Submit
                        </button>
                    </Scrollable>
                </FormValidator>
            </div>
        </Access>
    )
}

export default FinishRegistration
