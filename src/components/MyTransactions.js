import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet, useNavigate } from 'react-router-dom';
import { PiCaretDoubleLeft,PiCaretLeft,PiCaretDoubleRight,PiCaretRight,PiFunnel, PiArrowsLeftRightFill, PiHandDeposit} from "react-icons/pi";
import TransactionFilter from './TransactionFilter';
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import TransactionItem from './TransactionItem';
import Deposit from './Deposit';
import YesNoDialog from './YesNoDialog';
import Detail from './Detail';

const MyTransactions = () => {
    const {setDialog,transactionFilter,setAccess} = useContext(GlobalContext);
    const [currentUser,setCurrentUser] = useState(null);
    const [transactions,setTransactions] = useState([]);
    const [account,setAccount] = useState(null);
    const [balance,setBalance] = useState(0);
    const {transactionId} = useParams();
    const [buttons,setButtons] = useState([]);
    const [pageNo,setPageNo] = useState(0);
    const [pageSize,setPageSize] = useState(0);
    const [totalElements,setTotalElements] = useState(0);
    const [totalPages,setTotalPages] = useState(0);
    const [last,setLast] = useState(true);
    const {request} = useData();
    const [page,setPage] = useState({
        pageNo:0,
        pageSize:10,
        sortBy:'id',
        sortDir:'asc'
    })
    const [loading,setLoading] = useState(false);
    const path = useLocation().pathname;

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onFilter = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <TransactionFilter userId={currentUser.id} reload={load}/>
        })
    }

    const handleFirst = (e) => {
        if(e) e.preventDefault();
        if(page.pageNo > 0) {
            setPage({...page, pageNo: 0});
        }
    }

    const handlePrevious = (e) => {
        if(e) e.preventDefault();
        if(page.pageNo > 0) {
            setPage({...page, pageNo: page.pageNo - 1});
        }
    }

    const handleNext = (e) => {
        if(e) e.preventDefault();
        if(page.pageNo < totalPages - 1) {
            setPage({...page, pageNo: page.pageNo + 1});
        }
    }

    const handleLast = (e) => {
        if(e) e.preventDefault();
        if(page.pageNo < totalPages - 1 && !last) {
            setPage({...page, pageNo: totalPages - 1});
        }
    }

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

    const getTransactions = async (filter,page) => {
        if(!currentUser) {
            return;
        }
        await request('GET','transactions/my',null,{
            paymentType:filter.paymentType,
            currency:filter.currency,
            amount:filter.amount,
            accountNumber:filter.accountNumber,
            transactionId:filter.transactionId,
            externalId:filter.externalId,
            from:filter.from,
            to:filter.to,
            status:filter.status,
            pageNo:page.pageNo,
            pageSize:page.pageSize,
            sortBy:page.sortBy,
            sortDir:page.sortDir},true)
        .then((response) => {
            if(response.content) {
                setTransactions(response.content);
                setPageNo(response.pageNo);
                setPageSize(response.pageSize);
                setTotalElements(response.totalElements);
                setTotalPages(response.totalPages);
                setLast(response.last);
            } else {
                setTransactions(null);
            }
        })
        .catch((error) => {
            setTransactions(null);
        });
    }

    const getAccount = async () => {
        if(!currentUser) {
            return;
        }
        await request('GET','account/my',null,null,true)
        .then((response) => {
            if(response.content) {
                setAccount(response.content);
                request('GET',`account/balance/${response.content.id}`,null,null,true)
                .then((balance) => {
                    if(balance && balance.content && !isNaN(balance.content)) {
                        setBalance(Math.abs(balance.content));
                    } else {
                        setBalance(0);
                    }
                })
                .catch((error) => {
                    setBalance(0);
                })
            } else {
                setAccount(null);
            }
        })
        .catch((error) => {
            setAccount(null);
        });
    }

    const load = async (filter) => {
        setLoading(true);
        await request('GET','current',null,null,true)
        .then(async (currentResponse) => {
            if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
                setCurrentUser(currentResponse.content.user);
            } else {
                setCurrentUser(false);
            }
        })
        .catch((error) => {
            console.error(error);
        })
        await getTransactions(filter,page);
        setButtons([
            {
                Icon:PiFunnel,
                name:'Filter',
                handler:onFilter
            },
            {
                Icon:PiHandDeposit,
                name:'Deposit',
                handler:onDeposit
            }
        ]);
        await getAccount();
        setLoading(false);
    }

    useEffect(() => {
        load(transactionFilter);
    },[path,page])
  return (
    <>{transactionId?
        <Outlet context={{parentPath:`/transactions`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiArrowsLeftRightFill} text='My Transactions' loading={loading}>
            <div className='flex flex-col w-full space-y-4'>
            {account && 
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Account</p>
                    <Detail label='Account name' value={account.name}/>
                    <Detail label='Account balance' value={`K ${USDecimal.format(balance)}`}/>
                </div>
            }
            {transactions && transactions.length > 0 && 
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Transactions</p>
                    {totalElements >  pageSize &&
                        <div className='flex flex-wrap w-full h-fit justify-between items-center'>
                            <p className='text-xs font-helveticaNeueRegular text-[rgb(145,145,145)] tracking-wider'>
                                {`Showing ${transactions && transactions.length > 0?(pageNo * pageSize)+1:0} to ${((pageNo * pageSize)+transactions.length)} of ${totalElements}`}
                            </p>
                            <div className='flex flex-row w-fit h-fit space-x-2 text-[rgb(68,71,70)]'> 
                                <button 
                                    disabled={!pageNo || pageNo < 1}
                                    onClick={handleFirst}
                                    className={`flex w-10 h-10 ${pageNo < 1?'text-[rgb(170,170,170)]':'hover:bg-[rgba(0,0,0,.04)]'} rounded-full`}
                                >
                                    <PiCaretDoubleLeft size={16} className='flex m-auto'/>
                                </button>
                                <button 
                                    disabled={!pageNo || pageNo < 1}
                                    onClick={handlePrevious}
                                    className={`flex w-10 h-10 ${pageNo < 1?'text-[rgb(170,170,170)]':'hover:bg-[rgba(0,0,0,.04)]'} rounded-full`}
                                >
                                    <PiCaretLeft size={16} className='flex m-auto'/>
                                </button>
                                <button 
                                    disabled={last}
                                    onClick={handleNext}
                                    className={`flex w-10 h-10 ${last?'text-[rgb(170,170,170)]':'hover:bg-[rgba(0,0,0,.04)]'} rounded-full`}
                                >
                                    <PiCaretRight size={16} className='flex m-auto'/>
                                </button>
                                <button 
                                    disabled={last}
                                    onClick={handleLast}
                                    className={`flex w-10 h-10 ${last?'text-[rgb(170,170,170)]':'hover:bg-[rgba(0,0,0,.04)]'} rounded-full`}
                                >
                                    <PiCaretDoubleRight size={16} className='flex m-auto'/>
                                </button>
                            </div>
                        </div>
                    }
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        {transactions.map((transaction,i) => <TransactionItem key={i} transaction={transaction}/>)}
                    </div>
                </div>
            }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default MyTransactions

