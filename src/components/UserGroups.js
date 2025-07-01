import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {useLocation,useParams,Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical, PiUsersFour,PiUsersFourFill, PiUsersFourLight, PiPencilSimple } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddUserGroup from './AddUserGroup';
import MsHeader from './Header';
import EditUserGroup from './EditUserGroup';
import { request } from '../App';
import ContentContainer from './ContentContainer';

const UserGroups = () => {
    const {setDialog} = useContext(GlobalContext);
    const [userGroups,setUserGroups] = useState([]);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const {userGroupId} = useParams();
    const path = useLocation().pathname;

    const onAddUserGroup = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddUserGroup reload={load}/>
        })
    }

    const getUserGroups = async () => {
        
        await request('GET','usergroups',null,null,true)
        .then((response) => {
            if(response.content) {
                setUserGroups(response.content);
            } else {
                setUserGroups(null);
            }
        })
        .catch((error) => {
            setUserGroups(null);
        });
    }

    const load = async () => {
       
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiUsersFour,
                        name:'Add User Group',
                        handler:onAddUserGroup
                    }
                ])
            }
        })
        
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setUpdateAuthority(true);
            }
        })

        
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        getUserGroups();
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{userGroupId?
        <Outlet context={{parentPath:`/usergroups`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiUsersFourFill} text='User Groups'>
            {userGroups && userGroups.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {userGroups.map((userGroup,i) => <UserGroupItem key={i} userGroup={userGroup} updateAuthority={updateAuthority} deleteAuthority={deleteAuthority} reload={load}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default UserGroups

const UserGroupItem = ({userGroup,updateAuthority,deleteAuthority,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    const onEdit = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <EditUserGroup id={userGroup.id} reload={reload}/>
        })
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(userGroup && !userGroup.reserved && deleteAuthority) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete User Group' 
                        message={`Are you sure you want to delete ${userGroup.name}?`} 
                        onYes={async (e) => {
                            
                            await request('DELETE',`usergroup/${userGroup.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {userGroup &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiUsersFourLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${userGroup.name}`}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && !userGroup.reserved && deleteAuthority && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            {updateAuthority && 
                                                <button 
                                                    onClick={onEdit}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiPencilSimple size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Edit
                                                    </p>
                                                </button>
                                            }
                                            {deleteAuthority && 
                                                <button 
                                                    onClick={onDelete}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiTrash size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Delete
                                                    </p>
                                                </button>
                                            }
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