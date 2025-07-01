import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical,PiTag, PiUsersThree,PiUsersThreeFill, PiUsersThreeLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddUserType from './AddUserType';
import MsHeader from './Header';
import {request} from '../App'
import ContentContainer from './ContentContainer';

const UserTypes = () => {
    const {setDialog} = useContext(GlobalContext);
    const [userTypes,setUsersTypes] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {userTypeId} = useParams();
    const path = useLocation().pathname;

    const onAddUserType = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddUserType reload={load}/>
        })
    }

    const getUserTypes = async () => {
        await request('GET','usertypes',null,null,false)
        .then((response) => {
            if(response.content) {
                setUsersTypes(response.content);
            } else {
                setUsersTypes([]);
            }
        })
        .catch((error) => {
            setUsersTypes([]);
        });
    }

    const load = async () => {
        setLoading(true);
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiUsersThree,
                        name:'Add User Type',
                        handler:onAddUserType
                    }
                ])
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        await getUserTypes();
        setLoading(false)
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{userTypeId?
        <Outlet context={{parentPath:`/usertypes`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiUsersThreeFill} text='User Types' loading={loading}>
            {userTypes && userTypes.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                {userTypes.map((userType,i) => <UserTypeItem key={i} userType={userType} deleteAuthority={deleteAuthority} reload={load}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default UserTypes

const UserTypeItem = ({userType,deleteAuthority,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [tariff,setTariff] = useState(null);
    const moreRef = useRef(null)

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onDelete = (e) => {
        e.preventDefault();
        if(userType && !userType.reserved && deleteAuthority) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete User Type' 
                        message={`Are you sure you want to delete ${userType.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE',`usertype/${userType.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    const getTariff = () => {
        if(userType) {
            request('GET','tariff/default',null,{receivableId:userType.id},true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    setTariff(response.content);
                }
            })
        }
    }

    useEffect(() => {
        getTariff();
    },[userType])

    return (
        <div className='flex flex-row w-full h-auto'>
            {userType &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/usertypes/${userType.id}`)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiUsersThreeLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${userType.name}`}
                        </p>
                        {userType.tariffApplicable? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{tariff && tariff.price?`K ${USDecimal.format(tariff.price)}`:'No default tariff'}</p>
                            </div>
                            :
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && !userType.reserved && deleteAuthority && 
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