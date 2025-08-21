import React, {useEffect,useState,useContext, Component} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import Message from './Message';
import {useData} from '../data'
import { GiPayMoney } from 'react-icons/gi';
import { useLocation, useNavigate } from 'react-router-dom';
import Access from './Access';

const Payment = () => {
    const {setLoading} = useContext(GlobalContext);
    const [message,setMessage] = useState({content:'',success:false});
    const [password,setPassword] = useState('');
    const [balance,setBalance] = useState(0);
    const {request} = useData();
    const location = useLocation();
    const state = location.state;

    const navigate = useNavigate();

    let USDecimal = new Intl.NumberFormat('en-US',{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const close = () => {
        navigate(state && state.parentPath?state.parentPath:'/home');
    }

    const onConfirm = async () => {
        setMessage({content:"",success:false});
        setLoading(true);
        if(!state || !state.user || !state.tariff || !state.tariff.receivable) {
            setLoading(false);
            return;
        }
        let narration = `Payment for ${state.tariff.receivable.name}`;
        request('POST','payment/main',null,{
            userId:state.user.id,
            receivableId:state.tariff.receivableId,
            criteriaId:state.tariff.criteriaId,
            narration:narration,
            password:password
        },true)
        .then((response) => {
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content) {
                    if(response.content.status === 'SUCCESSFUL') {
                        setMessage({content:'Payment was successfull',success:true});
                    } else if(response.content.status === 'PENDING') { 
                        setMessage({content:"Transaction Id is "+response.content.transactionId,success:true}); 
                    }
                }else if(response.message) {
                    setMessage({content:response.message,success:false});
                }
            } else {
                setMessage({content:response,success:false});
            }
            setLoading(false);
        })
        .catch((error) => {
            setMessage({content:error.message,success:false});
            setLoading(false);
        })
    } 

    useEffect(() => {
        request('GET','account/my',null,null,true)
        .then((accountResponse) => {
            if(accountResponse.content) {
                request('GET',`account/balance/${accountResponse.content.id}`,null,null,true)
                .then((response) => {
                    if(response.content && !isNaN(response.content)) {
                        setBalance(Math.abs(response.content));
                    } else {
                        setBalance(0);
                    }
                })
            } else {
                setBalance(0);
            }
        })
        .catch((error) => {
            setBalance(0);
        })
    },[])

    return (
        <Access onClose={close}>
            <div className='flex flex-col w-[95%] sm:w-[480px] h-fit p-8 bg-white items-center rounded-xl shadow-md overflow-hidden'>
                <div className='flex flex-col space-y-2 w-full h-fit font-helveticaNeueMedium'>
                    <div className='flex w-full h-fit justify-center'>
                        <GiPayMoney size={64} className='text-[rgb(0,175,240)]'/>
                    </div>
                    <div className='flex flex-row w-full h-10 px-[10%] items-center text-gray-600 text-sm overflow-hidden'>
                        <label className='w-full capitalize whitespace-nowrap'>Available Balance</label>
                        <div className='flex flex-row space-x-1 w-fit h-full items-center shrink-0 overflow-hidden'>
                            <p className='flex w-11 shrink-0'>ZMW</p>
                            <p className={`flex w-fit ${!state || !state.tariff || state.tariff.price > balance?'text-red-500':''} shrink-0`}>
                                {USDecimal.format(balance)}
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-row w-full h-10 px-[10%] items-center text-gray-600 text-sm overflow-hidden'>
                        <label className='w-full capitalize whitespace-nowrap'>Amount</label>
                        <div className='flex flex-row space-x-1 w-fit h-full items-center shrink-0 overflow-hidden'>
                            <p className='flex w-11 shrink-0'>ZMW</p>
                            <p className='flex w-fit shrink-0'>
                                {USDecimal.format(state && state.tariff? state.tariff.price:0)}
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-row w-full h-10 px-[10%] items-center text-gray-600 text-sm overflow-hidden'>
                        <label htmlFor='password' className='w-full capitalize'>Password</label>
                        <input
                            id='password'
                            name='password'
                            type='password'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            className={`flex w-48 h-8 p-1 shrink-0 focus:outline-none font-thin whitespace-nowrap bg-transparent border rounded-lg`}
                        />
                    </div>
                </div>
                <Message message={message}/>
                <button onClick={onConfirm} 
                    disabled={!state || !state.tariff || state.tariff.price > balance || password === ''}
                    className={`w-72 h-10 rounded-lg shrink-0 ${!state || !state.tariff || state.tariff.price > balance || password === ''?'bg-gray-300':'bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)]'} text-white shadow-md`}>
                    Confirm
                </button>
            </div>
        </Access>
    )
}

export default Payment