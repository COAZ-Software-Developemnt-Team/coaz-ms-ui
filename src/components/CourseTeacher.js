import React, {useEffect,useState,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet } from 'react-router-dom';
import { PiChalkboardTeacherFill } from "react-icons/pi";
import TopicItem from './TopicItem';
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import Detail from './Detail';
import UserItem from './UserItem';

const CourseTeacher = () => {
    const [courseTeacher,setCourseTeacher] = useState(null);
    const [topics,setTopics] = useState([]);
    const [programStudentCourses,setProgramStudentCourses] = useState([]);
    const [loading,setLoading] = useState(false);
    const {request} = useData();
    const {currentUserId,courseId,teacherId,topicId} = useParams();
    const [parentPath,setParentPath] = useState(null);
    const location = useLocation();
    const state = location.state;
    const path = useLocation().pathname;

    
    const getCourseTeacher = async () => {
        if(courseId && teacherId) {
            await request('GET','courseteacher',null,{
                courseId:courseId,
                teacherId:teacherId
            },true)
            .then((response) => {
                if(response.content) {
                    if(response.content.course) {
                        response.content.course.availableFrom = response.content.course.availableFrom?new Date(response.content.course.availableFrom):null;
                        response.content.course.availableTo = response.content.course.availableTo?new Date(response.content.course.availableTo):null;
                    }
                    setCourseTeacher(response.content);
                }  else {
                  setCourseTeacher(null);
                }
            })
            .catch((error) => {
                setCourseTeacher(null);
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

    const getProgramStudentCourses = async () => {
        await request('GET','programstudentcourses/courseteacher',null,{courseId:courseId,teacherId:teacherId},true)
        .then((response) => {
            if(response.content) {
                setProgramStudentCourses(response.content);
            } else {
                setProgramStudentCourses([]);
            }
        })
        .catch((error) => {
            setProgramStudentCourses([]);
        })
    }

    const load = async () => {
        setLoading(true);
        if((!courseId || !teacherId || !topicId) && state && state.parentPath) {
            setParentPath(state.parentPath);
        }
        await getCourseTeacher();
        await getTopics();
        await getProgramStudentCourses();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{courseId && teacherId && topicId?
        <Outlet/>:
        <ContentContainer previous={parentPath?parentPath:currentUserId?`/${currentUserId}/home`:'/home'} 
            Icon={PiChalkboardTeacherFill} 
            text={courseTeacher && courseTeacher.course?courseTeacher.course.name:''} 
            loading={loading}>
            <div className='flex flex-col w-full h-auto space-y-4'>
                {courseTeacher &&
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                        {courseTeacher.course && courseTeacher.course.description && <Detail label='Description' value={courseTeacher.course.description}/>}
                        <Detail label='External Id' value={courseTeacher.course.externalId}/>
                        <Detail label='Points' value={courseTeacher.course.points}/>
                        {courseTeacher.course.program && <Detail label='Program' value={courseTeacher.course.program.name}/>}
                        {courseTeacher.course.professionalCategory && <Detail label='Professional Category' value={courseTeacher.course.professionalCategory}/>}
                        {courseTeacher.course.availableFrom && <Detail label='Available from' value={courseTeacher.course.availableFrom.toLocaleString('default', { month: 'long' })+' '+courseTeacher.course.availableFrom.getDate()+', '+courseTeacher.course.availableFrom.getFullYear()}/>}
                        {courseTeacher.course.availableTo && <Detail label='Available upto' value={courseTeacher.course.availableTo.toLocaleString('default', { month: 'long' })+' '+courseTeacher.course.availableTo.getDate()+', '+courseTeacher.course.availableTo.getFullYear()}/>}
                        <Detail label='Available' value={courseTeacher.course.available?'Yes':'No'}/>
                    </div>
                }
                {topics && topics.length > 0 &&
                    <div className='flex flex-col w-full h-auto'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Topics</p>
                        {topics.map((topic,i) => <TopicItem key={i} topic={topic} reload={getTopics}/>)}
                    </div>
                }
                {programStudentCourses && programStudentCourses.length > 0 &&
                <div className='flex flex-col w-full h-auto'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>CPD Students</p>
                    {programStudentCourses.map((programStudentCourse,i) => <UserItem key={i} user={programStudentCourse.programStudent.student} reload={getProgramStudentCourses}/>)}
                </div>
                }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default CourseTeacher