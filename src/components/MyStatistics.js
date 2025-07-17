import React,{useEffect,useState} from 'react'
import {BsGraphUpArrow,BsGraphUp} from "react-icons/bs";
import Scrollable from './Scrollable';
import { useRef } from 'react';
import {useData} from '../data';
import { PiBook, PiBookThin, PiChartLine, PiChartLineThin, PiGraduationCap, PiGraduationCapLight, PiGraduationCapThin } from 'react-icons/pi';

const MyStatistics = () => {
    const [enrollments,setEnrollments] = useState([]);
    const [enrollmentCourses,setEnrollmentCourses] = useState([]);
    const [points,setPoints] = useState(0.0);
    const [completedPrograms,setCompletedPrograms] = useState(0.0);
    const [completedCourses,setCompletedCourses] = useState(0.0);
    const {request} = useData();
    const programsRef = useRef(null);
    const coursesRef = useRef(null);
    const padding = 16;
    const [contentSize,setContentSize] = useState({width:0,height:0});

    useEffect(() => {
        request ('GET','enrollments/my',null,null,true)
        .then((response) => {
            if(response.content) {
                let comp = 0;
                for(let enrollment of response.content) {
                    comp += enrollment.complete?1:0;
                }
                setEnrollments(response.content);
                setCompletedPrograms(comp);
            }
        })

        request ('GET','enrollment/courses/my',null,null,true)
        .then((response) => {
            if(response.content) {
                let pts = 0;
                let comp = 0;
                for(let enrollmentCourse of response.content) {
                    pts += enrollmentCourse.points;
                    comp += enrollmentCourse.complete?1:0;
                }
                setPoints(pts);
                setEnrollmentCourses(response.content);
                setCompletedCourses(comp);
            }
        })

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                let rect = entry.target.getBoundingClientRect();
                setContentSize({
                    width:rect.width - (padding*2) - 2,
                    height:rect.height - (padding*2) - 2
                })
            }
        });

        if(programsRef.current) {
            observer.observe(programsRef.current)
        }

        const observer2 = new ResizeObserver(entries => {
            for (let entry of entries) {
                let rect = entry.target.getBoundingClientRect();
                setContentSize({
                    width:rect.width - (padding*2) - 2,
                    height:rect.height - (padding*2) - 2
                })
            }
        });

        if(coursesRef.current) {
            observer2.observe(coursesRef.current)
        }
        return () => {
            observer.disconnect();
            observer2.disconnect();
        }
    },[])
  return (
    <div className='flex flex-col w-full h-full shrink-0 p-8 space-y-4 tracking-wider text-[rgb(68,71,70)] font-helveticaNeueMedium'>
        <p className='text-sm tracking-wider text-[rgb(68,71,70)] font-helveticaNeueMedium shrink-0 uppercase'>
            My Statistics
        </p>
        <div className='flex flex-wrap w-full h-fit overflow-hidden bg-white shrink-0 border border-[rgba(0,175,240,.2)] rounded-md'>
            <div className='flex flex-row w-fit h-fit items-center space-x-4 p-2 shrink-0'>
                <div className='flex w-10 h-10 items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)] shrink-0 rounded-md'>
                    <PiGraduationCapThin size={24}/>
                </div>
                <div className='flex flex-col items-center'>
                    <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                        Completed Programs
                    </p>
                    <p className='w-full font-helveticaNeueMedium text-[rgb(0,175,240)] uppercase'>
                        {completedPrograms}
                    </p>
                </div>
            </div>
            <div className='flex flex-row w-fit h-fit items-center space-x-4 p-2'>
                <div className='flex w-10 h-10 items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)] shrink-0 rounded-md'>
                    <PiBookThin size={24}/>
                </div>
                <div className='flex flex-col items-center'>
                    <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                        Completed CPDs
                    </p>
                    <p className='w-full font-helveticaNeueMedium text-[rgb(0,175,240)] uppercase'>
                        {completedCourses}
                    </p>
                </div>
            </div>
            <div className='flex flex-row w-fit h-fit items-center space-x-4 p-2 shrink-0'>
                <div className='flex w-10 h-10 items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)] shrink-0 rounded-md'>
                    <PiChartLineThin size={24}/>
                </div>
                <div className='flex flex-col items-center'>
                    <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                        Accumulated Points
                    </p>
                    <p className='w-full font-helveticaNeueMedium text-[rgb(0,175,240)] uppercase'>
                        {points}
                    </p>
                </div>
            </div>
            <div className='flex flex-row w-[20%] h-full'/>
            <div className='flex flex-row w-[20%] h-full'/>
            <div className='flex flex-row w-[20%] h-full'/>
        </div>
        <div ref={programsRef}
            style={{padding:padding+'px'}}
            className='relative flex flex-col w-full h-1/2 bg-white border border-[rgba(0,175,240,.2)] overflow-hidden rounded-md'>
            <Scrollable vertical={true} horizontal={true}>
                <div style={{width:contentSize.width+'px',height:contentSize.height+'px'}}
                    className='relative flex flex-col min-w-[680px]'>
                    <div className='flex flex-row w-full text-sm text-[rgb(68,71,70)] font-helveticaNeueMedium capitalize'>
                        <p className='w-[50%] px-2'>Program</p>
                        <p className='w-[50%] px-2'>Completion</p>
                    </div>
                    {enrollments && 
                        enrollments.map((enrollment,i) => {
                        return <>
                            <div key={i} className='flex flex-row w-full'>
                                <div className='w-[50%] p-2'>
                                    <p className='w-full p-2 text-xs text-[rgb(0,175,240)] overflow-hidden break-words font-helveticaNeueRegular bg-[rgba(0,175,240,.2)] rounded-md'>
                                        {enrollment.program.name}
                                    </p>
                                </div>
                                <div className='flex w-[50%] h-full items-center p-2'>
                                    <div className='relative w-full h-4 bg-gray-200'>
                                        <div style={{width:enrollment.completionPercentage+'%'}} className='h-full bg-[rgb(138,209,164)]'/>
                                        <p className='absolute top-0 left-0 w-full text-xs text-[rgb(68,71,70)] text-center font-helveticaNeueRegular'>
                                            {`${enrollment.completionPercentage} %`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                        })
                    }
                    <div className='absolute flex flex-row top-0 left-0 right-0 bottom-0'>
                        <div className='w-[50%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[50%] h-full'/>
                    </div>
                </div>
            </Scrollable>
        </div>
        <div ref={coursesRef}
            style={{padding:padding+'px'}}
            className='relative flex flex-col w-full h-1/2 bg-white border border-[rgba(0,175,240,.2)] overflow-hidden rounded-md'>
            <Scrollable vertical={true} horizontal={true}>
                <div style={{width:contentSize.width+'px',height:contentSize.height+'px'}}
                    className='relative flex flex-col min-w-[680px]'>
                    <div className='flex flex-row w-full text-sm text-[rgb(68,71,70)] font-helveticaNeueMedium capitalize'>
                        <p className='w-[25%] px-2'>CPD</p>
                        <p className='w-[25%] px-2'>Completion</p>
                        <p className='w-[25%] px-2'>Points</p>
                        <p className='w-[25%] px-2'>Awarded Points</p>
                    </div>
                    {enrollmentCourses && 
                        enrollmentCourses.map((enrollmentCourse,i) => {
                            return <>
                                <div key={i} className='flex flex-row w-full'>
                                    <div className='w-[25%] p-2'>
                                        <p className='w-full p-2 text-xs text-[rgb(0,175,240)] font-helveticaNeueRegular bg-[rgba(0,175,240,.2)] rounded-md'>
                                            {enrollmentCourse.course?
                                                enrollmentCourse.course.name:''}
                                        </p>
                                    </div>
                                    <div className='flex w-[25%] h-full items-center p-2'>
                                        <div className='relative w-full h-4 bg-gray-200'>
                                            <div style={{width:enrollmentCourse.completionPercentage+'%'}} className='h-full bg-[rgb(138,209,164)]'/>
                                            <p className='absolute top-0 left-0 w-full text-xs text-[rgb(68,71,70)] text-center font-helveticaNeueRegular'>
                                                {`${enrollmentCourse.completionPercentage} %`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex w-[25%] h-full items-center'>
                                        <p className='w-full p-2 text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular'>
                                            {enrollmentCourse.coursePoints}
                                        </p>
                                    </div>
                                    <div className='flex w-[25%] h-full items-center'>
                                        <p className='w-full p-2 text-sm text-[rgb(0,175,240)] font-helveticaNeueMedium'>
                                            {enrollmentCourse.points}
                                        </p>
                                    </div>
                                </div>
                            </>
                        })
                    }
                    <div className='absolute flex flex-row top-0 left-0 right-0 bottom-0'>
                        <div className='w-[25%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[25%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[25%] h-full border-r border-[rgba(0,175,240,.2)]'/>
                        <div className='w-[25%] h-full'/>
                    </div>
                </div>
            </Scrollable>
        </div>
    </div>
  )
}

export default MyStatistics