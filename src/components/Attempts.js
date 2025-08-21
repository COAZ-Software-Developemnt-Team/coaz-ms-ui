import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import { PiTarget,PiTargetFill} from "react-icons/pi";
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import EnrollmentAttemptItem from './EnrollmentAttemptItem';

const Attempts = () => {
    const [activity,setActivity] = useState(null);
    const [enrollmentAttempts,setEnrollmentAttempts] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [parentPath,setParentPath] = useState(null);
    const location = useLocation();
    const state = location.state;
    const {request} = useData();
    const {currentUserId,courseId,teacherId,activityId,attemptId} = useParams();
    const path = useLocation().pathname;

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

    const navigate = useNavigate();

    const onOpen = async (e,enrollmentAttempt) => {
        e.preventDefault();
        if(enrollmentAttempt && enrollmentAttempt.attempt) { 
            {
                navigate(`${path}/${enrollmentAttempt.attempt.id}`,{state:{parentPath:path}})
            }
        }
    }

    useEffect(() => {
        if((!courseId || !teacherId || !activityId || !attemptId) && state && state.parentPath) {
            setParentPath(state.parentPath);
        }
        getActivity();
        getEnrollmentAttempts();
    },[path])

  return (
    <>{courseId && teacherId && activityId && attemptId?
        <Outlet/>:
        <ContentContainer previous={parentPath?parentPath:currentUserId?`/${currentUserId}/home`:'/home'} 
            buttons={buttons} 
            Icon={PiTargetFill} 
            text={activity && activity.name}>
            {enrollmentAttempts && enrollmentAttempts.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Attempts</p>
                    {enrollmentAttempts.map((enrollmentAttempt,i) => <EnrollmentAttemptItem key={i} enrollmentAttempt={enrollmentAttempt} onOpen={onOpen}/>)}
                </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Attempts

const AttemptItem = ({enrollmentAttempt}) => {
    const [date,setDate] = useState(null);
    const path = useLocation().pathname;

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onOpen = async (e,enrollmentAttempt) => {
        e.preventDefault();
        if(enrollmentAttempt) { 
            {
                navigate(`${path}/${enrollmentAttempt.attempt.id}`,{state:{parentPath:path}})
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
            <div className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.05)] rounded-md'>
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