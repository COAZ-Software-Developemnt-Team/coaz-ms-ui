import React, {useEffect,useState,useContext, useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,Outlet,useOutletContext } from 'react-router-dom';
import Scrollable from './Scrollable';
import {PiStudentFill,PiChalkboardTeacherLight,PiBookLight,PiStudent,PiDotsThreeVertical,PiTag } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import EnrollCourse from './EnrollCourse';
import ContentContainer from './ContentContainer';
import {useData} from '../data';
import PaymentOptions from './PaymentOptions';
import Detail from './Detail';
import MessageDialog from './MessageDialog';

const EnrollmentCourses = () => {
    const {setAccess} = useContext(GlobalContext);
    const [enrollment,setEnrollment] = useState(null);
    const {programId,courseId} = useParams();
    const {parentPath} = useOutletContext();
    const [loading,setLoading] = useState();
    const {request} = useData();
    const path = useLocation().pathname;

    const navigate = useNavigate();

    const getEnrollment = async () => {
        
        /* await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                setUpdateAuthority(true);
            }  else {
                setUpdateAuthority(false);
            }
        }) */
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
                        setAccess({Component:() => <PaymentOptions user={response.content.student} tariff={response.content.tariff} />});
                        navigate(parentPath);
                    }
                }  else {
                    console.log(response)
                }
            })
            .catch((error) => {
                console.log(error)
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        getEnrollment();
    },[path])
  return (
    <>{courseId? 
            <Outlet context={{parentPath:`/programs/enrollment/${programId}`}}/>
            :
            <ContentContainer previous={parentPath} Icon={PiStudentFill} text={enrollment && enrollment.program?enrollment.program.name:''} loading={loading}>
                {enrollment &&
                <div className='flex flex-col w-full h-auto space-y-4'>
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
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

export default EnrollmentCourses

const EnrollmentCourseItem = ({enrollmentCourse,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const [enrollAuthority,setEnrollAuthority] = useState(false);
    const {request} = useData();
    const {programId,courseId} = useParams();
    const moreRef = useRef(null);

    const navigate = useNavigate();

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onOpen = (e) => {
        e.preventDefault();
        if(enrollmentCourse.student) {
            navigate(`/programs/enrollment/${programId}/class/${enrollmentCourse.student.id}/${enrollmentCourse.course.id}`)
        } else  {
            navigate(`/programs/enrollment/${programId}/${enrollmentCourse.course.id}`)
        }
    }

    const onEnroll = (e) => {
        e.preventDefault();
        if(enrollmentCourse.course && !enrollmentCourse.student) {
            setDialog({
                show:true,
                Component:() => <EnrollCourse courseId={enrollmentCourse.course.id} reload={reload}/>
            })
        }
    }

    const onUnenroll = (e) => {
        e.preventDefault();
        if(enrollmentCourse.course && enrollmentCourse.student) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Unenroll Course' 
                        message={`Are you sure you want to unenroll fro ${enrollmentCourse.course.name}? 
                            If you click 'Yes' all progress you've made in this cpd will be permanently deleted`} 
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
                    {enrollmentCourse.courseClass?
                        <PiChalkboardTeacherLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <PiBookLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
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
                    {highlighted && enrollAuthority && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            {enrollmentCourse.student?
                                                <button 
                                                    onClick={onUnenroll}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiStudent size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Unenroll
                                                    </p>
                                                </button>:
                                                <button 
                                                    onClick={onEnroll}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiStudent size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Enroll
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