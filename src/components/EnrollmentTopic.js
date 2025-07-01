import React, {useEffect,useState} from 'react'
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import { PiTextAlignLeftFill,PiClipboardTextLight,PiFileTextLight, PiFilePdfLight} from "react-icons/pi";
import Scrollable from './Scrollable';
import MsHeader from './Header';
import { request,download } from '../App';

const EnrollmentTopic = () => {
    const [enrollmentTopic,setEnrollmentTopic] = useState(null);
    const {programId,studentId,courseId,teacherId,topicId,resourceId,activityId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const navigate = useNavigate();
    
    const getEnrollmentTopic = async () => {
        if(teacherId && topicId) {
            await request('GET','enrollment/topic',null,{
                teacherId:teacherId,
                topicId:topicId
            },true)
            .then((response) => {
                if(response.content) {
                    setEnrollmentTopic(response.content);
                }  else {
                  navigate(parentPath)
                }
            })
            .catch((error) => {
                navigate(parentPath)
            })
        }
    }

    useEffect(() => {
        getEnrollmentTopic();
    },[path])
  return (
    <>{courseId && teacherId && topicId && (resourceId || activityId)?
        <Outlet context={{parentPath:`/programs/enrollment/${programId}/class/${studentId}/${courseId}/${teacherId}/${topicId}`}}/>:
        <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
            className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            {enrollmentTopic && enrollmentTopic.topic &&
                <>
                    <MsHeader previous={parentPath} Icon={PiTextAlignLeftFill} text={enrollmentTopic.topic.name}/>
                    <div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto space-y-4'>
                                {enrollmentTopic.resources && enrollmentTopic.resources.length > 0 &&
                                <div className='flex flex-col w-full h-auto'>
                                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>resources</p>
                                    {enrollmentTopic.resources.map((resource,i) => <EnrollmentMaterial key={i} enrollmentMaterial={resource} reload={getEnrollmentTopic}/>)}
                                </div>
                                }
                                {enrollmentTopic.quizzes && enrollmentTopic.quizzes.length > 0 &&
                                <div className='flex flex-col w-full h-auto'>
                                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>quizzes</p>
                                    {enrollmentTopic.quizzes.map((quiz,i) => <EnrollmentMaterial key={i} enrollmentMaterial={quiz} reload={getEnrollmentTopic}/>)}
                                </div>
                                }
                                {enrollmentTopic.assignments && enrollmentTopic.assignments.length > 0 &&
                                <div className='flex flex-col w-full h-auto'>
                                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>assignments</p>
                                    {enrollmentTopic.assignments.map((assignment,i) => <EnrollmentMaterial key={i} enrollmentMaterial={assignment} reload={getEnrollmentTopic}/>)}
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

export default EnrollmentTopic

const EnrollmentMaterial = ({enrollmentMaterial,reload}) => {
    const path = useLocation().pathname;

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onOpen = async (e) => {
        e.preventDefault();
        if(enrollmentMaterial.material) {
            if(enrollmentMaterial.material.classname === 'Resource') {
                navigate(`${path}/resource/${enrollmentMaterial.material.id}`);
                /* await download(`resource/download/${enrollmentMaterial.material.id}`,null,true)
                .then((response) => {
                    if(response instanceof Blob) {
                        const url = window.URL.createObjectURL(new Blob([response],{type:"application/pdf"}));
                        window.open(url);
                        request('POST',`view/${enrollmentMaterial.material.id}`,null,null,true)
                        .then(() => {
                            reload && reload();
                        })
                    }
                }) */
            }
            else if(enrollmentMaterial.material.classname === 'Quiz' || enrollmentMaterial.material.classname === 'Assignment') {
                navigate(`${path}/attempts/${enrollmentMaterial.material.id}`)
            }
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollmentMaterial && enrollmentMaterial.material &&
            <div className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => onOpen(e)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    {enrollmentMaterial.material.classname === 'Resource'?
                        <PiFilePdfLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        enrollmentMaterial.material.classname === 'Quiz'?
                        <PiClipboardTextLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        enrollmentMaterial.material.classname === 'Assignment'?
                        <PiFileTextLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <></>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${enrollmentMaterial.material.name}`}
                        </p>
                        <div className='flex flex-row space-x-1'>
                            <p className={`text-xs ${enrollmentMaterial.passed?'text-green-600':'text-[rgb(145,145,145)]'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                {`${USDecimal.format(enrollmentMaterial.grade)}%`}
                            </p>
                            {enrollmentMaterial.complete &&
                            <p className={`text-xs text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                Complete
                            </p>}
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}