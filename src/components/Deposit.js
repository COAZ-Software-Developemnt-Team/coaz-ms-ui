import React, {useEffect,useState,useContext} from 'react'
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import Message from './Message';
import {useData} from '../data'

const Deposit = () => {
    const [message,setMessage] = useState({content:'',success:false});
    const [onSubmit,setOnSubmit] = useState({method:() => {}});

    return (
        <div className='flex w-full h-full items-center justify-center bg-[url(/public/images/bg_cpd.jpg)] bg-center bg-cover'>
            <div className='flex flex-col w-[95%] sm:w-[640px] h-fit pb-4 bg-white items-center rounded-xl shadow-md overflow-hidden'>
                <MobileMoney setMessage={setMessage} setOnSubmit={setOnSubmit}/>
                <Message message={message}/>
                <button onClick={(e) => onSubmit.method()} 
                    className='w-72 h-10 rounded-lg shrink-0  bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white shadow-md'>
                    Submit
                </button>
            </div>
        </div>
    )
}

export default Deposit

const MobileMoney = ({setMessage,setOnSubmit}) => {
    const {currentUserId} = useParams();
    const {setLoading} = useContext(GlobalContext);
    const [amount,setAmount] = useState(0);
    const {request} = useData();
    const [phoneNumber,setPhoneNumber] = useState({
        part1:'260',
        part2:'',
        part3:'',
        part4:''
    });

    const onAmount =(e) => {
        e.preventDefault();
        e.stopPropagation();
        let value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        setAmount(value)
    }

    const onPhoneNumber = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        setPhoneNumber({...phoneNumber,[e.target.name]:value})
    }

    const confirm = async () => {
        setMessage({content:"",success:false});
        setLoading(true);
        if(amount < 1) {
            setLoading(false);
            setMessage({content:'Amount must be greater than 0',success:false});
            return;
        }
        if(phoneNumber.part1 === '') {
            setLoading(false);
            setMessage({content:'Invalid phone number',success:false});
            return;
        }
        if(phoneNumber.part2 === '') {
            setLoading(false);
            setMessage({content:'Invalid phone number',success:false});
            return;
        }
        if(phoneNumber.part3 === '') {
            setLoading(false);
            setMessage({content:'Invalid phone number',success:false});
            return;
        }
        if(phoneNumber.part4 === '') {
            setLoading(false);
            setMessage({content:'Invalid phone number',success:false});
            return;
        }
        let number = phoneNumber.part1+phoneNumber.part2+phoneNumber.part3+phoneNumber.part4;
        request('POST','deposit',null,{
            userId:currentUserId,
            amount:amount,
            phoneNumber:number
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
        setOnSubmit({method:()=>confirm()});
    },[amount,phoneNumber])

    return (
        
            <div className='flex flex-col space-y-6 w-full h-fit p-8'>
                <div className='flex flex-row w-full h-fit justify-between'>
                    <div className='w-24 h-24 p-2 rounded-3xl overflow-hidden'>
                        <img src='/images/airtel.png' alt='Airtel' className='w-full h-full object-contain object-center'/>
                    </div>
                    <div className='w-24 h-24 p-2 rounded-3xl overflow-hidden'>
                        <img src='/images/mtn.png' alt='Mtn' className='w-full h-full object-contain object-center'/>
                    </div>
                    <div className='w-24 h-24 p-2 rounded-3xl overflow-hidden'>
                        <img src='/images/zamtel.png' alt='Zamtel' className='w-full h-full object-contain object-center'/>
                    </div>
                </div>
                <div className='flex flex-row w-full h-10 items-center text-gray-600 text-sm'>
                    <label htmlFor='amount' className='w-1/3 capitalize'>Amount</label>
                    <div className='flex flex-row space-x-1 w-2/3 h-full items-center overflow-hidden'>
                        <p className='flex w-11 shrink-0'>ZMW</p>
                        <input
                            id='amount'
                            name='amount'
                            type='number'
                            inputMode='numeric'
                            value={amount}
                            onChange={onAmount}
                            className={`flex w-full h-10 p-1 focus:outline-none font-thin whitespace-nowrap bg-transparent border ${amount === '' || amount < 1?'border-red-500':''} rounded-lg`}
                        />
                    </div>
                </div>
                <div className='flex flex-row w-full h-10 items-center text-gray-600 text-sm'>
                    <label htmlFor='number' className='w-1/3 capitalize'>Phone number</label>
                    <div className='flex flex-row space-x-1 w-2/3 h-full items-center justify-between overflow-hidden'>
                        <input 
                            type='text'
                            inputMode='numeric'
                            maxLength={3}
                            name='part1'
                            disabled={true}
                            value={phoneNumber.part1}
                            placeholder='000'
                            onChange={onPhoneNumber}
                            className={`flex w-full h-10 p-1 focus:outline-none font-thin whitespace-nowrap bg-transparent border ${phoneNumber.part1 === ''?'border-red-500':''} rounded-lg`}
                        />
                        <p className=''>-</p>
                        <input 
                            type='text'
                            inputMode='numeric'
                            maxLength={3}
                            name='part2'
                            value={phoneNumber.part2}
                            placeholder='000'
                            onChange={onPhoneNumber}
                            className={`flex w-full h-10 p-1 focus:outline-none font-thin whitespace-nowrap bg-transparent border ${phoneNumber.part2 === ''?'border-red-500':''} rounded-lg`}
                        />
                        <p className=''>-</p>
                        <input 
                            type='text'
                            inputMode='numeric'
                            maxLength={3}
                            name='part3'
                            value={phoneNumber.part3}
                            placeholder='000'
                            onChange={onPhoneNumber}
                            className={`flex w-full h-10 p-1 focus:outline-none font-thin whitespace-nowrap bg-transparent border ${phoneNumber.part3 === ''?'border-red-500':''} rounded-lg`}
                        />
                        <p className=''>-</p>
                        <input 
                            type='text'
                            inputMode='numeric'
                            maxLength={3}
                            name='part4'
                            value={phoneNumber.part4}
                            placeholder='000'
                            onChange={onPhoneNumber}
                            className={`flex w-full h-10 p-1 focus:outline-none font-thin whitespace-nowrap bg-transparent border ${phoneNumber.part4 === ''?'border-red-500':''} rounded-lg`}
                        />
                    </div>
                </div>
            </div>
    )
}
