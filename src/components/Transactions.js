import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet, useNavigate } from 'react-router-dom';
import { PiUsers,PiUserPlus,PiUserFill,PiCaretDoubleLeft,PiCaretLeft,PiCaretDoubleRight,PiCaretRight,PiFunnel, PiArrowsLeftRightFill, PiArrowsLeftRightLight} from "react-icons/pi";
import AddUser from './AddUser';
import UserItem from './UserItem';
import AddUsers from './AddUsers';
import TransactionFilter from './TransactionFilter';
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import TransactionItem from './TransactionItem';

const Transactions = () => {
    const {setDialog,transactionFilter} = useContext(GlobalContext);
    const [transactions,setTransactions] = useState([]);
    const {currentUserId,transactionId} = useParams();
    const [buttons,setButtons] = useState([]);
    const [pageNo,setPageNo] = useState(0);
    const [pageSize,setPageSize] = useState(0);
    const [totalElements,setTotalElements] = useState(0);
    const [totalPages,setTotalPages] = useState(0);
    const [last,setLast] = useState(true);
    const [page,setPage] = useState({
        pageNo:0,
        pageSize:10,
        sortBy:'id',
        sortDir:'asc'
    })
    const [loading,setLoading] = useState(false);
    const {request} = useData();
    const path = useLocation().pathname;

    const onFilter = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <TransactionFilter reload={load}/>
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

    const getTransactions = async (filter,page) => {
        setLoading(true);
        await request ('GET','hasauthority',null,{
            contextName:'TRANSACTION',
            authority:'READ'
        },true)
        .then(async response => {
            if(currentUserId && response.status === 'YES') {
                await request('GET','transactions',null,{
                    userId:filter.userId,
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
            } else if(currentUserId) {
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
            } else {
                setTransactions(null);
            }
        })
        .catch((error) => {
            setTransactions(null);
        })
        setLoading(false);
    }

    const load = async (filter) => {
        getTransactions(filter,page);
        setButtons([{
            Icon:PiFunnel,
            name:'Filter',
            handler:onFilter
        }]);
    }

    useEffect(() => {
        load(transactionFilter);
    },[path,page])
  return (
    <>{transactionId?
        <Outlet/>:
        <ContentContainer previous={currentUserId?`/${currentUserId}/home`:'/home'} 
            buttons={buttons} 
            Icon={PiArrowsLeftRightFill} 
            text='Transactions' loading={loading}>
            {transactions  && totalElements >  pageSize &&
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
            {transactions && transactions.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {transactions.map((transaction,i) => <TransactionItem key={i} transaction={transaction}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Transactions

