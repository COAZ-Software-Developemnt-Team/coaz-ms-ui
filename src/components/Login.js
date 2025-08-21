import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { PiUser } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Message from './Message';
import Access from './Access';
import { useData } from '../data';
import axios from "axios";

//axios.defaults.baseURL = 'http://localhost:8080/api/';
//axios.defaults.baseURL = 'http://localhost:8080/coaz/api/';
//axios.defaults.baseURL = 'http://192.168.0.161:8080/api/';
//axios.defaults.baseURL = 'https://coaz.org:8085/coaz_test/api/';
axios.defaults.baseURL = 'https://coaz.org:8085/coaz/api/';

export function useLogin () {
    const {request} = useData();
    const navigate = useNavigate();

    const login = async (username,password) => {
        sessionStorage.setItem("access_token",'');
        sessionStorage.setItem("refresh_token",'');
        let responseObject = {};
        await axios.get("login",{params:{username:username,password:password}})
        .then(async (response) => {
            if(response.data['access_token']) {
                sessionStorage.setItem("access_token",response.data['access_token']);
                sessionStorage.setItem("refresh_token",response.data['refresh_token']);
                await request('GET','current',null,null,true)
                .then(async (currentResponse) => {
                    if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                        navigate(`/${currentResponse.content.user.id}/home`)
                    } else if(currentResponse.message) {
                        responseObject = {error_message:currentResponse.message};
                    } else if(typeof currentResponse === "string") {
                        responseObject = {error_message:currentResponse};
                    } else {
                        responseObject = {error_message:'Error getting current user'};
                    }
                })
                .catch((error) => {
                    responseObject = {error_message:error.message};
                })
            } else if(response.data.status === 'PENDING_PAYMENT' && response.data.user && response.data.tariff) {
                navigate('/mobile_payment',{state:{parentPath:'/home',user:response.data.user,tariff:response.data.tariff}});
            } else if(response.data.status && response.data.status === 'OTP' && response.data.user ) {
                navigate('/change_password',{state:{user:response.data.user}})
            } else if(response.data.status === 'INCOMPLETE_REGISTRATION' && response.data.user) {
                navigate('/finish_registration',{state:{user:response.data.user}})
            } else {
                responseObject = {error_message:'Error logging in'};
            }
        })
        .catch((error) => {
            if(error.response && error.response.status === 401) { 
                if (error.response.data['error_message'] && error.response.data['error_message'].toLowerCase().includes('bad credentials')) {
                    responseObject = {error_message:'Incorrect username or password'};
                }else {
                    responseObject = error.response.data;
                }
            } else {
                responseObject = {error_message:error.message};
            }
        })
        return responseObject; 
    }

  const logout = () => {
      sessionStorage.setItem("access_token",'');
      sessionStorage.setItem("refresh_token",'');
      navigate(`/home`);
  }

  return {login:login,logout:logout}
}

const Login = () => {
    const {setDialog,setLoading,setAccess} = useContext(GlobalContext);
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState(""); 
    const [message,setMessage] = useState({content:'',success:false});
    const {request} = useData();
    const {login,logout} = useLogin();

    const navigate = useNavigate();
    
    const onLogin = async (e) => {
        setLoading(true);
        e.preventDefault();
        setMessage({content:'',success:false});
        if(login) {
            await login(username,password)
            .then( (response) => {
                if(response.status === 'SUCCESSFUL') {
                    setMessage({content:'Successful',success:true});
                }
                if(response.error_message) {
                    setMessage({content:response.error_message,success:false});
                } else if(response.message) {
                    setMessage({content:response.message,success:false});
                } else {
                    setMessage({content:'Something went wrong',success:false})
                }
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
                logout()
            })
            setLoading(false);
        }
    }; 

    const onCreateAccount = (e) => {
        e.preventDefault();
        navigate('/register')
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
    <Access onClose={() => navigate('/home')}>
        <div className='flex flex-col w-full h-full space-y-4 items-center justify-center overflow-hidden'>
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
                className='w-72 h-6 items-center justify-center shrink-0  text-sm font-thin italic text-[rgb(0,175,240)] hover:underline'>
                Forgot Password?
            </button>
            <button onClick={(e) => onLogin(e)} 
                className='w-72 h-10 rounded-lg items-center justify-center shrink-0  bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white shadow-md'>
                Login
            </button>
            <button onClick={(e) => onCreateAccount(e)} 
                className='w-72 h-10 rounded-lg items-center justify-center shrink-0 bg-white hover:bg-[rgb(0,175,240)] font-thin text-gray-400 hover:text-white shadow-md'>
                Register
            </button>
        </div>
    </Access>
  )
}

export default Login