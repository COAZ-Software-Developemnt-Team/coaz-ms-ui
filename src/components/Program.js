import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet, useOutletContext } from 'react-router-dom';
import EditProgram from './EditProgram';
import { PiGraduationCapFill,PiBook,PiTag, PiPencilSimple } from 'react-icons/pi';
import AddCourse from './AddCourse';
import CourseItem from './CourseItem';
import AddTariff from './AddTariff';
import Tariff from './Tariff';
import Detail from './Detail';
import ContentContainer from './ContentContainer';
import UserItem from './UserItem';
import {useData} from '../data'

const Program = () => {
    const {setDialog} = useContext(GlobalContext);
    const [program,setProgram] = useState(null);
    const [students,setStudents] = useState([]);
    const [courses,setCourses] = useState([]);
    const [tariffs,setTariffs] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState();
    const [parent,setParent] = useState(null);
    const [parentPath,setParentPath] = useState(null);
    const location = useLocation();
    const state = location.state;
    const {request} = useData();
    const {currentUserId,programId,courseId} = useParams();
    const path = useLocation().pathname;

    const ENROLLMENTS = 'enrollments';
    const PROGRAMS = 'programs';

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
            Component:() => <AddCourse programId={programId} reload={getCourses}/>
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
                                name:'Add CPD',
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

    const getCourses = async (parent) => {
        if(parent && parent === PROGRAMS) {
            await request('GET','courses/program',null,{
                programId:programId
            },true)
            .then((response) => {
                if(response.content) {
                    setCourses(response.content);
                } else {
                    setCourses([])
                }
            })
            .catch((error) => {
                setCourses([])
            })
        } else {
            await request('GET','courses/program/available',null,{
                programId:programId
            },true)
            .then((response) => {
                if(response.content) {
                    setCourses(response.content);
                } else {
                    setCourses([])
                }
            })
            .catch((error) => {
                setCourses([])
            })
        }
    }

    const getTariffs = async () => {
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

    const getStudents = async () => {
        await request('GET','programstudents/program',null,{
            programId:programId
        },true)
        .then((response) => {
            if(response.content) {
                setStudents(response.content);
            } else {
                setStudents([])
            }
        })
        .catch((error) => {
            setStudents([])
        })
    }

    const load = async () => {
        setLoading(true);
        let prt = null;
        if(path) {
            if(path.includes(PROGRAMS)) {
                prt = PROGRAMS;
            } else if(path.includes(ENROLLMENTS)) {
                prt = ENROLLMENTS;
            }
        }
        setParent(prt);
        if(!courseId && state && state.parentPath) {
            setParentPath(state.parentPath);
        }
        await getProgram();
        await getCourses(prt);
        await getTariffs();
        await getStudents();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{courseId?
        <Outlet/>
        :
        <ContentContainer previous={parentPath?parentPath:currentUserId?`/${currentUserId}/home`:'/home'} 
            buttons={parent === PROGRAMS?buttons:null} 
            Icon={PiGraduationCapFill} 
            text={program?program.name:''} 
            loading={loading}>
            <div className='flex flex-col w-full h-auto space-y-4'>
                {program && 
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                    {program.description && <Detail label='Description' value={program.description}/>}
                    <Detail label='Tariff Applicable' value={program.tariffApplicable?'Yes':'No'}/>
                    {program.tariffApplicable && program.criteriaPathItem &&
                    <Detail label='Tariff Criteria Path' value={program.criteriaPathItem.id}/>
                    }
                </div>
                }
                {courses && courses.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Courses</p>
                    {courses.map((course,i) => <CourseItem key={i} course={course} parent={parent} reload={getCourses}/>)}
                </div>
                }
                {tariffs && tariffs.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Tariffs</p>
                    {tariffs.map((tariff,i) => <Tariff key={i} tariff={tariff} reload={getTariffs}/>)}
                </div>
                }
                {parent === PROGRAMS && students && students.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Students</p>
                    {students.map((student,i) => <UserItem key={i} user={student.student} reload={getStudents}/>)}
                </div>
                }
            </div>
        </ContentContainer>
        }
    </>
  )
}

export default Program