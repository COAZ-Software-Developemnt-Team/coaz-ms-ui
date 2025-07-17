import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import {PiGraduationCap,PiGraduationCapFill,PiGraduationCapLight, PiStudent,PiStudentLight,PiTrash,PiDotsThreeVertical,PiTag } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddProgram from './AddProgram';
import MessageDialog from './MessageDialog';
import MsHeader from './Header';
import PaymentOptions from './PaymentOptions';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const Programs = () => {
    const {setDialog} = useContext(GlobalContext);
    const [myPrograms,setMyPrograms] = useState([]);
    const [availablePrograms,setAvailablePrograms] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [buttons,setButtons] = useState([]);
    const {request} = useData();
    const [loading,setLoading] = useState()
    const {programId} = useParams();
    const path = useLocation().pathname;
    var loaded = false;

    const onAddProgram = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddProgram reload={getAvailablePrograms}/>
        })
    }

    const getMyPrograms = async () => {
        await request('GET','enrollments/my',null,null,true)
        .then((response) => {
            if(response.content) {
                setMyPrograms(response.content);
            } else {
                console.log(response)
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const getAvailablePrograms = async () => {        
        await request('GET','enrollments/available',null,null,true)
        .then((response) => {
            if(response.content) {
                setAvailablePrograms(response.content);
            } else {
                console.log(response)
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
        await getMyPrograms();
        await getAvailablePrograms();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{programId?
        <Outlet context={{parentPath:`/programs`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiGraduationCapFill} text='Programs' loading={loading}>
            {myPrograms && myPrograms.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                    My Programs
                </p>
                {myPrograms.map((program,i) => <ProgramItem key={i} program={program} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
            </div>
            }
            {availablePrograms && availablePrograms.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                    Available Programs
                </p>
                {availablePrograms.map((program,i) => <ProgramItem key={i} program={program} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Programs

const ProgramItem = ({program,deleteAuthority,reload,setLoading}) => {
    const {setDialog,setPopupData,screenSize,setAccess} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [userType,setUserType] = useState(null);
    const [tariff,setTariff] = useState(null);
    const [paid,setPaid] = useState(false);
    const {request} = useData();
    const moreRef = useRef(null);

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        if(program.program && program.student) {
            navigate(`/programs/enrollment/${program.program.id}`);
            /* if(paid) {
                navigate(`/programs/enrollment/${program.program.id}`);
            } else {
                if(program.program && userType && tariff) {
                    setAccess({Component:() => <Payment user={program.student} tariff={tariff}  reload={reload}/>});
                } 
            } */
        } else if(program.program) {
            navigate(`/programs/${program.program.id}`)
        }
    }

    const onEnroll = async (e) => {
        e.preventDefault();
        if(program.program) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Enroll' 
                        message={`Are you sure you want to enroll in ${program.program.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('POST','enrollment',null,{
                                programId:program.program.id
                            },true)
                            .then((response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                                    if(!response.content.paid && response.content.tariff) {
                                        setAccess({Component:() => <PaymentOptions user={response.content.student} tariff={response.content.tariff}  reload={reload}/>});
                                    } 
                                    reload && reload()
                                } else if(response.message) {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response.message} 
                                            />
                                    })
                                } else {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response} 
                                            />
                                    })
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                            setLoading(false);
                        }}
                    />
            })
        }
    }
    
    const onUnenroll = async (e) => {
        if(program.program && program.student) {
            e.preventDefault();
        if(program.program) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Unenroll' 
                        message={`Are you sure you want to unenroll from ${program.program.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('DELETE','enrollment',null,{
                                programId:program.program.id
                            },true)
                            .then((response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.message) {
                                    reload && reload()
                                } else if(response.message) {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response.message} 
                                            />
                                    })
                                } else {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response} 
                                            />
                                    })
                                }
                            })
                            setLoading(false);
                        }}
                    />
                })
            }
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(program.program) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Program' 
                        message={`Are you sure you want to delete ${program.program.name}?`} 
                        onYes={async (e) => {
                            setLoading(true)
                            await request('DELETE',`program/${program.program.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                            setLoading(false)
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {program && program.program &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between hover:bg-[rgba(0,0,0,.04)] rounded-md overflow-hidden'>
                <div onClick={onOpen}
                    className='flex flex-row w-full items-center space-x-2 cursor-pointer overflow-hidden'>
                    {program.student?
                        <PiStudentLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <PiGraduationCapLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular break-words overflow-hidden overflow-ellipsis capitalize`}>
                            {`${program.program.name}`}
                        </p>
                        {program.student?
                            program.paid?
                            <p className={`text-xs ${program.completionPercentage < 100?'text-[rgb(145,145,145)]':'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                {`${program.completionPercentage}% Complete`}
                            </p>:
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{`K ${USDecimal.format(program.tariff && program.tariff.price?program.tariff.price:0)}`}</p>
                            </div>
                            :
                        program.program.tariffApplicable? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{`K ${USDecimal.format(program.tariff && program.tariff.price?program.tariff.price:0)}`}</p>
                            </div>
                            :
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                    {(highlighted || screenSize === 'xs') && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            {program.student?
                                                <button 
                                                    onClick={onUnenroll}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiStudent  size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Unenroll
                                                    </p>
                                                </button>:
                                                <button 
                                                    onClick={onEnroll}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiStudent  size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Enroll
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