import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet, useOutletContext } from 'react-router-dom';
import EditProgram from './EditProgram';
import { PiGraduationCapFill,PiBook,PiTag, PiPencilSimple } from 'react-icons/pi';
import AddProgramCourse from './AddProgramCourse';
import ProgramCourseItem from './ProgramCourseItem';
import AddTariff from './AddTariff';
import Tariff from './Tariff';
import Scrollable from './Scrollable';
import MsHeader from './Header';
import Detail from './Detail';
import {request} from '../App'

const Program = () => {
    const {setDialog} = useContext(GlobalContext);
    const [program,setProgram] = useState(null);
    const [programCourses,setProgramCourses] = useState([]);
    const [tariffs,setTariffs] = useState([]);
    const [buttons,setButtons] = useState([]);
    const {programId,courseId} = useParams();
    const {parentPath} = useOutletContext();
    const patn = useLocation().pathname;

    const onEdit = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <EditProgram id={programId} reload={getProgram}/>
        })
    }

    const onAddCourse = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddProgramCourse programId={programId} reload={getCourses}/>
        })
    }

    const onAddTariff = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddTariff receivableId={programId} reload={getTariffs}/>
        })
    }

    const getProgram = async () => {
        let updateAuth = false;
        let createTariffAuth = false;
        await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                updateAuth = true;
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

        if(programId) {
            await request('GET',`program/${programId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    response.content.startDate = response.content.startDate?new Date(response.content.startDate):new Date();
                    setProgram(response.content);
                    let btns = [];
                    if(updateAuth) {
                        btns.push(
                            {
                                Icon:PiPencilSimple,
                                name:'Edit',
                                handler:onEdit
                            }
                        );
                        
                        btns.push(
                            {
                                Icon:PiBook,
                                name:'Add Course',
                                handler:onAddCourse
                            }
                        )
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
                    setProgram(null);
                }
            })
            .catch((error) => {
                setProgram(null);
            })
        }
    }

    const getCourses = async () => {
        await request('GET','programcourses/program',null,{
            programId:programId
        },true)
        .then((response) => {
            if(response.content) {
                setProgramCourses(response.content);
            } else {
                setProgramCourses([])
            }
        })
        .catch((error) => {
            setProgramCourses([])
        })
    }

    const getTariffs = () => {
        if(programId) {
            request('GET',`tariffs/${programId}`,null,null,true)
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

    useEffect(() => {
        getProgram();
        getCourses();
        getTariffs();
    },[patn])
  return (
    <>{courseId?
        <Outlet context={{parentPath:`/programs/${programId}`}}/>
        :
        <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
            className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            {program &&
                <>
                <MsHeader previous={parentPath} buttons={buttons} Icon={PiGraduationCapFill} text={program.name} subText={program.description}/>
                <div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
                    <Scrollable vertical={true}>
                        <div className='flex flex-col w-full h-auto space-y-4'>
                            <div className='flex flex-col w-full h-auto space-y-2'>
                                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                                <Detail label='Tariff Applicable' value={program.tariffApplicable?'Yes':'No'}/>
                                {program.tariffApplicable && program.criteriaPathItem &&
                                    <Detail label='Tariff Criteria Path' value={program.criteriaPathItem.id}/>
                                }
                            </div>
                            {programCourses && programCourses.length > 0 &&
                            <div className='flex flex-col w-full h-auto'>
                                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Courses</p>
                                {programCourses.map((programCourse,i) => <ProgramCourseItem key={i} programCourse={programCourse} reload={getCourses}/>)}
                            </div>
                            }
                            {tariffs && tariffs.length > 0 &&
                            <div className='flex flex-col w-full h-auto'>
                                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Tariffs</p>
                                {tariffs.map((tariff,i) => <Tariff key={i} tariff={tariff} reload={getTariffs}/>)}
                            </div>
                            }
                        </div>
                    </Scrollable>
                </div>
                </>
            }
        </div>
        }
    </>
  )
}

export default Program