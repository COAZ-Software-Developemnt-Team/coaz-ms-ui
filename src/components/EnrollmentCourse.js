import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import {PiTextAlignLeftLight, PiChalkboardTeacherFill, PiDotsThreeVertical, PiDownloadSimple, PiCertificateLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import ContentContainer from './ContentContainer';
import PaymentOptions from './PaymentOptions';
import {request} from '../App';
import { download } from '../App';
import Detail from './Detail';

const EnrollmentCourse = () => {
    const {setAccess} = useContext(GlobalContext);
    const [enrollmentCourse,setEnrollmentCourse] = useState(null);
    const [loading,setLoading] = useState();
    const {programId,studentId,courseId,teacherId,topicId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const navigate = useNavigate();
    
    const getEnrollmentCourse = async () => {
        /* await request('GET','hasauthority',null,{
            contextName:'COURSE',
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
        if(studentId,courseId) {            
            await request('GET','enrollment/course',null,{
                studentId:studentId,
                courseId:courseId
            },true)
            .then((response) => {
                if(response.content) {
                    if(response.content.paid) {
                        if(response.content.startDate) {
                            response.content.startDate = new Date(response.content.startDate);
                        }
                        setEnrollmentCourse(response.content);
                    } else if(response.content.student && response.content.tariff && response.content.course) {
                        setAccess({Component:() => <PaymentOptions user={response.content.student} tariff={response.content.tariff} />});
                        navigate(parentPath);
                    }
                }  else {
                    setEnrollmentCourse(null);
                }
            })
            .catch((error) => {
                setEnrollmentCourse(null);
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        getEnrollmentCourse();
    },[path])
  return (
    <>{teacherId && topicId?
        <Outlet context={{parentPath:`/programs/enrollment/${programId}/class/${studentId}/${courseId}`}}/>
        :
        <ContentContainer previous={parentPath} Icon={PiChalkboardTeacherFill} text={enrollmentCourse && enrollmentCourse.course?enrollmentCourse.course.name:''} loading={loading}>
            {enrollmentCourse && enrollmentCourse.course &&
                <div className='flex flex-col w-full h-auto space-y-4'>
                    <div className='flex flex-col w-full h-auto space-y-2 text-xs tracking-wider'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular  text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                        {enrollmentCourse.startDate && <Detail label='Start Date' value={enrollmentCourse.startDate.toLocaleString('default', { month: 'long' })+' '+enrollmentCourse.startDate.getDate()+', '+enrollmentCourse.startDate.getFullYear()+' '+enrollmentCourse.startDate.toLocaleTimeString('en-US')}/>}
                    </div>
                    <div className='flex flex-col w-full h-auto space-y-4'>
                        {enrollmentCourse.certificate &&
                            <div className='flex flex-col w-full h-auto'>
                                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Certificate</p>
                                <Certificate certificate={enrollmentCourse.certificate}/>
                            </div>
                        }
                        {enrollmentCourse.topics && enrollmentCourse.topics.length > 0 &&
                            <div className='flex flex-col w-full h-auto'>
                                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>topics</p>
                                {enrollmentCourse.topics.map((topic,i) => <EnrollmentTopicItem key={i} enrollmentTopic={topic} reload={getEnrollmentCourse}/>)}
                            </div>
                        }
                    </div>
                </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default EnrollmentCourse

const EnrollmentTopicItem = ({enrollmentTopic,reload}) => {
    const {setDialog} = useContext(GlobalContext);
    const path = useLocation().pathname;

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        if(enrollmentTopic.topic && enrollmentTopic.teacher) {
            navigate(`${path}/${enrollmentTopic.teacher.id}/${enrollmentTopic.topic.id}`);
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(enrollmentTopic && enrollmentTopic.topic) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Delete Topic' 
                        message={`Are you sure you want to delete ${enrollmentTopic.topic.name}?`} 
                        onYes={async (e) => {
                            
                            await request('DELETE',`topic/${enrollmentTopic.topic.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    useEffect(() => {
        /* ( async () => {
            
            await request('GET','hasauthority',null, {
                contextName:'COURSE',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status === 'YES') {
                    setUpdateAuthority(true);
                }  else {
                    setUpdateAuthority(false);
                }
            })}
        )(); */
    },[]);

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollmentTopic && enrollmentTopic.topic &&
            <div  /* onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} */ 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={onOpen}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiTextAlignLeftLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {enrollmentTopic.topic.name}
                        </p>
                        <p className={`text-xs ${enrollmentTopic.completionPercentage < 100?'text-[rgb(145,145,145)]':'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${enrollmentTopic.completionPercentage < 100?`${USDecimal.format(enrollmentTopic.completionPercentage)}%`:'Complete'}`}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {/* {highlighted && updateAuthority && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            <button 
                                                onClick={onDelete}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiTrash size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Delete
                                                </p>
                                            </button>
                                        </div>
                                })
                            }}
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDotsThreeVertical size={20} />
                        </button>
                    } */}
                </div>
            </div>}
        </div>
    )
}

const Certificate = ({certificate}) => {
    const {setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef();

    const onDownload = (e) => {
        e.preventDefault();
        if(certificate) {
            download(`certificate/${certificate}`,null,true)
            .then((response) => {
                if(response instanceof Blob) {
                    const href = URL.createObjectURL(response);
                    // create "a" HTML element with href to file & click
                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download', certificate); //or any other extension
                    document.body.appendChild(link);
                    link.click();

                    // clean up "a" element & remove ObjectURL
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                }
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }


    return (
        <div className='flex flex-row w-full h-auto'>
            {certificate &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <PiCertificateLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                        {certificate}
                    </p>
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
                                            <button 
                                                onClick={onDownload}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiDownloadSimple size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Download
                                                </p>
                                            </button>
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