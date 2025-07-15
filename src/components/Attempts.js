import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import { PiTarget,PiTargetFill} from "react-icons/pi";
import Scrollable from './Scrollable';
import MsHeader from './Header';
import { useData } from '../App';

const Attempts = () => {
    const {setDialog,} = useContext(GlobalContext);
    const [activity,setActivity] = useState(null);
    const [enrollmentAttempts,setEnrollmentAttempts] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [request] = useData();
    const {courseId,teacherId,topicId,activityId,attemptId} = useParams();
    const path = useLocation().pathname;
    const {parentPath} = useOutletContext();

    const getActivity = async () => {
        if(activityId) {
            await request('GET',`activity/${activityId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setActivity(response.content);
                }  else {
                  setActivity(null);
                }
            })
            .catch((error) => {
                setActivity(null);
            })
        }
    }

    const getEnrollmentAttempts = async (e) => {
        if(activityId) {
            await request('GET','enrollment/attempts/all',null,{
                activityId:activityId
            },true)
            .then((response) => {
                if(response.content) {
                    setEnrollmentAttempts(response.content);
                }
            })
        }
    }

    useEffect(() => {
        getActivity();
        getEnrollmentAttempts();
    },[path])

  return (
    <>{courseId && teacherId && activityId && attemptId?
        <Outlet context={{parentPath:`/courses/class/${courseId}/${teacherId}/${topicId}/attempts/${activityId}`}}/>:
        <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
            className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            {activity &&
                <>
                <MsHeader previous={parentPath} buttons={buttons} Icon={PiTargetFill} text={activity.name} subText='Attempts'/>
                <div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
                    <Scrollable vertical={true}>
                    {enrollmentAttempts && enrollmentAttempts.length > 0 &&
                        <div className='flex flex-col w-full h-auto'>
                            <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Attempts</p>
                            {enrollmentAttempts.map((enrollmentAttempt,i) => <AttemptItem key={i} enrollmentAttempt={enrollmentAttempt} reload={getEnrollmentAttempts}/>)}
                        </div>
                    }
                    </Scrollable>
                </div>
            </>
            }
        </div>
    }
    </>
  )
}

export default Attempts

const AttemptItem = ({enrollmentAttempt,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [date,setDate] = useState(null);
    const [highlighted,setHighlighted] = useState(false);
    const path = useLocation().pathname;
    const moreRef = useRef(null)

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onOpen = async (e,enrollmentAttempt) => {
        e.preventDefault();
        if(enrollmentAttempt) { 
            {
                navigate(`${path}/${enrollmentAttempt.attempt.id}`)
            }
        }
    }

    useEffect(() => {
        if(enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.createdOn) {
            setDate(new Date(enrollmentAttempt.attempt.createdOn));
        }
    },[enrollmentAttempt])

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.user && enrollmentAttempt.attempt.activity &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.05)] rounded-md'>
                <div onClick={(e) => onOpen(e,enrollmentAttempt)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiTarget size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`w-full text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular overflow-hidden overflow-ellipsis capitalize`}>
                            {`${enrollmentAttempt.attempt.user.name} ( ${date && date.toLocaleString('default', { month: 'long' })+' '+date.getDate()+', '+date.getFullYear()+' '+date.toLocaleTimeString('en-US')} )`}
                        </p>
                        {enrollmentAttempt.attempt.status === 'PENDING'?
                            <p className={`text-xs font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                                Pending...
                            </p>
                            :
                        enrollmentAttempt.attempt.status === 'CLOSED'?
                            <div className='flex flex-row space-x-1 text-[rgb(145,145,145)]'>
                                <p className={`text-xs font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                                    {`${enrollmentAttempt.marks} of ${enrollmentAttempt.totalMarks}`}
                                </p>
                                <p className={`text-xs ${enrollmentAttempt.passed && 'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    {`(${USDecimal.format(enrollmentAttempt.grade)}%)`}
                                </p>
                            </div>
                            :
                        enrollmentAttempt.attempt.status === 'NEW'?
                            <p className={`text-xs font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                                New
                            </p>
                            :
                            <></>
                        }
                    </div> 
                </div>
            </div>}
        </div>
    )
}