import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiBook,PiBookFill,PiBookLight, PiChalkboardTeacher,PiChalkboardTeacherLight,PiTrash,PiDotsThreeVertical,PiTag } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddCourse from './AddCourse';
import MsHeader from './Header';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const Courses = () => {
    const {setDialog} = useContext(GlobalContext);
    const [myClasses,setMyClasses] = useState([]);
    const [availableCourses,setAvailableCourses] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [loading,setLoading] = useState();
    const {request} = useData();
    const {courseId} = useParams();
    const path = useLocation().pathname;

    const onAddCourse = (e) => {
        setDialog({
            show:true,
            Component:() => 
                <AddCourse reload={getAvailableCourses}/>
        })
    }

    const getMyClasses = async () => {
        await request('GET','classes',null,null,true)
        .then((response) => {
            if(response.content) {
                setMyClasses(response.content);
            }
        })
    }

    const getAvailableCourses = async () => {
        await request('GET','classes/available',null,null,true)
        .then((response) => {
            if(response.content) {
                setAvailableCourses(response.content);
            }
        })
    }

    const load = async () => {
        setLoading(true);
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiBook,
                        name:'Add CPD',
                        handler:onAddCourse
                    }
                ])
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        await getMyClasses();
        await getAvailableCourses();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{courseId?
        <Outlet context={{parentPath:`/courses`}}/>:
        <ContentContainer previous='/home' buttons={buttons} Icon={PiBookFill} text='CPDs' loading={loading}>
            {myClasses && myClasses.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>My Classes</p>
                {myClasses.map((course,i) => <CourseItem key={i} course={course} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
            </div>
            }
            {availableCourses && availableCourses.length > 0 &&
            <div className='flex flex-col w-full h-auto space-y-2'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Available Courses</p>
                {availableCourses.map((course,i) => <CourseItem key={i} course={course} deleteAuthority={deleteAuthority} reload={load} setLoading={setLoading}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Courses

const CourseItem = ({course,deleteAuthority,reload, setLoading}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const {currentUserId} = useParams();
    const {request} = useData();
    const moreRef = useRef(null)

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        if(currentUserId && course.course && course.teacher) {
            navigate(`/${currentUserId}/courses/class/${course.course.id}/${course.teacher.id}`)
        } else if(currentUserId && course.course) {
            navigate(`/${currentUserId}/courses/${course.course.id}`)
        }
    }

    const onTeach = async (e) => {
        e.preventDefault();
        if(course.course) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Teach' 
                        message={`Are you sure you want to start teaching ${course.course.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('POST','class',null,{
                                courseId:course.course.id
                            },true)
                            .then((response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.message) {
                                    reload && reload()
                                }
                            })
                            setLoading(false);
                        }}
                    />
            })
        }
    }
    
    const onLeave = async (e) => {
        if(course.course && course.teacher) {
            e.preventDefault();
        if(course.course) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Leave class' 
                        message={`Are you sure you want to leave ${course.course.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('DELETE','class',null,{
                                courseId:course.course.id,
                                teacherId:course.teacher.id
                            },true)
                            .then((response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.message) {
                                    reload && reload()
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
        if(course.course) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete course' 
                        message={`Are you sure you want to delete ${course.course.name}?`} 
                        onYes={async (e) => {
                            setLoading(true)
                            await request('DELETE',`course/${course.course.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                            setLoading(false);
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {course && course.course &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={onOpen}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    {course.teacher?
                        <PiChalkboardTeacherLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <PiBookLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${course.course.name}`}
                        </p>
                        <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis'>
                            {`${USDecimal.format(course.course.points)} points`}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            {course.teacher?
                                                <button 
                                                    onClick={onLeave}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiChalkboardTeacher  size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Leave
                                                    </p>
                                                </button>:
                                                <button 
                                                    onClick={onTeach}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiChalkboardTeacher  size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Teach
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