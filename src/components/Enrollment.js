import React, {useEffect,useState,useContext, useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,Outlet,useOutletContext } from 'react-router-dom';
import {PiStudentFill,PiChalkboardTeacherLight,PiBookLight,PiStudent,PiDotsThreeVertical,PiTag,PiLockFill, PiUserPlus, PiUserMinus } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import EnrollCourse from './EnrollCourse';
import ContentContainer from './ContentContainer';
import {useData} from '../data';
import Detail from './Detail';
import MessageDialog from './MessageDialog';

const Enrollment = () => {
    const [enrollment,setEnrollment] = useState(null);
    const {currentUserId,programId,courseId} = useParams();
    const [loading,setLoading] = useState();
    const [parentPath,setParentPath] = useState(null);
    const location = useLocation();
    const state = location.state;
    const {request} = useData();
    const path = useLocation().pathname;

    const navigate = useNavigate();

    const getEnrollment = async () => {
        setLoading(true);
        if(programId) {
            await request('GET','enrollment',null,{
                programId:programId
            },true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    if(response.content.paid) {
                        if(response.content.startDate) {
                            response.content.startDate = new Date(response.content.startDate);
                        }
                        setEnrollment(response.content);
                    } else if(response.content.student && response.content.tariff && response.content.program) {
                        navigate(`/payment_options/${currentUserId}/${response.content.tariff.receivableId}/${response.content.tariff.criteriaId}`,{state:{parentPath:state.parentPath}})
                    } else if(response.content.student && response.content.program) {
                        if(response.content.startDate) {
                            response.content.startDate = new Date(response.content.startDate);
                        }
                        setEnrollment(response.content);
                    } else {
                        navigate(`/${currentUserId}/enrollments`)
                    }
                }  else {
                    console.log(response)
                }
            })
            .catch((error) => {
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        if(!courseId && state && state.parentPath) {
            setParentPath(state.parentPath);
        }
        getEnrollment();
    },[path])
  return (
    <>{courseId? 
            <Outlet/>
            :
            <ContentContainer previous={parentPath?parentPath:currentUserId?`/${currentUserId}/home`:'/home'} 
                Icon={PiStudentFill} 
                text={enrollment && enrollment.program?enrollment.program.name:''} 
                loading={loading}>
                {enrollment &&
                <div className='flex flex-col w-full h-auto space-y-4'>
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                        {enrollment.program && enrollment.program.description && <Detail label='Description' value={enrollment.program.description}/>}
                        <Detail label='Student' value={enrollment.student? enrollment.student.name:''}/>
                        {enrollment.startDate &&
                            <Detail label='Start Date' value={enrollment.startDate.toLocaleString('default', { month: 'long' })+' '+enrollment.startDate.getDate()+', '+enrollment.startDate.getFullYear()}/>
                        }
                    </div>
                    {enrollment.enrolled && enrollment.enrolled.length > 0 &&
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>My Courses</p>
                        {enrollment.enrolled.map((enrollmentCourse,i) => <EnrollmentCourseItem key={i} enrollmentCourse={enrollmentCourse} reload={getEnrollment}/>)}
                    </div>}
                    {enrollment.available && enrollment.available.length > 0 &&
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Available Courses</p>
                        {enrollment.available.map((availableCourse,i) => <EnrollmentCourseItem key={i} enrollmentCourse={availableCourse} reload={getEnrollment}/>)}
                    </div>}
                </div>}
            </ContentContainer>
        }
    </>
  )
}

export default Enrollment

const EnrollmentCourseItem = ({enrollmentCourse,reload}) => {
    const {setDialog,screenSize} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [enrollAuthority,setEnrollAuthority] = useState(false);
    const {request} = useData();
    const {currentUserId,programId,courseId} = useParams();
    const path = useLocation().pathname;

    const navigate = useNavigate();

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onOpen = (e) => {
        e.preventDefault();
        if(enrollmentCourse.student) {
            navigate(`/${currentUserId}/enrollments/enrollment/${programId}/teacher/${enrollmentCourse.student.id}/${enrollmentCourse.course.id}`,{state:{parentPath:path}})
        } else  {
            navigate(`/${currentUserId}/enrollments/enrollment/${programId}/${enrollmentCourse.course.id}`,{state:{parentPath:path}})
        }
    }

    const onEnroll = (e) => {
        e.preventDefault();
        if(currentUserId && enrollmentCourse.course) {
            navigate(`/enroll/${currentUserId}/${enrollmentCourse.course.id}`,{state:{parentPath:path}})
        }
    }

    const onUnenroll = (e) => {
        e.preventDefault();
        if(enrollmentCourse.course && enrollmentCourse.student) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Unenroll' 
                        message={`Are you sure you want to unenroll from ${enrollmentCourse.course.name}?`} 
                        onYes={async (e) => {                             
                            await request('DELETE',`enrollment/course`,null,{
                                courseId:enrollmentCourse.course.id
                            },true)
                            .then(response => {
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
                        }}
                    />
            })
        }
    }
   
    useEffect(() => {
        ( async () => {
            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'ENROLL'
            },true)
            .then((response) => {
                if(response.status === 'YES') {
                    setEnrollAuthority(true);
                }  else {
                    setEnrollAuthority(false);
                }
            })}
        )();
    },[]);

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollmentCourse && enrollmentCourse.course &&
            <div onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={onOpen}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    {enrollmentCourse.program && enrollmentCourse.student && enrollmentCourse.courseTeacher?
                        <PiChalkboardTeacherLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <div className='relative w-fit h-fit'>
                            <PiBookLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                            {!enrollmentCourse.course.available &&
                                <div className='absolute right-0 bottom-0 w-fit h-fit'>
                                    <PiLockFill size={20} className='text-red-400 shrink-0'/>
                                </div>
                            }
                        </div>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${enrollmentCourse.course.name}`}
                        </p>
                        <div className='flex flex-row w-full space-x-1'>
                            <p className={`w-fit text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden capitalize shrink-0`}>
                                {`${USDecimal.format(enrollmentCourse.course.points)} Points`}
                            </p>
                            {enrollmentCourse.course.tariffApplicable && !enrollmentCourse.paid && enrollmentCourse.tariff?
                                <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                    ,<PiTag size={16}/>
                                    <p>{`K ${USDecimal.format(enrollmentCourse.tariff && enrollmentCourse.tariff.price?enrollmentCourse.tariff.price:0)}`}</p>
                                </div>
                                :
                            enrollmentCourse.courseClass?
                                <>
                                    <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                        {`, ${enrollmentCourse.courseClass.teacher.name}`}
                                    </p>
                                    <p className={`text-xs ${enrollmentCourse.completionPercentage < 100?'text-[rgb(145,145,145)]':'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                        {`, ${enrollmentCourse.completionPercentage < 100?`${USDecimal.format(enrollmentCourse.completionPercentage)}%`:'Complete'}`}
                                    </p>
                                </>
                                :
                                <></>
                            }
                        </div>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {(highlighted || screenSize === 'xs') && enrollAuthority && 
                        <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                            {enrollmentCourse.student? 
                                <button onClick={onUnenroll} className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-500 rounded-full'>
                                    <PiUserMinus size={20} className='flex shrink-0'/>
                                </button>
                                :
                            enrollmentCourse.course.available?
                                <button onClick={onEnroll} className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                                    <PiUserPlus size={20} className='flex shrink-0'/>
                                </button>
                                :
                                <></>
                            }
                        </div>
                    }
                </div>
            </div>}
        </div>
    )
}