import React, {useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { PiLockKeyOpen } from "react-icons/pi";
import { useLocation, useNavigate } from 'react-router-dom';
import Message from './Message';
import Login from './Login';
import Access from './Access';
import {useData} from '../data'

const ChangePassword = () => {
    const {setLoading,setAccess,logout} = useContext(GlobalContext);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [message,setMessage] = useState({content:'',success:false}); 
    const {request} = useData();
    const location = useLocation();
    const { state } = location;
    
    const navigate = useNavigate();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(state && state.user && newPassword === confirmPassword) {
            setLoading(true);
            request('PUT','/user/setpassword',null,{
                userId:state.user.id,
                oldPassword:oldPassword,
                newPassword:newPassword
            },false)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL') {
                        navigate('/login')
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
        } else {
            setMessage({content:"New password and confirm password didn't match, try again!",success:false});
        }
    };

    return (
        <Access onClose={() => navigate('/home')}>
            <div className='flex flex-col w-full h-full space-y-2 items-center justify-center m-auto shrink-0 rounded-r-xl overflow-hidden'>
                <PiLockKeyOpen size={64} className='flex mx-auto text-[rgb(0,175,240)] shrink-0'/>
                <input 
                    type="text" 
                    name="username"
                    value={state && state.user?state.user.username:''}
                    disabled={true}
                    className='flex w-72 h-10 shrink-0 p-2 mb-4 focus:outline-none font-thin text-sm whitespace-nowrap rounded-lg shadow-md'
                />
                <input 
                    type="password" 
                    name="oldPassword"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder='Old password...'
                    className='flex w-72 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap rounded-lg shadow-md'
                />
                <input 
                    type="password" 
                    name="newPassword"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder='New password...'
                    className='flex w-72 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap rounded-lg shadow-md'
                />
                <input 
                    type="password" 
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder='Confirm password...'
                    className='flex w-72 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap rounded-lg shadow-md'
                />
                <Message message={message}/>
                <button onClick={(e) => submit(e)} 
                    className='flex shrink-0 w-72 h-10 rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white shadow-md'>
                    Submit
                </button>
            </div>
        </Access>
    )
}

export default ChangePassword
