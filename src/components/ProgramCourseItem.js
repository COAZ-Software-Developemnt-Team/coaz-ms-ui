import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation } from 'react-router-dom';
import { PiBookLight,PiChalkboardTeacherLight,PiDotsThreeVertical,PiPen,PiTrash } from 'react-icons/pi';
import YesNoDialog from './YesNoDialog';
import EditProgramCourse from './EditProgramCourse';
import { request } from '../App';

const ProgramCourseItem = ({programCourse,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    const onEdit = (e) => {
        e.preventDefault();
        if(programCourse && programCourse.programId && programCourse.courseId) {
            setDialog({
                show:true,
                Component:() => <EditProgramCourse programId={programCourse.programId} courseId={programCourse.courseId} reload={reload}/>
            })
        }
    }

    const onRemove = (e) => {
        e.preventDefault();
        if(programCourse) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Remove Course' 
                        message={`Are you sure you want to remove ${programCourse.course.name} from ${programCourse.program.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE',`programcourse`,null,{
                                programId:programCourse.program.id,
                                courseId:programCourse.course.id
                            },true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    useEffect(() => {
        ( async () => {
            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status === 'YES') {
                    setUpdateAuthority(true);
                }  else {
                    setUpdateAuthority(false);
                }
            })}
        )();
    },[]);

    return (
        <div className='flex flex-row w-full h-auto'>
            {programCourse && programCourse.program && programCourse.course &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <button onClick={(e) => navigate(`/programs/${programCourse.programId}/${programCourse.courseId}`)} 
                    className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    {programCourse.courseClass?
                        <PiChalkboardTeacherLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <PiBookLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    }
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {programCourse.course.name}
                        </p>
                        <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${USDecimal.format(programCourse.course.points)} Points 
                            ${programCourse.courseClass && programCourse.courseClass.teacher?`( ${programCourse.courseClass.teacher.name} )`:''}`}
                        </p>
                    </div>
                </button>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && updateAuthority && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            <button 
                                                onClick={onEdit}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiPen size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Edit
                                                </p>
                                            </button>
                                            <button 
                                                onClick={onRemove}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiTrash size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Remove
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

export default ProgramCourseItem