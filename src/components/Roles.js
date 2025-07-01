import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical,PiMaskHappy, PiMaskHappyFill, PiMaskHappyLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddRole from './AddRole';
import MsHeader from './Header';
import { request } from '../App';
import ContentContainer from './ContentContainer';

const Roles = () => {
    const {setDialog} = useContext(GlobalContext);
    const [roles,setRoles] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {roleId} = useParams();
    const path = useLocation().pathname;

    const onAddRole = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddRole reload={load}/>
        })
    }

    const getRoles = async () => {
        await request('GET','roles',null,null,true)
        .then((response) => {
            if(response.content) {
                setRoles(response.content);
            } 
        })
    }

    const load = async () => {
        setLoading(true);
        await request('GET','hasauthority',null,{
            contextName:'ROLE',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiMaskHappy,
                        name:'Add Role',
                        handler:onAddRole
                    }
                ])
            }
        })
        
        await request('GET','hasauthority',null, {
            contextName:'ROLE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        await getRoles();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{roleId?
        <Outlet context={{parentPath:`/roles`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiMaskHappyFill} text='Roles' loading={loading}>
            {roles && roles.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {roles.map((role,i) => <RoleItem key={i} role={role} deleteAuthority={deleteAuthority} reload={load}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Roles

const RoleItem = ({role,deleteAuthority,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    const navigate = useNavigate();

    const onDelete = (e) => {
        e.preventDefault();
        if(role && !role.reserved && deleteAuthority) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Role' 
                        message={`Are you sure you want to delete ${role.name}?`} 
                        onYes={async (e) => {
                            
                            await request('DELETE',`role/${role.id}`,null,null,true)
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
            {role &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/roles/${role.id}`)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiMaskHappyLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${role.displayName}`}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && !role.reserved && deleteAuthority && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
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