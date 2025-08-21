import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical,PiTag, PiUsersThree,PiUsersThreeFill, PiUsersThreeLight, PiPath, PiPathFill, PiPathLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddCriteriaPathItem from './AddCriteriaPathItem';
import CriteriaPathItem from './CriteriaPathItem';
import MsHeader from './Header';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const CriteriaPathItems = () => {
    const {setDialog} = useContext(GlobalContext);
    const [roots,setRoots] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {request} = useData();
    const {currentUserId,pathId} = useParams();
    const path = useLocation().pathname;

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
        setLoading(true);
        await getRoots();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{pathId?
        <Outlet/>:
        <ContentContainer previous={currentUserId?`/${currentUserId}/home`:'/home'} 
            buttons={buttons} 
            Icon={PiPathFill} 
            text='Criteria Paths' 
            loading={loading}>
            {roots && roots.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Roots</p>
                {roots.map((root,i) => <CriteriaPathItem key={i} criteriaPathItem={root} deleteAuthority={deleteAuthority} reload={load}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default CriteriaPathItems