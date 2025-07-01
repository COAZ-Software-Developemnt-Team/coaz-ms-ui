import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import { PiTarget  ,PiTextAlignLeftFill,PiFilePdf,PiClipboardText,PiClipboardTextLight,PiFileText,PiFileTextLight, PiFilePdfLight,PiTrash,PiDotsThreeVertical, PiFileHtml, PiFileHtmlLight} from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import AddResource from './AddResource';
import AddQuiz from './AddQuiz';
import Scrollable from './Scrollable';
import MsHeader from './Header';
import { request,download } from '../App';
import AddHtmlResource from './AddHtmlResource';
import ContentContainer from './ContentContainer';

const Topic = () => {
    const {setDialog} = useContext(GlobalContext);
    const [topic,setTopic] = useState(null);
    const [courseClass,setCourseClass] = useState(null);
    const [resources,setResources] = useState([]);
    const [assignments] = useState([]);
    const [quizzes,setQuizzes] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {courseId,teacherId,topicId,resourceId,activityId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const onAddResource = (e) => {
        if(courseId,teacherId) {
            setDialog({
                show:true,
                Component:() => 
                    <AddResource courseId={courseId} teacherId={teacherId} topicId={topicId} reload={getResources}/>
            })
        }
    }

    const onAddHtmlResource = (e) => {
        if(courseId,teacherId) {
            setDialog({
                show:true,
                Component:() => 
                    <AddHtmlResource courseId={courseId} teacherId={teacherId} topicId={topicId}/>
            })
        }
    }

    const onAddQuiz = (e) => {
        if(courseId,teacherId) {
            setDialog({
                show:true,
                Component:() => 
                    <AddQuiz courseId={courseId} teacherId={teacherId} topicId={topicId} reload={getQuizzes}/>
            })
        }
    }

    const onAddAssignment = (e) => {

    }

    
    const getCourseClass = async () => {
        if(courseId && teacherId) {
            await request('GET','class',null,{
                courseId:courseId,
                teacherId:teacherId
            },true)
            .then((response) => {
                if(response.content) {
                    setCourseClass(response.content);
                    setButtons([
                        {
                            Icon:PiFilePdf,
                            name:'Add Resourse',
                            handler:onAddResource
                        },
                        {
                            Icon:PiFileHtml,
                            name:'Add Html Resourse',
                            handler:onAddHtmlResource
                        },
                        {
                            Icon:PiClipboardText,
                            name:'Add Quiz',
                            handler:onAddQuiz
                        },
                        {
                            Icon:PiFileText,
                            name:'Add Assignment',
                            handler:onAddAssignment
                        }
                    ])
                }  else {
                  setCourseClass(null);
                }
            })
            .catch((error) => {
                setCourseClass(null);
            })
        }
    }

    const getResources = async (e) => {
        if(courseId && topicId) {
            await request('GET','/resources/my/class/topic',null,{
                courseId:courseId,
                topicId:topicId
            },true)
            .then((response) => {
                if(response.content) {
                    setResources(response.content);
                } else {
                    setResources([]);
                }
            })
            .catch((error) => {
                setResources([]);
            })
        }
    }

    const getQuizzes = async (e) => {
        await request('GET','/quizzes/my/class/topic',null,{
            courseId:courseId,
            topicId:topicId
        },true)
        .then((response) => {
            if(response.content) {
                setQuizzes(response.content);
            } else {
                setQuizzes([]);
            }
        })
        .catch((error) => {
            setQuizzes([]);
        })
    }

    const getAssignments = async (e) => {
      
    }

    const getTopic = async () => {
        await request('GET',`topic/${topicId}`,null,null,true)
        .then((response) => {
            if(response.content) {
                setTopic(response.content);
            } else {
                setTopic([]);
            }
        })
        .catch((error) => {
            setTopic([]);
        })
    }

    const load = async () => {
        setLoading(true);
        await getTopic();
        await getCourseClass();
        await getResources();
        await getAssignments();
        await getQuizzes();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{courseId && teacherId && topicId && (resourceId || activityId)?
        <Outlet context={{parentPath:`/courses/class/${courseId}/${teacherId}/${topicId}`}}/>:
        <ContentContainer previous={parentPath} buttons={buttons} Icon={PiTextAlignLeftFill} text={topic?topic.name:''} loading={loading}>
            {resources && resources.length > 0 &&
            <div className='flex flex-col w-full h-auto'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>resources</p>
                {resources.map((resource,i) => <Material key={i} material={resource} reload={getResources}/>)}
            </div>
            }
            {quizzes && quizzes.length > 0 &&
            <div className='flex flex-col w-full h-auto'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>quizzes</p>
                {quizzes.map((quiz,i) => <Material key={i} material={quiz} reload={getQuizzes}/>)}
            </div>
            }
            {assignments && assignments.length > 0 &&
            <div className='flex flex-col w-full h-auto'>
                <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>assignments</p>
                {assignments.map((assignment,i) => <Material key={i} material={assignment} reload={getAssignments}/>)}
            </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default Topic

const Material = ({material,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const path = useLocation().pathname;
    const moreRef = useRef(null)

    const navigate = useNavigate();

    const onOpen = async (e,material) => {
        e.preventDefault();
        if(material) {
            if(material.classname === 'Resource') {
                navigate(`${path}/resource/${material.id}`)
                setDialog(null);
            }
            else if(material.classname === 'HtmlResource') {
                navigate(`${path}/htmlresource/${material.id}`)
                setDialog(null);
            }
            else if(material.classname === 'Quiz' || material.classname === 'Assignment') {
                navigate(`${path}/questions/${material.id}`)
                setDialog(null);
            }
        }
    }

    const onAttempts = (e) => {
        e.preventDefault();
        navigate(`${path}/attempts/${material.id}`)
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(material) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Material' 
                        message={`Are you sure you want to delete ${material.name}?`} 
                        onYes={async (e) => {
                            if(material.classname === 'Resource') {
                                await request('DELETE',`resource/${material.id}`,null,null,true)
                                .then(response => {
                                    reload && reload();
                                })
                            } else if(material.classname === 'HtmlResource') {
                                await request('DELETE',`resource/html/${material.id}`,null,null,true)
                                .then(response => {
                                    reload && reload();
                                })
                            } else if(material.classname === 'Quiz' || material.classname === 'Assignment') {
                                await request('DELETE',`activity/${material.id}`,null,null,true)
                                .then(response => {
                                    reload && reload();
                                })
                            }
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {material &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => onOpen(e,material)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    {material.classname === 'Resource'?
                        <PiFilePdfLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                    material.classname === 'HtmlResource'?
                        <PiFileHtmlLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                    material.classname === 'Quiz'?
                        <PiClipboardTextLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                    material.classname === 'Assignment'?
                        <PiFileTextLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <></>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${material.name}`}
                        </p>
                        {/* <div className='flex flex-row space-x-1'>
                            <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                {enrollmentClass.programClass.courseClass.teacher.name}
                            </p>
                            {enrollmentClass.programStudent?
                                <p className={`text-xs ${enrollmentClass.completionPercentage < 100?'text-[rgb(145,145,145)]}':'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    {`( ${enrollmentClass.completionPercentage < 100?`${enrollmentClass.completionPercentage}% Complete`:'Completed'} )`}
                                </p>:
                                <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    {`( Unregistered )`}
                                </p>
                            }
                        </div> */}
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
                                            {(material.classname === 'Quiz' || material.classname === 'Assignment') &&
                                                <button 
                                                    onClick={onAttempts}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiTarget  size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Attempts
                                                    </p>
                                                </button>
                                            }
                                            <button 
                                                onClick={onDelete}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiTrash size={20} className='flex shrink-0'/>
                                                <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Delete
                                                </p>
                                            </button>
                                        </div>
                                })
                            }}
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDotsThreeVertical size={16} />
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}