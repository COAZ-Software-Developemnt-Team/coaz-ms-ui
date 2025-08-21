import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import {PiGraduationCap,PiGraduationCapFill,PiGraduationCapLight, PiStudent,PiStudentLight,PiTrash,PiDotsThreeVertical,PiTag } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import AddProgram from './AddProgram';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const Programs = () => {
    const {setDialog} = useContext(GlobalContext);
    const [programs,setPrograms] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const {request} = useData();
    const [loading,setLoading] = useState();
    const {currentUserId,programId} = useParams();
    const path = useLocation().pathname;
    var loaded = false;

    const onAddProgram = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddProgram reload={getPrograms}/>
        })
    }

    const getPrograms = async () => {
        await request('GET','programs',null,null,true)
        .then((response) => {
            if(response.content) {
                setPrograms(response.content);
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const load = async () => {
        setLoading(true);
        await request('GET','hasauthority',null, {
            contextName:'PROGRAM',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiGraduationCap,
                        name:'Add Program',
                        handler:onAddProgram
                    }
                ])
            }
        })
        
        await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        await getPrograms();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{programId?
        <Outlet context={{parentPath:`/programs`}}/>:
        <ContentContainer previous={currentUserId?`/${currentUserId}/home`:'/home'} buttons={buttons} Icon={PiGraduationCapFill} text='Programs' loading={loading}>
            {programs && programs.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                    All Programs
                </p>
                {programs.map((program,i) => <ProgramItem key={i} program={program} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Programs

const ProgramItem = ({program,deleteAuthority,reload,setLoading}) => {
    const {setDialog,screenSize} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [defaultTariff,setDefaultTariff] = useState(null);
    const {currentUserId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
         if(program) {
            navigate(`/${currentUserId}/programs/${program.id}`,{state:{parentPath:path}})
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(program) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Program' 
                        message={`Are you sure you want to delete ${program.name}?`} 
                        onYes={async (e) => {
                            setLoading(true)
                            await request('DELETE',`program/${program.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                            setLoading(false)
                        }}
                    />
            })
        }
    }

    useEffect(() => {
        if(program && program.tariffApplicable) {
            request('GET','tariff/default',null,{receivableId:program.id},true)
            .then((response) => {
                if(response.content) {
                    setDefaultTariff(response.content);
                }
            })
        }
    },[])

    return (
        <div className='flex flex-row w-full h-auto'>
            {program &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between hover:bg-[rgba(0,0,0,.04)] rounded-md overflow-hidden'>
                <div onClick={onOpen}
                    className='flex flex-row w-full items-center space-x-2 cursor-pointer overflow-hidden'>
                    <PiGraduationCapLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular break-words overflow-hidden overflow-ellipsis capitalize`}>
                            {`${program.name}`}
                        </p>
                        {program.tariffApplicable && defaultTariff? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{`K ${USDecimal.format(defaultTariff.price)}`}</p>
                            </div>
                            :
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                    {((highlighted || screenSize === 'xs') && deleteAuthority) && 
                        <button onClick={onDelete}
                            className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-500 rounded-full'>
                            <PiTrash size={20} />
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}