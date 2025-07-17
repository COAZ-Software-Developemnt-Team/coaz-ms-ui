import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical,PiTag, PiUsersThree,PiUsersThreeFill, PiUsersThreeLight, PiPath, PiPathFill, PiPathLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddCriteriaPathItem from './AddCriteriaPathItem';
import CriteriaPathItem from './CriteriaPathItem';
import MsHeader from './Header';
import {useData} from '../data'

const CriteriaPathItems = () => {
    const {setDialog} = useContext(GlobalContext);
    const [roots,setRoots] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const {request} = useData();
    const {pathId} = useParams();
    const path = useLocation().pathname;

    const onAddCriteriaPathItem = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddCriteriaPathItem reload={load}/>
        })
    }

    const getRoots = async () => {
        await request('GET','criteriapath/roots',null,null,true)
        .then((response) => {
            if(response.content) {
                setRoots(response.content);
            } else {
                setRoots([]);
            }
        })
        .catch((error) => {
            setRoots([]);
        });
    }

    const load = async () => {
        getRoots();
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{pathId?
        <Outlet context={{parentPath:`/paths`}}/>:
        <div className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            <MsHeader previous='/home' buttons={buttons} Icon={PiPathFill} text='Criteria Paths'/>
            <div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
                <Scrollable vertical={true}>
                    <div className='flex flex-col w-full h-auto space-y-4'>
                        {roots && roots.length > 0 &&
                        <div className='flex flex-col w-full h-auto space-y-2'>
                            <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Roots</p>
                            {roots.map((root,i) => <CriteriaPathItem key={i} criteriaPathItem={root} deleteAuthority={deleteAuthority} reload={load}/>)}
                        </div>
                        }
                    </div>
                </Scrollable>
            </div>
        </div>
    }
    </>
  )
}

export default CriteriaPathItems