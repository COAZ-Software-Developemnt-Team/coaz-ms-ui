import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import { PiTarget , PiFileTextFill, PiTargetLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import MsHeader from './Header';
import { request } from '../App';

const EnrollmentMaterial = () => {
    const {setDialog} = useContext(GlobalContext);
    const [enrollmentMaterial,setEnrollmentMaterial] = useState(null);
    const [buttons,setButtons] = useState([]);
    const {programId,studentId,courseId,teacherId,topicId,activityId,attemptId} = useParams();
    const path = useLocation().pathname;
    const {parentPath} = useOutletContext();

    const navigate = useNavigate();

    const onAttempt = async (e) => {
        e.preventDefault();
        if(activityId) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Attempt Quiz' 
                        message='Are you sure you want to attempt this activity?'
                        onYes={async (e) => {
                            setDialog(null);
                            await request('POST','attempt',null,{
                                activityId:activityId
                            },true)
                            .then( async (response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                                    navigate(`${path}/${response.content.id}`)
                                } 
                            })
                        }}
                    />
            })
        }
    }

    const getEnrollmentMaterial = async () => {
        if(activityId) {
            await request('GET','enrollment/material',null,{
                materialId:activityId
            },true)
            .then((response) => {
                if(response.content) {
                    setEnrollmentMaterial(response.content);
                    if(response.content.material && response.content.material.courseClass) {
                        request('GET','class/access',null,{
                            courseId:response.content.material.courseClass.courseId,
                            teacherId:response.content.material.courseClass.teacherId
                        },true)
                        .then((accessResponse) => {
                            if(accessResponse.content && accessResponse.content === 'STUDENT') {
                                if(response.content.enrollmentAttempts.length < response.content.material.attempts) {
                                    setButtons([{
                                        Icon:PiTarget,
                                        name:'Attempt',
                                        handler:onAttempt
                                    }])
                                }
                            }
                        })
                    }
                }  else {
                  setEnrollmentMaterial(null);
                }
            })
            .catch((error) => {
                setEnrollmentMaterial(null);
            })
        }
    }

    useEffect(() => {
        getEnrollmentMaterial();
    },[path])

  return (
    <>{programId && courseId && teacherId && topicId && activityId && attemptId?
        <Outlet context={{parentPath:`/programs/enrollment/${programId}/class/${studentId}/${courseId}/${teacherId}/${topicId}/attempts/${activityId}`}}/>:
        <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
            className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            {enrollmentMaterial && enrollmentMaterial.student && enrollmentMaterial.material &&
            <>
                <MsHeader previous={parentPath} buttons={buttons} Icon={PiFileTextFill} text={enrollmentMaterial.material.name} subText='My attempts'/>
                <div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
                    <Scrollable vertical={true}>
                        {enrollmentMaterial.enrollmentAttempts && enrollmentMaterial.enrollmentAttempts.length > 0 &&
                        <div className='flex flex-col w-full h-auto space-y-2'>
                            <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Attempts</p>
                            {enrollmentMaterial.enrollmentAttempts.map((enrollmentAttempt,i) => <EnrollmentAttemptItem key={i} enrollmentAttempt={enrollmentAttempt} reload={getEnrollmentMaterial}/>)}
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

export default EnrollmentMaterial

const EnrollmentAttemptItem = ({enrollmentAttempt}) => {
    const [date,setDate] = useState(null);

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    useEffect(() => {
        if(enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.createdOn) {
            setDate(new Date(enrollmentAttempt.attempt.createdOn));
        }
    },[enrollmentAttempt])

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.user && enrollmentAttempt.attempt.activity &&
            <div className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.05)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <PiTargetLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {enrollmentAttempt.attempt.activity.name}
                        </p>
                        <div className='flex flex-wrap space-x-1'>
                            <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular overflow-hidden overflow-ellipsis capitalize`}>
                                {`${date && date.toLocaleString('default', { month: 'long' })+' '+date.getDate()+', '+date.getFullYear()+' '+date.toLocaleTimeString('en-US')}`}
                            </p>
                            {enrollmentAttempt.attempt.status === 'PENDING'?
                                <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    , Pending...
                                </p>
                                :
                            enrollmentAttempt.attempt.status === 'CLOSED'?
                                <div className='flex flex-row space-x-1 text-[rgb(145,145,145)]'>
                                    <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                        {`${enrollmentAttempt.marks} of ${enrollmentAttempt.totalMarks}`}
                                    </p>
                                    <p className={`text-xs ${enrollmentAttempt.passed && 'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                        {`, ${USDecimal.format(enrollmentAttempt.grade)}%`}
                                    </p>
                                </div>
                                :
                            enrollmentAttempt.attempt.status === 'NEW'?
                                <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    , New
                                </p>
                                :
                                <></>
                            }
                        </div>
                        
                    </div> 
                </div>
            </div>}
        </div>
    )
}