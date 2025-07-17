import React, {useEffect,useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {PiArrowsLeftRightLight} from "react-icons/pi";
import {useData} from '../data';

const TransactionItem = ({transaction}) => {
    const [user,setUser] = useState(null);
    const [userId,setUserId] = useState('');
    const [debitAccount,setDebitAccount] = useState(null);
    const [creditAccount,setCreditAccount] = useState(null);
    const [date,setDate] = useState(null);
    const {request} = useData();
    const navigate = useNavigate();

    useEffect(() => {
        if(transaction && transaction.createdOn && transaction.externalId) {
            setDate(new Date(transaction.createdOn));
            let values = transaction.externalId.split('-');
            if(values && values.length > 0) {
                let usr = null;
                request('GET',`user/${values[0]}`,null,null,true)
                .then((response) => {
                    if(response.content) {
                        setUser(response.content);
                        usr = response.content;
                    } else {
                        setUser(null);
                    }
                })
                .catch((error) => {
                    setUser(null);
                })
                setUserId(values[0]);
            }
        }
    },[])

    return (
        <div className='flex flex-row w-full h-auto'>
            {transaction &&
            <div className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/transactions/${transaction.id}`)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiArrowsLeftRightLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${transaction.description && transaction.description != ''?transaction.description:transaction.transactionId} ${transaction.currency?transaction.currency:''} ${transaction.amount}`}
                        </p>
                        <div className='flex flex-row w-full h-fit space-x-2'>
                            <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular capitalize whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                {`${user?user.name:userId?userId:''}`}
                            </p>
                            {date &&
                                <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular capitalize whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                    {date.toLocaleString('default', { month: 'long' })+' '+date.getDate()+', '+date.getFullYear()+' '+date.toLocaleTimeString('en-US')}
                                </p>
                            }
                            {transaction.status && 
                                <p className={`text-xs ${transaction.status === 'SUCCESSFUL'?'text-green-600':transaction.status === 'PENDING'?'text-gray-400':transaction.status === 'FAILED'?'text-red-600':'text-[rgb(145,145,145)]'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    {transaction.status.toLowerCase()}
                                </p>
                            }
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default TransactionItem