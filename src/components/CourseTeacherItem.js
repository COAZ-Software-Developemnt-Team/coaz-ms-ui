import React, {useState,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams } from 'react-router-dom';
import { PiBookLight,PiChalkboardTeacherLight,PiUserPlus,PiUserMinus, PiLockFill } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import {useData} from '../data';


const CourseTeacherItem = ({courseTeacher,showTeacher,parent,reload, setLoading}) => {
    const {setDialog,screenSize} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const {currentUserId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();

    const ENROLLMENTS = 'enrollments';
    const PROGRAMS = 'programs';
    const MY_COURSES = 'my_courses';

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        if(currentUserId && courseTeacher.course && courseTeacher.teacher && parent === MY_COURSES) {
            navigate(`/${currentUserId}/my_courses/courseteacher/${courseTeacher.course.id}/${courseTeacher.teacher.id}`,{state:{parentPath:path}})
        } else if(currentUserId && courseTeacher.course) {
            navigate(`/${currentUserId}/my_courses/${courseTeacher.course.id}`,{state:{parentPath:path}})
        }
    }

    const onTeach = async (e) => {
        e.preventDefault();
        if(courseTeacher.course) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Teach' 
                        message={`Are you sure you want to start teaching ${courseTeacher.course.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('POST','courseteacher',null,{
                                courseId:courseTeacher.course.id
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
        if(courseTeacher.course && courseTeacher.teacher) {
            e.preventDefault();
        if(courseTeacher.course) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Stop teaching' 
                        message={`Are you sure you want to stop teaching ${courseTeacher.course.name}? 
                            If you click 'Yes', any progress made by enrolled students in this cpd will be permanently deleted`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('DELETE','courseteacher',null,{
                                courseId:courseTeacher.course.id,
                                teacherId:courseTeacher.teacher.id
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

    return (
        <div className='flex flex-row w-full h-auto'>
            {courseTeacher && courseTeacher.course &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={onOpen}
                    className={`flex flex-row w-fit items-center space-x-2 shrink-0 ${parent === MY_COURSES?'cursor-pointer':''}`}>
                    {courseTeacher.teacher?
                        <div className='relative w-fit h-fit'>
                            <PiChalkboardTeacherLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                            {!courseTeacher.course.available && 
                                <div className='absolute right-0 bottom-0 w-fit h-fit'>
                                    <PiLockFill size={20} className='text-red-400 shrink-0'/>
                                </div>
                            }
                        </div>
                        :
                        <div className='relative w-fit h-fit'>
                            <PiBookLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                            {!courseTeacher.course.available && 
                                <div className='absolute right-0 bottom-0 w-fit h-fit'>
                                    <PiLockFill size={20} className='text-red-400 shrink-0'/>
                                </div>
                            }
                        </div>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {showTeacher && courseTeacher.teacher?courseTeacher.teacher.name:courseTeacher.course.name}
                        </p>
                        <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis'>
                            {`${USDecimal.format(courseTeacher.course.points)} points`}
                        </p>
                    </div>
                </div>
                {(highlighted || screenSize === 'xs') && parent === MY_COURSES && 
                    <div className='flex flex-row w-fit h-10 shrink-0'>
                        {courseTeacher.teacher? 
                            <button onClick={onLeave}
                                className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-500 rounded-full'>
                                <PiUserMinus size={20} />
                            </button>
                            :
                            <button onClick={onTeach}
                                className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-[rgb(0,175,240)] rounded-full'>
                                <PiUserPlus size={20} />
                            </button>
                        }
                    </div>
                }
            </div>}
        </div>
    )
}

export default CourseTeacherItem