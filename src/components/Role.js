import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, useOutletContext } from 'react-router-dom';
import { PiPencilSimple, PiMaskHappyFill, PiShieldCheckeredLight } from 'react-icons/pi';
import Scrollable from './Scrollable';
import EditRole from './EditRole';
import MsHeader from './Header';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const Role = () => {
    const {setDialog} = useContext(GlobalContext);
    const [role,setRole] = useState(null);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {request} = useData();
    const {roleId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const onEdit = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <EditRole id={roleId} reload={getRole}/>
        })
    }

    const getRole = async () => {
        setLoading(true);
        let updateAuth = false;
        await request('GET','hasauthority',null,{
            contextName:'ROLE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                setUpdateAuthority(true);
                updateAuth = true;
            }
        })

        if(roleId) {
            await request('GET',`role/${roleId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setRole(response.content);
                    if(!response.content.reserved && updateAuth) {
                        setButtons([
                            {
                                Icon:PiPencilSimple,
                                name:'Edit',
                                handler:onEdit
                            }
                        ]
                        );
                    }
                }  else {
                    setRole(null);
                }
            })
            .catch((error) => {
                setRole(null);
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        getRole();
    },[path])

  return (
    <div className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
        <ContentContainer previous={parentPath} buttons={buttons} Icon={PiMaskHappyFill} text={role?role.name:''} loading={loading}> 
            {role && role.authorities && role.authorities.length > 0 &&
            <div className='flex flex-col w-full h-auto'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Authorities</p>
                {role.authorities.map((authority,i) => <Authority key={i} authority={authority} updateAuthority={role.reserved?false:updateAuthority} reload={getRole}/>)}
            </div>
            }
        </ContentContainer>
    </div>
  )
}

export default Role

const Authority = ({authority,reload}) => {
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    return (
        <div className='flex flex-row w-full h-auto'>
            {authority &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <PiShieldCheckeredLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {authority}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    
                </div>
            </div>}
        </div>
    )
}