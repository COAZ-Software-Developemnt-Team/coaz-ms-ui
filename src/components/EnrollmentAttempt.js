import React, {useEffect,useState,useContext,useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation, useNavigate,useParams,useOutletContext } from 'react-router-dom';
import { RiFileListFill,RiTimeFill,RiFileList3Line,RiSaveLine,RiMore2Line, RiCheckboxCircleFill} from "react-icons/ri";
import { PiArrowLeft } from 'react-icons/pi';
import Scrollable from './Scrollable';
import Message from './Message';
import YesNoDialog from './YesNoDialog';
import MessageDialog from './MessageDialog';
import EnrollmentQuestionAttempt from './EnrollmentQuestionAttempt';
import { request } from '../App';

const EnrollmentAttempt = () => {
    const path = useLocation().pathname;
    const {user,parentPath} = useOutletContext();
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [enrollmentAttempt,setEnrollmentAttempt] = useState(null);
    const [date,setDate] = useState(null);
    const [action,setAction] = useState('');
    const {programId,studentId,courseId,teacherId,topicId,activityId,attemptId} = useParams();
    const [message,setMessage] = useState({content:'',success:false});
    const moreRef = useRef(null);

    const MARKING = 'MARKING';
    const ATTEMPTING = 'ATTEMPTING';

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    const onSave = async () => {
        if(enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.status === 'NEW') {
            let questionAttempts = [];
            for(let enrollmentQuestionAttempt of enrollmentAttempt.questionAttempts) {
                questionAttempts.push(enrollmentQuestionAttempt.questionAttempt);
            }
            await request('POST','question/attempts',questionAttempts,{
                attemptId:attemptId
            },true)
            .then( async (response) => {
                if(response.status && response.status === 'SUCCESSFUL') {
                    getAttempt();
                } else {
                    setMessage({content:response,success:false});
                }
            })
            navigate(parentPath);
        } else if(enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.status === 'PENDING') {
            await request('PUT',`attempt/close/${enrollmentAttempt.attempt.id}`,null,null,true)
            .then( async (response) => {
                if(response.status && response.status === 'SUCCESSFUL') {
                    getAttempt();
                } else {
                    setMessage({content:response,success:false});
                }
            })
            navigate(parentPath);
        }
        
    }

    const getAttempt = async () => {
        setMessage({content:'',success:false});
        await request('GET',`enrollment/attempt`,null,{
            attemptId:attemptId
        },true)
        .then( async (response) => {
            if(response.status && response.status === 'SUCCESSFUL' && response.content && response.content.attempt) {
                let attempt = response.content.attempt;
                console.log()
                if(attempt.status === 'NEW' && studentId && studentId == attempt.user.id) {
                    setAction(ATTEMPTING);
                } else if(attempt.status === 'PENDING' && teacherId && teacherId == attempt.activity.courseClass.teacherId) {
                    setAction(MARKING);
                }
                setDate(new Date(response.content.attempt.createdOn))
                setEnrollmentAttempt(response.content);
            } else {
                request('DELETE',`attempt/${attemptId}`,null,null,true)
                .then(() => {
                    navigate(parentPath);
                })
            }
        })
        .catch(() => {
            request('DELETE',`attempt/${attemptId}`,null,null,true)
            .then(() => {
                navigate(parentPath);
            })
        })
    }

    const onTimeOut = () => {
        setDialog({
            show:true,
            Component:() => 
                <MessageDialog 
                    title='Time out' 
                    message={`You've run of time, your work will be saved now!`} 
                    onClose={async (e) => {
                        e.preventDefault();
                        onSave();
                    }}
                />
        })
    }

    useEffect(() => {
        getAttempt();
    },[path])
  return (
    <div className='relative flex flex-col w-full h-full items-center bg-white overflow-hidden'>
        <Scrollable vertical={true}>
            <div className='flex flex-col w-[90%] my-4 lg:w-3/4 m-auto h-auto bg-[url(/public/images/program_vert.jpg)] bg-cover rounded-md shadow-lg'>
                {enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.user && enrollmentAttempt.attempt.activity &&
                <div className='flex flex-col w-full h-auto pb-4 space-y-8 bg-[rgba(255,255,255,.96)]'>
                    <div className='flex flex-row w-full h-fit p-4 justify-between shrink-0 space-x-2 text-[rgb(0,175,240)] items-center'>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                if(action === ATTEMPTING) {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <YesNoDialog 
                                                title='Leave Attempt' 
                                                message={`Are you sure you what to leave? 
                                                    The attempt will be saved automatically and you won't be able to open it again`} 
                                                onYes={async (e) => {
                                                    e.preventDefault();
                                                    onSave();
                                                }}
                                            />
                                    })
                                } else {
                                    navigate(parentPath);
                                }
                            }}
                            className='flex w-12 h-12 hover:bg-[rgba(0,0,0,.05)] rounded-full'
                        >
                            <PiArrowLeft size={32} className='flex m-auto'/>
                        </button>
                        {(action === ATTEMPTING || action === MARKING) &&
                            <button ref={moreRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPopupData({
                                        show:true,
                                        parentElement:moreRef.current,
                                        Component:
                                            <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                                <button onClick={(e) => {
                                                        e.preventDefault();
                                                        setDialog({
                                                            show:true,
                                                            Component:() => 
                                                                <YesNoDialog 
                                                                    title='Save Attempt' 
                                                                    message={`Are you sure you what to save this attempt?`} 
                                                                    onYes={async (e) => {
                                                                        e.preventDefault();
                                                                        onSave();
                                                                    }}
                                                                />
                                                        })
                                                    }}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <RiSaveLine size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Save
                                                    </p>
                                                </button>
                                            </div>
                                    })
                                }}
                                className='flex w-12 h-12 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.05)] rounded-full'>
                                <RiMore2Line size={32}/>
                            </button>
                        }
                    </div>
                    <div className='flex flex-col w-full h-auto px-8 space-y-4 font-[arial]'>
                        <div className='flex flex-row w-full h-auto items-center space-x-4'>
                            {enrollmentAttempt.attempt.activity.classname === 'Assignment'?
                                <RiFileList3Line size={80} className='text-[rgb(0,175,240)]'/>:
                                enrollmentAttempt.attempt.activity.classname === 'Quiz'?
                                <RiFileListFill size={80} className='text-[rgb(0,175,240)]'/>:
                                <></>
                            }
                            <div className='flex flex-col w-auto h-fit'>
                                {enrollmentAttempt.attempt.activity.name &&
                                    <p className='flex w-full h-auto text-xl font-semibold text-[rgb(68,70,71)] uppercase'>
                                        {enrollmentAttempt.attempt.activity.name}
                                    </p>
                                }
                                <p className='flex w-full h-auto text-sm text-[rgb(68,70,71)] capitalize'>
                                    {enrollmentAttempt.attempt.user.name}
                                </p>
                                {date && 
                                    <p className='flex w-full h-auto text-xs text-[rgb(143,145,145)] capitalize'>
                                        {date.toLocaleString('default', { month: 'long' })+' '+date.getDate()+', '+date.getFullYear()+' '+date.toLocaleTimeString('en-US')}
                                    </p>
                                }
                            </div>
                        </div>
                        <div className='flex flex-col w-full h-fit space-y-4'>
                            <div className='flex flex-row w-full h-fit justify-between'>
                                <div className='flex flex-row w-full items-center space-x-2 text-sm text-[rgb(68,70,71)]'>
                                    <RiTimeFill size={20} className='text-[rgb(0,175,240)] shrink-0'/>
                                    <div className='flex flex-wrap w-full justify-between'>
                                    {enrollmentAttempt.attempt.activity.duration &&
                                        <div className='flex flex-row w-full sm:w-1/2 space-x-2 justify-between sm:justify-normal'>
                                            <p className='font-semibold '>Duration:</p>
                                            <p className='tracking-wide'>
                                                {`${USDecimal.format(enrollmentAttempt.attempt.activity.duration)} mins`}
                                            </p>
                                        </div>
                                    }
                                    {enrollmentAttempt.attempt.status === 'NEW' && enrollmentAttempt.attempt.createdOn && enrollmentAttempt.attempt.activity.duration &&
                                        <div className='flex flex-row w-full sm:w-1/2 text-sm space-x-2 justify-between sm:justify-normal'>
                                            <p className='font-semibold '>Remaining:</p>
                                            <Timer start={enrollmentAttempt.attempt.createdOn} duration={enrollmentAttempt.attempt.activity.duration} onTimeOut={onTimeOut}/>
                                        </div>
                                    }
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-row items-center space-x-2 text-sm text-[rgb(68,70,71)]'>
                                <RiCheckboxCircleFill size={20} className='text-[rgb(0,175,240)]'/>
                                <p className='font-semibold '>Pass Grade:</p>
                                <p className='tracking-wide'>
                                    {`${USDecimal.format(enrollmentAttempt.attempt.activity.passGrade)}%`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col w-full h-auto px-8 space-y-4 shrink-0'>
                        {enrollmentAttempt.questionAttempts && enrollmentAttempt.questionAttempts.map((questionAttempt,i) => 
                            <EnrollmentQuestionAttempt key={i} number={++i} enrollmentQuestionAttempt={questionAttempt} action={action} reload={getAttempt}/>
                        )}
                    </div>
                    <Message message={message}/>
                </div>
                }
            </div>
        </Scrollable>
    </div>
  )
}

export default EnrollmentAttempt

const Timer = ({start,duration,onTimeOut}) => {
    const date = new Date(new Date(start).getTime() + duration * 60000);
    const [time,setTime] = useState(date.getTime() - new Date().getTime());
    
    useEffect(() => {
        if(time > 0) {
            setTimeout(() => {
                setTime(date.getTime() - new Date().getTime());
            },1000);
        } else {
            onTimeOut && onTimeOut();
        }
    },[time]);
    return (
        <FormatedTime time={time}/>
    )
}

const FormatedTime = ({time}) => {
    let totalSeconds = parseInt(Math.floor(time / 1000));
    let totalMinutes = parseInt(Math.floor(totalSeconds / 60));
    let totalHours = parseInt(Math.floor(totalMinutes / 60));
    let days = parseInt(totalHours / 24);

    let seconds = parseInt(totalSeconds % 60);
    let minutes = parseInt(totalMinutes % 60);
    let hours = parseInt(totalHours % 24);

    return (
        <p className='text-sm text-[rgb(68,70,71)]'>
            {`${hours}:${minutes}:${seconds}`}
        </p>
    )
}