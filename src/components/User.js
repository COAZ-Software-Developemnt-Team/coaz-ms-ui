import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet, useOutletContext } from 'react-router-dom';
import EditUser from './EditUser';
import {PiLockKeyOpen ,PiPencilSimple,PiCaretDoubleLeft,PiCaretLeft,PiCaretDoubleRight,PiCaretRight, PiFunnel,PiFolderLight } from 'react-icons/pi';
import ResetPassword from './ResetPassword';
import Detail from './Detail';
import {useData} from '../data';
import TransactionFilter from './TransactionFilter';
import TransactionItem from './TransactionItem';
import ContentContainer from './ContentContainer';

const User = () => {
    const {setDialog,setAccess} = useContext(GlobalContext);
    const [user,setUser] = useState(null);
    const [currentUser,setCurrentUser] = useState(null);
    const [expiryDate,setExpiryDate] = useState(null);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {userId} = useParams();
    const location = useLocation();
    const { state } = location;
    const path = useLocation().pathname;

    const {request} = useData();

    const onEdit = async (e) => {
        e.preventDefault();
        let self = false;
        if(!userId || userId == currentUser.id) {
            self = true
        }
        setDialog({
            show:true,
            Component:() => <EditUser id={self?currentUser.id:userId} self={self} reload={getUser}/>
        })
    }

    const onResetPassword = (e) => {
        setDialog({
            show:true,
            Component:() => <ResetPassword userId={userId}/>
        })
    }

    const navigate = useNavigate();

    const getUser = async () => {
        let currentUsr = null;
        await request('GET','current',null,null,true)
        .then(async (currentResponse) => {
            if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
                currentUsr = currentResponse.content.user;
                setCurrentUser(currentUsr);
            }
        })
        if(!currentUsr) {
            return
        }
        setLoading(true);
        let readAuth = false;
        let updateAuth = false;
        await request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                readAuth = true;
            } 
        })

        await request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                updateAuth = true;
            }
        })
        let usr = null;
        let slf = false;
        if(readAuth && userId && userId != currentUsr.id) {
            await request('GET',`user/${userId}`,null,null,true)
            .then(async (response) => {
                if(response.content) {
                    response.content.dateOfBirth = response.content.dateOfBirth?new Date(response.content.dateOfBirth):new Date();
                    usr = response.content;
                    setUser(response.content);
                    await request('GET','expirydate',null,{
                        receivableId:response.content.userType.id,
                        userId:userId
                    },true)
                    .then((response) => {
                        if(response.content) {
                            setExpiryDate(new Date(response.content));
                        }
                    })
                }  else {
                    navigate(state?state.parentPath:'/users')
                }
            })
            .catch((error) => {
                navigate(state?state.parentPath:'/users')
            })
        } else {
            usr = currentUsr;
            setUser(currentUsr);
            slf = true;
            await request('GET','expirydate',null,{
                receivableId:currentUsr.userType.id,
                userId:currentUsr.id
            },true)
            .then((response) => {
                if(response.content) {
                    setExpiryDate(new Date(response.content));
                } 
            })
        }
        let btns = [];
        if(usr && (updateAuth || slf ) && (usr.status === 'ACTIVE' || usr.status === 'OTP')) {
            btns.push(
                {
                    Icon:PiPencilSimple,
                    name:'Edit',
                    handler:onEdit
                }
            )
            if(updateAuth && !slf) {
                btns.push(
                    {
                        Icon:PiLockKeyOpen,
                        name:'Reset Password',
                        handler:onResetPassword
                    }
                )
            }
        }
        setButtons(btns);
        setLoading(false)
    }

    useEffect(() => {
        getUser();
    },[path])

    if(user) {
        return (
            <ContentContainer 
                previous={state?state.parentPath:'/home'} 
                buttons={buttons} 
                Icon={() => <div className='flex w-10 h-10 items-center justify-center shrink-0 rounded-full bg-[rgb(0,175,240)] shadow-lg'>
                            {user && <p className='flex w-fit h-auto m-auto text-white text-xl font-jostMedium'>
                                    {user.firstname.charAt(0).toUpperCase()+user.lastname.charAt(0).toUpperCase()}
                            </p>}
                        </div>} 
                text={user.name} 
                loading={loading}
            >
                <div className='flex flex-col w-full h-auto space-y-4'>
                    <div className='flex flex-col w-full h-auto space-y-2 text-xs tracking-wider'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular  text-[rgba(0,175,240,.5)] uppercase'>System Details</p>
                        <Detail label='Username' value={user.username}/>
                        <Detail label='Email' value={user.email}/>
                        <Detail label='User Type' value={user.userType?user.userType.name:''} capitalize={true}/>
                        {user.userGroup && <Detail label='User Group' value={user.userGroup.name}/>}
                        {expiryDate && <Detail label='Expiry date' value={expiryDate.toLocaleString('default', { month: 'long' })+' '+expiryDate.getDate()+', '+expiryDate.getFullYear()+' '+expiryDate.toLocaleTimeString('en-US')}/>}
                    </div>
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Personal Details</p>
                        <Detail label='Firstname' value={user.firstname} capitalize={true}/>
                        <Detail label='Lastname' value={user.lastname} capitalize={true}/>
                        {user.middlename && user.middlename !== '' && <Detail label='Middle' value={user.middlename} capitalize={true}/>}
                        {user.sex && user.sex !== '' && <Detail label='Sex' value={user.sex}/>}
                        {user.dateOfBirth && user.dateOfBirth !== '' && <Detail label='Date of Birth' value={user.dateOfBirth.toLocaleString('default', { month: 'long' })+' '+user.dateOfBirth.getDate()+', '+user.dateOfBirth.getFullYear()}/>}
                        {user.idType && user.idType !== '' && <Detail label='ID Type' value={user.idType}/>}
                        {user.idNumber && user.idNumber !== '' && <Detail label='ID Number' value={user.idNumber}/>}
                        {user.nationality && user.nationality !== '' && <Detail label='Nationality' value={user.nationality}/>}
                    </div>
                    {((user.phone1 && user.phone1 !== '') || (user.phone2 && user.phone2 !== '') || (user.physicalAddress && user.physicalAddress !== '') ||
                        (user.postalAddress && user.postalAddress !== '') || (user.district && user.district.name) || (user.district && user.district.province)) && 
                        <div className='flex flex-col w-full h-auto space-y-2'>
                            <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Contact Details</p>
                            {user.phone1 && user.phone1 !== '' && <Detail label='Phone 1' value={user.phone1}/>}
                            {user.phone2 && user.phone2 !== '' && <Detail label='phone 2' value={user.phone2}/>}
                            {user.physicalAddress && user.physicalAddress !== '' && <Detail label='Physical Address' value={user.physicalAddress} capitalize={true}/>}
                            {user.postalAddress && user.postalAddress !== '' && <Detail label='Postal Address' value={user.postalAddress} capitalize={true}/>}
                            {user.district && user.district.name && <Detail label='District' value={user.district.name}/>}
                            {user.district && user.district.province && <Detail label='Province' value={user.district.province}/>}
                        </div>
                    }
                    {((user.program && user.program !== '') || (user.institution && user.institution !== '') || (user.professionalCategory && user.professionalCategory !== '')) &&
                        <div className='flex flex-col w-full h-auto space-y-2'>
                            <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Educational Details</p>
                            {user.program && user.program !== '' && <Detail label='Program' value={user.program}/>}
                            {user.institution && user.institution !== '' && <Detail label='Institution' value={user.institution}/>}
                            {user.professionalCategory && user.professionalCategory !== '' && <Detail label='Professional Category' value={user.professionalCategory}/>}
                        </div>
                    }
                    {user.employed &&
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Employment Details</p>
                        <Detail label='Employed' value={user.employed?'Yes':'No'}/>
                        {user.employer && user.employer !== '' && <Detail label='Employer' value={user.employer}/>}
                        {user.organizationalUnit && user.organizationalUnit !== '' && <Detail label='Organizational Unit' value={user.organizationalUnit}/>}
                        {user.currentPosition && user.currentPosition !== '' && <Detail label='Current Position' value={user.currentPosition}/>}
                        {user.facility && user.facility !== '' && <Detail label='Facility' value={user.facility}/>}
                    </div>}
                </div>
            </ContentContainer>
        )
    } else {
        return (
            <></>
        )
    }
}

export default User

/* const Transactions = ({user,readAuthority}) => {
    const {setDialog, setPopupData,transactionFilter,setTransactionFilter} = useContext(GlobalContext);
    const [transactions,setTransactions] = useState([]);
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

    const onFilter = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <TransactionFilter userId={user.id} reload={load}/>
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
        if(readAuthority) {
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
                    setTransactions([]);
                }
            })
            .catch((error) => {
                setTransactions([]);
            });
        } else if(currentUser.id === user.id) {
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
                    setTransactions([]);
                }
            })
            .catch((error) => {
                setTransactions([]);
            });
        } else {
            setTransactions([]);
        }
        setLoading(false);
    }

    const load = async (filter) => {
        if(filter) {
            getTransactions(filter, page)
        }
    }

    useEffect(() => {
        if(user && transactionFilter) {
            transactionFilter.userId = user.id;
            load(transactionFilter);
        }
    },[user,page])

    return (
        <div className='flex flex-col w-full h-fit'>
            <div className='flex flex-row w-full h-fit items-center space-x-2'>
                <button 
                    onClick={onFilter}
                    className='flex w-10 h-10 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.04)] rounded-full'
                >
                    <PiFunnel size={20} className='flex m-auto'/>
                </button>
                {transactions  && totalElements >  pageSize &&
                <div className='flex flex-wrap w-full h-fit justify-between items-center'>
                    <p className='w-0 sm:w-auto text-xs font-helveticaNeueRegular text-[rgb(145,145,145)] tracking-wider overflow-hidden'>
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
            </div>
            {transactions && transactions.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {transactions.map((transaction,i) => <TransactionItem key={i} transaction={transaction}/>)}
            </div>
            }
        </div>
    )
} */

