import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, useOutletContext } from 'react-router-dom';
import { PiDotsThreeVertical,PiTag,PiTrash, PiUsersThreeFill, PiMaskHappyLight, PiPencilSimple, PiMaskHappy, PiPath } from 'react-icons/pi';
import Scrollable from './Scrollable';
import YesNoDialog from './YesNoDialog';
import EditUserType from './EditUserType';
import AddTariff from './AddTariff';
import AddContextRole from './AddContextRole';
import Tariff from './Tariff';
import MsHeader from './Header';
import { useData } from '../App';
import Detail from './Detail';
import ContentContainer from './ContentContainer';

const UserType = () => {
    const {setDialog} = useContext(GlobalContext);
    const [userType,setUserType] = useState(null);
    const [objectContextRoles,setObjectContextRoles] = useState([]);
    const [tariffs,setTariffs] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const [request] = useData();
    const {userTypeId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const onEdit = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <EditUserType id={userTypeId} reload={load}/>
        })
    }
const [request] = useData;
    const onAssignRole = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddContextRole objectId={userTypeId} reload={load}/>
        })
    }

    const onAddTariff = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddTariff receivableId={userTypeId} reload={load}/>
        })
    }

    const getUserType = async () => {
        let updateAuth = false;
        let createContextAuth = false;
        let createTariffAuth = false;
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                updateAuth = true;
            }
        })

        await request('GET','hasauthority',null,{
            contextName:'CONTEXT',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                createContextAuth = true;
            }
        })

        await request('GET','hasauthority',null,{
            contextName:'TARIFF',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                createTariffAuth = true;
            }
        })

        if(userTypeId) {
            await request('GET',`usertype/${userTypeId}`,null,null,false)
            .then((response) => {
                if(response.content) {
                    setUserType(response.content);
                    let btns = [];
                    if(updateAuth) {
                        btns.push(
                            {
                                Icon:PiPencilSimple,
                                name:'Edit',
                                handler:onEdit
                            }
                        );
                    }

                    if(updateAuth && createContextAuth) {
                        btns.push(
                            {
                                Icon:PiMaskHappy,
                                name:'Assign Role',
                                handler:onAssignRole
                            }
                        );
                    }
                    if(response.content.tariffApplicable && updateAuth && createTariffAuth) {
                        btns.push({
                            Icon:PiTag,
                            name:'Add Tariff',
                            handler:onAddTariff
                        })
                    }
                    setButtons(btns);
                }  else {
                    setUserType(null);
                }
            })
            .catch((error) => {
                setUserType(null);
            })
        }
    }

    const getObjectContextRoles = async () => {
        await request('GET','objectcontextroles/object',null,{
            objectId:userTypeId
        },true)
        .then((response) => {
            if(response.content) {
                setObjectContextRoles(response.content);
            } else {
                setObjectContextRoles([])
            }
        })
        .catch((error) => {
            setObjectContextRoles([])
        })
    }

    const getTariffs = async () => {
        if(userTypeId) {
            request('GET',`tariffs/${userTypeId}`,null,null,true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    setTariffs(response.content);
                } else {
                    setTariffs([]);
                }
            })
            .catch((error) => {
                setTariffs([]);
            })
        }
    }

    const load = async () => {
        setLoading(true);
        await getUserType();
        await getObjectContextRoles();
        await getTariffs();
        setLoading(false);
    }

    useEffect(() => {
        load()
    },[path])

  return (
    <div className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            <ContentContainer previous={parentPath} buttons={buttons} Icon={PiUsersThreeFill} text={userType?userType.name:''} subText={userType?userType.description:''} loading={loading}>
                {userType &&
                <div className='flex flex-col w-full h-fit space-y-4'>
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                        <Detail label='Tariff Applicable' value={userType.tariffApplicable?'Yes':'No'}/>
                        {userType.tariffApplicable && userType.criteriaPathItem &&
                            <Detail label='Tariff Criteria Path' value={userType.criteriaPathItem.id}/>
                        }
                    </div>
                    {objectContextRoles && objectContextRoles.length > 0 &&
                    <div className='flex flex-col w-full h-auto'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Context Roles</p>
                        {objectContextRoles.map((objectContextRole,i) => <ObjectContextRole key={i} objectContextRole={objectContextRole} reload={load}/>)}
                    </div>
                    }
                    {userType.tariffApplicable && tariffs && tariffs.length > 0 &&
                    <div className='flex flex-col w-full h-auto'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Tariffs</p>
                        {tariffs.map((tariff,i) => <Tariff key={i} tariff={tariff} reload={load}/>)}
                    </div>
                    }
                </div>
                }
            </ContentContainer>
    </div>
  )
}

export default UserType

const ObjectContextRole = ({objectContextRole,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [deleteContextRoleAuth,setDeleteContextRoleAuth] = useState(false);
    const [highlighted,setHighlighted] = useState(false);
    const [request] = useData();
    const path = useLocation().pathname;
    const moreRef = useRef(null)

    const onDelete = (e) => {
        e.preventDefault();
        if(objectContextRole && objectContextRole.object && !objectContextRole.object.reserved && updateAuthority && deleteContextRoleAuth) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Delete context role' 
                        message={`Are you sure you want to delete ${objectContextRole.context.name.toLowerCase()} ${objectContextRole.role.name.toLowerCase()}?`} 
                        onYes={async (e) => {
                            await request('DELETE','objectcontextrole',null,{
                                objectId:objectContextRole.object.id,
                                contextName:objectContextRole.context.id
                            },true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    useEffect(() => {
        ( async () => {
            await request('GET','hasauthority',null,{
                contextName:'USERTYPE',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status === 'YES') {
                    setUpdateAuthority(true);
                }  else {
                    setUpdateAuthority(false);
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'CONTEXT',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status === 'YES') {
                    setDeleteContextRoleAuth(true);
                }  else {
                    setDeleteContextRoleAuth(false);
                }
            })}
        )();
    },[]);

    return (
        <div className='flex flex-row w-full h-auto'>
            {objectContextRole &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <PiMaskHappyLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {objectContextRole.context.name.toLowerCase()}
                        </p>
                        <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular capitalize'>
                            {objectContextRole.role.name.toLowerCase()}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && objectContextRole.object && !objectContextRole.object.reserved && updateAuthority && deleteContextRoleAuth &&
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            <button 
                                                onClick={onDelete}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiTrash size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Delete
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

