import React, {useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { PiUser } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Message from './Message';
import Payment from './MobilePayment';
import FinishRegistration from './FinishRegistration';
import ChangePassword from './ChangePassword';
import AddUserSelf from './AddUserSelf';
import { useData } from '../data';

const Login = ({reload}) => {
    const {setDialog,setLoading,setAccess} = useContext(GlobalContext);
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState(""); 
    const [message,setMessage] = useState({content:'',success:false});
    const {request,login,logout} = useData();
    
    const onLogin = async (e) => {
        setLoading(true);
        e.preventDefault();
        setMessage({content:'',success:false});
        if(login) {
            await login(username,password)
            .then( (response) => {
                if(response.status) {
                    if(response.status === 'SUCCESSFUL') {
                        setAccess(null);
                    } else if(response.status === 'PENDING_PAYMENT' && response.user && response.tariff) {
                        setAccess({Component:() => <Payment user={response.user} tariff={response.tariff}  reload={reload}/>});
                    } else if(response.status === 'OTP' && response.user) {
                        setAccess({Component:() => <ChangePassword user={response.user} reload={reload}/>});
                    } else if(response.status === 'INCOMPLETE_REGISTRATION' && response.user) {
                        setAccess({Component:() => <FinishRegistration user={response.user} reload={reload}/>});
                    } else {
                        setMessage({content:response,success:false});
                    }
                } else if(response.error_message) {
                    setMessage({content:response.error_message,success:false});
                    logout()
                } else {
                    setMessage({content:response,success:false});
                    logout()
                }
                reload && reload()
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
                logout()
                reload && reload()
            })
            setLoading(false);
        }
    }; 

    const onCreateAccount = (e) => {
        e.preventDefault();
        setAccess({Component:() => <AddUserSelf/>})
    }

    const onForgotPassword = async (e) => {
        setLoading(true);
        setMessage({content:'',success:false});
        request('PUT','user/forgotpassword',null,{
            username:username
        },false)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL') {
                    setMessage({content:response.message,success:true});
                } else {
                    setMessage({content:response.message,success:false});
                }
            } else  {
                setMessage({content:response,success:false});
            }
            setLoading(false);
        })
        .catch((error) => {
            setMessage({content:error.message,success:false});
            setLoading(false);
        });
    };

  return (
    <div className='flex flex-col w-full h-full space-y-4 items-center justify-center m-auto shrink-0 rounded-r-xl overflow-hidden'>
        <PiUser size={64} className='flex mx-auto text-[rgb(0,175,240)] shrink-0'/>
        <input 
            type="text" 
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="User name..."
            className='flex w-72 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap rounded-lg shadow-md'
        />
        <input 
            type="password" 
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Password...'
            className='flex w-72 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap rounded-lg shadow-md'
        />
        <Message message={message}/>
        <button 
            onClick={(e) => {
                setDialog({
                    show:true,
                    Component:() => 
                        <YesNoDialog 
                            title='Forgot password' 
                            message='By clicking here your password will be reset and an OTP will be sent to your email. Are you sure your want to proceed?'
                            onYes={async (e) => {
                                await onForgotPassword(username);
                            }}
                        />
                })
            }}
            className='w-72 h-6 items-center justify-center shrink-0  text-sm font-thin italic text-white hover:underline'>
            Forgot Password?
        </button>
        <button onClick={(e) => onLogin(e)} 
            className='w-72 h-10 rounded-lg items-center justify-center shrink-0  bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white shadow-md'>
            Login
        </button>
        <button onClick={(e) => onCreateAccount(e)} 
            className='w-72 h-10 rounded-lg items-center justify-center shrink-0 bg-white hover:bg-[rgb(0,175,240)] text-[rgb(0,175,240)] hover:text-white shadow-md'>
            Create Account
        </button>
    </div>
  )
}

export default Login