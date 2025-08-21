import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, Outlet } from 'react-router-dom';
import { PiChalkboardTeacherFill} from "react-icons/pi";
import {useData} from '../data';
import ContentContainer from './ContentContainer';
import CourseTeacherItem from './CourseTeacherItem';

const CourseTeachers = () => {
    const {setDialog} = useContext(GlobalContext);
    const [courseTeachers,setCourseTeachers] = useState([]);
    const [availableCourses,setAvailableCourses] = useState([]);
    const [loading,setLoading] = useState();
    const [parentPath,setParentPath] = useState(null);
    const {request} = useData();
    const {currentUserId,courseId} = useParams();
    const [parent,setParent] = useState(null);
    const path = useLocation().pathname;
    
    const ENROLLMENTS = 'enrollments';
    const PROGRAMS = 'programs';
    const MY_COURSES = 'my_courses';

    const getCourseTeachers = async () => {
        await request('GET','courseteachers',null,null,true)
        .then((response) => {
            if(response && response.content) {
                setCourseTeachers(response.content);
            }
        })
    }

    const getAvailableCourses = async () => {
        await request('GET','courseteachers/available',null,null,true)
        .then((response) => {
            if(response && response.content) {
                setAvailableCourses(response.content);
            }
        })
    }

    const load = async () => {
        setLoading(true);
        if(path) {
            if(path.includes(PROGRAMS)) {
                setParent(PROGRAMS)
            } else if(path.includes(ENROLLMENTS)) {
                setParent(ENROLLMENTS)
            } else if(path.includes(MY_COURSES)) {
                setParent(MY_COURSES)
            }
        }
        /* if(!courseId && state && state.parentPath) {
            setParentPath(state.parentPath);
        } */
        await getCourseTeachers();
        await getAvailableCourses();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{courseId?
        <Outlet/>:
        <ContentContainer previous={`/${currentUserId}/home`} Icon={PiChalkboardTeacherFill} text='My CPDS' loading={loading}>
            <div className='flex flex-col w-full h-auto space-y-4'>
                {courseTeachers && courseTeachers.length > 0 &&
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>My CPDs</p>
                        {courseTeachers.map((course,i) => <CourseTeacherItem key={i} courseTeacher={course} reload={load} parent={parent} setLoading={setLoading}/>)}
                    </div>
                }
                {availableCourses && availableCourses.length > 0 &&
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Available CPDs</p>
                        {availableCourses.map((course,i) => <CourseTeacherItem key={i} courseTeacher={course} reload={load} parent={parent} setLoading={setLoading}/>)}
                    </div>
                }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default CourseTeachers