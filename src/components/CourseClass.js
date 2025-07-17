import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import { PiPencilSimple,PiTextAlignLeft,PiChalkboardTeacherFill } from "react-icons/pi";
import EditCourse from './EditCourse';
import AddTopic from './AddTopic';
import TopicItem from './TopicItem';
import MsHeader from './Header';
import Scrollable from './Scrollable';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const CourseClass = () => {
    const {setDialog} = useContext(GlobalContext);
    const [courseClass,setCourseClass] = useState(null);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [topics,setTopics] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState(false);
    const {request} = useData();
    const {courseId,teacherId,topicId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const onEdit = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <EditCourse id={courseId} reload={load}/>
        })
    }

    const onAddTopic = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddTopic courseId={courseId} reload={load}/>
        })
    }
    
    const getCourseClass = async () => {
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                setButtons([
                    {
                        Icon:PiPencilSimple,
                        name:'Edit',
                        handler:onEdit
                    },
                    {
                        Icon:PiTextAlignLeft,
                        name:'Add Topic',
                        handler:onAddTopic
                    }
                ])
                setUpdateAuthority(true);
            }
        })
        if(courseId && teacherId) {
            await request('GET','class',null,{
                courseId:courseId,
                teacherId:teacherId
            },true)
            .then((response) => {
                if(response.content) {
                    setCourseClass(response.content);
                }  else {
                  setCourseClass(null);
                }
            })
            .catch((error) => {
                setCourseClass(null);
            })
        }
        setLoading(false);
    }

    const getTopics = async () => {
        await request('GET',`topics/${courseId}`,null,null,true)
        .then((response) => {
            if(response.content) {
                setTopics(response.content);
            } else {
                setTopics([]);
            }
        })
        .catch((error) => {
            setTopics([]);
        })
    }

    const load = async () => {
        setLoading(true);
        await getCourseClass();
        await getTopics();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{courseId && teacherId && topicId?
        <Outlet context={{parentPath:`/courses/class/${courseId}/${teacherId}`}}/>:
        <ContentContainer previous={parentPath} buttons={buttons} Icon={PiChalkboardTeacherFill} text={courseClass && courseClass.course?courseClass.course.name:''} loading={loading}>
            {topics && topics.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Topics</p>
                    {topics.map((topic,i) => <TopicItem key={i} topic={topic} reload={getTopics} updateAuthority={updateAuthority}/>)}
                </div>
            }
        </ContentContainer>
    }
    </>
  )
}

export default CourseClass