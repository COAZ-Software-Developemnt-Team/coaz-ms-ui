import React, {useEffect,useState,useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import {PiArrowsLeftRightLight,PiChalkboardTeacher,PiDotsThreeVertical, PiReceipt} from "react-icons/pi";
import {useData} from '../data';
import { useContext } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import MessageDialog from './MessageDialog';

const TransactionItem = ({transaction}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [user,setUser] = useState(null);
    const [userId,setUserId] = useState('');
    const [date,setDate] = useState(null);
    const [generatingReceipt,setGeneratingReceipt] = useState(false);
    const [highlighted,setHighlighted] = useState(false)
    const moreRef = useRef(null);
    const {request} = useData();
    const navigate = useNavigate();

    const onGenerateReceipt = async (e) => {
        e.preventDefault();
        setGeneratingReceipt(true);
        await request('POST','transaction/receipt',null,{transactionId:transaction.id},true)
        .then((response) => {
            if(response.message) {
                setDialog({
                    show:true,
                    Component:() => 
                        <MessageDialog 
                            title='Message' 
                            message={response.message} 
                        />
                })
            }
        })
        setGeneratingReceipt(false);
    }

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
            <div onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
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
                            {generatingReceipt?
                                <p className={`text-xs font-helveticaNeueRegular text-gray-400 whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    Generatin receipt...
                                </p> 
                            : 
                            transaction.status && 
                                <p className={`text-xs ${transaction.status === 'SUCCESSFUL'?'text-green-600':transaction.status === 'PENDING'?'text-gray-400':transaction.status === 'FAILED'?'text-red-600':'text-[rgb(145,145,145)]'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    {transaction.status.toLowerCase()}
                                </p>
                            }
                        </div>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && transaction.status === 'SUCCESSFUL' &&
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            <button onClick={onGenerateReceipt}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiReceipt  size={20} className='flex shrink-0'/>
                                                <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Generate Receipt
                                                </p>
                                            </button>
                                        </div>
                                })
                            }}
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDotsThreeVertical size={20} />
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}

export default TransactionItem