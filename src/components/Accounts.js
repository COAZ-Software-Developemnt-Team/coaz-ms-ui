import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet, useNavigate } from 'react-router-dom';
import { PiUsers,PiUserPlus,PiUserFill,PiCaretDoubleLeft,PiCaretLeft,PiCaretDoubleRight,PiCaretRight,PiFunnel, PiArrowsLeftRightFill, PiArrowsLeftRightLight, PiMoneyWavyFill, PiBankFill, PiMoneyWavyLight} from "react-icons/pi";
import AddUser from './AddUser';
import UserItem from './UserItem';
import AddUsers from './AddUsers';
import TransactionFilter from './TransactionFilter';
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import User from './User';

const Accounts = () => {
    const [accounts,setAccounts] = useState([]);
    const {currentUserId,accountId} = useParams();
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

    const getAccounts = async (page) => {
        setLoading(true);
        let user = null;
        await request('GET','current',null,null,true)
        .then((currentResponse) => {
            if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
                user = currentResponse.content.user;
            } else {
                user = false;
            }
        })
        .catch((error) => {
            console.error(error);
        })
        await request ('GET','hasauthority',null,{
            contextName:'ACCOUNT',
            authority:'READ'
        },true)
        .then(async response => {
            if(user && response.status === 'YES' && page) {
                await request('GET','accounts',null,{
                    pageNo:page.pageNo,
                    pageSize:page.pageSize,
                    sortBy:page.sortBy,
                    sortDir:page.sortDir},true)
                .then((response) => {
                    if(response.content) {
                        setAccounts(response.content);
                        setPageNo(response.pageNo);
                        setPageSize(response.pageSize);
                        setTotalElements(response.totalElements);
                        setTotalPages(response.totalPages);
                        setLast(response.last);
                    } else {
                        setAccounts(null);
                    }
                })
                .catch((error) => {
                    setAccounts(null);
                });
            } else if(user) {
                await request('GET','account/my',null,null,true)
                .then((response) => {
                    if(response.content) {
                        setAccounts([response.content]);
                        setPageNo(response.pageNo);
                        setPageSize(response.pageSize);
                        setTotalElements(response.totalElements);
                        setTotalPages(response.totalPages);
                        setLast(response.last);
                    } else {
                        setAccounts(null);
                    }
                })
                .catch((error) => {
                    setAccounts(null);
                });
            } else {
                setAccounts(null);
            }
        })
        .catch((error) => {
            setAccounts(null);
        })
        setLoading(false);
    }

    useEffect(() => {
        getAccounts(page);
    },[path,page])
  return (
    <>{accountId?
        <Outlet/>:
        <ContentContainer previous={currentUserId?`/${currentUserId}/home`:'/home'} 
            Icon={PiBankFill} 
            text='Accounts' 
            loading={loading}>
            {accounts  && totalElements >  pageSize &&
                <div className='flex flex-wrap w-full h-fit justify-between items-center'>
                    <p className='text-xs font-helveticaNeueRegular text-[rgb(145,145,145)] tracking-wider'>
                        {`Showing ${accounts && accounts.length > 0?(pageNo * pageSize)+1:0} to ${((pageNo * pageSize)+accounts.length)} of ${totalElements}`}
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
            {accounts && accounts.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {accounts.map((account,i) => <AccountItem key={i} account={account}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Accounts

const AccountItem = ({account}) => {
    const [balance,setBalance] = useState(0);
    const {currentUserId} = useParams(); 
    const path = useLocation().pathname;
    const {request} = useData();

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    useEffect(() => {
        if(account) {
            request('GET',`account/balance/${account.id}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setBalance(response.content);
                } else {
                    setBalance(0);
                }
            })
            .catch((error) => {
                setBalance(0)
            })
        }
    },[])

    return (
        <div className='flex flex-row w-full h-auto'>
            {account &&
            <div className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/${currentUserId}/accounts/${account.id}`,{state:{parentPath:path}})}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiMoneyWavyLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${account.holder && account.holder.name?account.holder.name:account.name}`}
                        </p>
                        <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular capitalize whitespace-nowrap overflow-hidden overflow-ellipsis'>
                            {`Balance : K ${USDecimal.format(balance)}`}
                        </p>
                    </div>
                </div>
            </div>}
        </div>
    )
}