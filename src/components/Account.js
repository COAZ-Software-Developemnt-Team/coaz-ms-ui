import React,{useContext, useEffect,useState} from 'react'
import {BsGraphUpArrow,BsGraphUp} from "react-icons/bs";
import Scrollable from './Scrollable';
import { useRef } from 'react';
import { useData } from '../App';
import { PiArrowLeftLight, PiChartLineDownThin, PiChartLineUpThin, PiMoneyWavyThin } from 'react-icons/pi';
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Deposit from './Deposit';
import YesNoDialog from './YesNoDialog';

const Account = () => {
    const {currentUser,setDialog,setAccess} = useContext(GlobalContext);
    const [account,setAccount] = useState(null)
    const [transactions,setTransactions] = useState([]);
    const [debits,setDebits] = useState(0);
    const [credits,setCredits] = useState(0);
    const [balance,setBalance] = useState(0);
    const {accountId} = useParams();
    const {parentPath} = useOutletContext();
    const transactionsRef = useRef(null);
    const padding = 16;
    const [contentSize,setContentSize] = useState({width:0,height:0});
    const [request] = useData();

    const navigate = useNavigate();

    const onDeposit = (e) => {
        e.preventDefault();
        if(!currentUser) {
            return;
        }
        setDialog({
            show:true,
            Component:() =>                       
                <YesNoDialog 
                    title='Deposit' 
                    message='Are you sure you want to deposit into your account?' 
                    onYes={async (e) => {
                        setAccess({Component:() => <Deposit user={currentUser}/>});
                    }}
                />
        })
    }

    useEffect(() => {
      (async () => {
        if(accountId && currentUser) {
            let acc = null;
            await request ('GET','hasauthority',null,{
                contextName:'ACCOUNT',
                authority:'READ'
            },true)
            .then(async response => {
                if(currentUser && response.status === 'YES') {
                    await request('GET',`account/${accountId}`,null,null,true)
                    .then((response) => {
                        if(response.content) {
                            acc = response.content;
                        } else {
                            navigate(parentPath);
                        }
                    })
                    .catch((error) => {
                        navigate(parentPath);
                    });
                } else {
                    await request ('GET','account/my',null,null,true)
                    .then((response) => {
                        if(response.content && response.content.holder && currentUser && currentUser.id === response.content.holder.id) {
                            acc = response.content;
                        } else {
                            navigate(parentPath);
                        }
                    })
                    .catch((error) => {
                        navigate(parentPath);
                    })
                }
            })
            .catch((error) => {
                navigate(parentPath);
            })

            if(acc) {
                setAccount(acc);
                await request('GET',`transactions/account`,null,{accountId:acc.id},true)
                .then((response) => {
                    if(response.content) {
                        let dr = 0;
                        let cr = 0;
                        for(let transaction of response.content) {
                            if(transaction.createdOn) {
                                transaction.createdOn = new Date(transaction.createdOn);
                            } else {
                                transaction.createdOn = new Date();
                            }
                            if(transaction.debit && transaction.debit.id == acc.id) {
                                dr += transaction.amount;
                            }
                            if(transaction.credit && transaction.credit.id == acc.id) {
                                cr += transaction.amount;
                            }
                        }
                        setDebits(dr);
                        setCredits(cr);
                        setBalance(dr - cr);
                        let sortedTrans = response.content.sort((trans1,trans2) => (trans1.createdOn < trans2.createdOn)?-1:(trans1.createdOn > trans2.createdOn)?1:0)
                        setTransactions(sortedTrans);
                    }
                })
                .catch((error) => {
                    setTransactions([]);
                })
            }
        }
      })()
        

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                let rect = entry.target.getBoundingClientRect();
                setContentSize({
                    width:rect.width - (padding*2) - 2,
                    height:rect.height - (padding*2) - 2
                })
            }
        });

        if(transactionsRef.current) {
            observer.observe(transactionsRef.current)
        }
        return () => {
            observer.disconnect();
        }
    },[])
  return (
    <div className='flex flex-col w-full h-full shrink-0 p-8 space-y-4 tracking-wider text-[rgb(68,71,70)] font-helveticaNeueMedium'>
        <div className='flex flex-row items-center justify-between'>
            <div className='flex flex-row space-x-2 items-center'>
                <button onClick={(e) => navigate(parentPath)} 
                  className='flex w-10 h-10 items-center justify-center rounded-full text-[rgb(0,175,240)] hover:bg-[rgba(0,0,0,.04)]'>
                    <PiArrowLeftLight size={20}/>
                </button>
                <p className='text-sm tracking-wider text-[rgb(68,71,70)] font-helveticaNeueMedium shrink-0 uppercase'>
                    {account && account.holder?account.holder.name:account && account.name?account.name:''}
                </p>
            </div>
        </div>
        <div className='flex flex-wrap w-full h-fit justify-between xl:px-[25%] overflow-hidden bg-white shrink-0 border border-[rgba(0,175,240,.2)] rounded-md'>
            <AccountAttribute Icon={PiChartLineUpThin} label={'Debits'} value={debits}/>
            <AccountAttribute Icon={PiChartLineDownThin} label={'Credits'} value={credits}/>
            <AccountAttribute Icon={PiMoneyWavyThin} label={'Balance'} value={balance}/>
        </div>
        <div ref={transactionsRef}
            style={{padding:padding+'px'}}
            className='relative flex flex-col w-full h-full bg-white border border-[rgba(0,175,240,.2)] overflow-hidden rounded-md'>
            <Scrollable vertical={true} horizontal={true}>
                <div style={{width:contentSize.width+'px',height:contentSize.height+'px'}}
                    className='relative flex flex-col min-w-[680px]'>
                    <div className='flex flex-row w-full text-sm text-[rgb(68,71,70)] font-helveticaNeueMedium capitalize'>
                        <p className='w-[25%] px-2'>Date</p>
                        <p className='w-[25%] px-2'>Description</p>
                        <p className='w-[25%] px-2'>Debit</p>
                        <p className='w-[25%] px-2'>Credit</p>
                    </div>
                    {transactions && 
                        transactions.map((transaction,i) => 
                            <div key={i} className='flex flex-row w-full'>
                                <div className='w-[25%] p-2'>
                                    <p className='w-full p-2 text-xs text-[rgb(68,71,70)] overflow-hidden break-words font-helveticaNeueRegular'>
                                        {transaction.createdOn.toLocaleString('default', { month: 'long' })+' '+transaction.createdOn.getDate()+', '+transaction.createdOn.getFullYear()+' '+transaction.createdOn.toLocaleTimeString('en-US')}
                                    </p>
                                </div>
                                <div className='w-[25%] p-2'>
                                    <p className='w-full p-2 text-xs text-[rgb(68,71,70)] overflow-hidden break-words font-helveticaNeueRegular'>
                                        {transaction.description && transaction.description != ''?transaction.description:transaction.transactionId}
                                    </p>
                                </div>
                                <div className='w-[25%] p-2'>
                                    <p className='w-full p-2 text-xs text-[rgb(68,71,70)] overflow-hidden break-words font-helveticaNeueRegular'>
                                        {transaction.debit && transaction.debit.id === account.id?transaction.amount:''}
                                    </p>
                                </div>
                                <div className='w-[25%] p-2'>
                                    <p className='w-full p-2 text-xs text-[rgb(68,71,70)] overflow-hidden break-words font-helveticaNeueRegular'>
                                        {transaction.credit && transaction.credit.id === account.id?transaction.amount:''}
                                    </p>
                                </div>
                            </div>
                        )
                    }
                    <div className='absolute flex flex-row top-0 left-0 right-0 bottom-0'>
                        <div className='w-[25%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[25%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[25%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[25%] h-full'/>
                    </div>
                </div>
            </Scrollable>
        </div>
    </div>
  )
}

export default Account

const AccountAttribute = ({Icon,label,value}) => {
    return (
        <div className='flex flex-col sm:flex-row w-fit h-fit items-center sm:space-x-4 p-2 shrink-0'>
            <div className='flex w-10 h-10 items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)] shrink-0 rounded-md'>
                <Icon size={24}/>
            </div>
            <div className='flex flex-col items-center justify-center sm:justify-normal'>
                <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                    {label}
                </p>
                <p className='flex w-full justify-center sm:justify-normal font-helveticaNeueMedium text-[rgb(0,175,240)] uppercase'>
                    {value}
                </p>
            </div>
        </div>
    )
}