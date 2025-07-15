import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {useLocation,useParams, Outlet } from 'react-router-dom';
import { PiUsers,PiUserPlus,PiUserFill,PiCaretDoubleLeft,PiCaretLeft,PiCaretDoubleRight,PiCaretRight,PiFunnel} from "react-icons/pi";
import AddUser from './AddUser';
import UserItem from './UserItem';
import AddUsers from './AddUsers';
import Filter from './UserFilter';
import { useData } from '../App';
import ContentContainer from './ContentContainer';

const Users = () => {
    const {currentUser,setDialog,userFilter} = useContext(GlobalContext);
    const [users,setUsers] = useState([]);
    const [readAuthority,setReadAuthority] = useState(false);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const {userId} = useParams();
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
    const [request] = useData;
    const [loading,setLoading] = useState(false);
    const [request] = useData();
    const path = useLocation().pathname;

    const onAddUser = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddUser reload={load}/>
        })
    }

    const onAddUsers = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddUsers reload={load}/>
        })
    }

    const onFilter = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <Filter reload={load}/>
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

    const getUsers = async (filter,page) => {
        setLoading(true);
        
        await request ('GET','hasauthority',null,{
            contextName:'USER',
            authority:'READ'
        },true)
        .then(async response => {
            if(currentUser && response.status === 'YES') {
                await request('GET','users',null,{
                    username:filter.username,
                    userTypeId:filter.userTypeId,
                    userGroupId:filter.userGroupId,
                    firstname:filter.firstname,
                    lastname:filter.lastname,
                    middlename:filter.middlename,
                    sex:filter.sex,
                    dateOfBirthDay:filter.dateOfBirthDay,
                    dateOfBirthMonth:filter.dateOfBirthMonth,
                    dateOfBirthYear:filter.dateOfBirthYear,
                    idType:filter.idType,
                    idNumber:filter.idNumber,
                    nationality:filter.nationality,
                    email:filter.email,
                    secondaryEmail:filter.secondaryEmail,
                    phone1:filter.phone1,
                    phone2:filter.phone2,
                    physicalAddress:filter.physicalAddress,
                    postalAddress:filter.postalAddress,
                    province:filter.province,
                    district:filter.district,
                    program:filter.program,
                    institution:filter.institution,
                    professionalCategory:filter.professionalCategory,
                    employed:filter.employed,
                    employer:filter.employer,
                    organizationalUnit:filter.organizationalUnit,
                    currentPosition:filter.currentPosition,
                    facility:filter.facility,
                    confirmed:filter.confirmed,
                    selfRegistration:filter.selfRegistration,
                    createdOnDay:filter.createdOnDay,
                    createdOnMonth:filter.createdOnMonth,
                    createdOnYear:filter.createdOnYear,
                    status:filter.status,
                    pageNo:page.pageNo,
                    pageSize:page.pageSize,
                    sortBy:page.sortBy,
                    sortDir:page.sortDir},true)
                .then((response) => {
                    if(response.content) {
                        setUsers(response.content);
                        setPageNo(response.pageNo);
                        setPageSize(response.pageSize);
                        setTotalElements(response.totalElements);
                        setTotalPages(response.totalPages);
                        setLast(response.last);
                    } else {
                        setUsers(null);
                    }
                })
                .catch((error) => {
                    setUsers(null);
                });
            } else if(currentUser) {
                setUsers([currentUser])
            } else {
                setUsers(null);
            }
            setLoading(false);
        })
        .catch((error) => {
            setUsers(null);
            setLoading(false);
        })
    }

    const load = async (filter) => {
        let btns = [];
        
        await request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                btns.push(
                    {
                        Icon:PiUserPlus,
                        name:'Add User',
                        handler:onAddUser
                    }
                )
                btns.push(
                    {
                        Icon:PiUsers,
                        name:'Add Users',
                        handler:onAddUsers
                    }
                )
                setReadAuthority(true);
            }
        })
        
        await request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'READ'
        },true)
      
        .then((response) => {
            if(response.status && response.status === 'YES') {
                btns.push(
                    {
                        Icon:PiFunnel,
                        name:'Filter',
                        handler:onFilter
                    }
                )
            }
        })
        
        await request('GET','hasauthority',null,{
            contextName:'USER',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        getUsers(filter,page);
        setButtons(btns);
    }

    useEffect(() => {
        load(userFilter);
    },[path,page])
  return (
    <>{userId?
        <Outlet context={{parentPath:`/users`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiUserFill} text='Users' loading={loading}>
            {readAuthority && users  && totalElements >  pageSize &&
                <div className='flex flex-wrap w-full h-fit justify-between items-center'>
                    <p className='text-xs font-helveticaNeueRegular text-[rgb(145,145,145)] tracking-wider'>
                        {`Showing ${users && users.length > 0?(pageNo * pageSize)+1:0} to ${((pageNo * pageSize)+users.length)} of ${totalElements}`}
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
            {users && users.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {users.map((user,i) => <UserItem key={i} user={user} deleteAuthority={deleteAuthority} reload={load}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Users