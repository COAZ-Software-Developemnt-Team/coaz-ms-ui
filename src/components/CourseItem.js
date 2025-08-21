import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation, useNavigate,useParams } from 'react-router-dom';
import { PiBookLight,PiLock,PiLockFill,PiTag,PiTrash } from 'react-icons/pi';
import YesNoDialog from './YesNoDialog';
import EditCourse from './EditCourse';
import {useData} from '../data';

const CourseItem = ({course,parent,reload}) => {
    const {setDialog,screenSize} = useContext(GlobalContext);
    const [deleteAuthority,setDeleteAuthority] = useState(false);
    const [highlighted,setHighlighted] = useState(false);
    const [defaultTariff,setDefaultTariff] = useState(null);
    const {currentUserId,programId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();

    const ENROLLMENTS = 'enrollments';
    const PROGRAMS = 'programs';

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
         if(course && parent) {
            navigate(`/${currentUserId}/${parent}/${programId}/${course.id}`,{state:{parentPath:path}})
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(course) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Delete Course' 
                        message={`Are you sure you want to delete ${course.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE',`course/${course.id}`,null,null,true)
                            .then(response => {
                                reload && reload(parent);
                            })
                        }}
                    />
            })
        }
    }

    useEffect(() => {
        request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                setDeleteAuthority(true);
            }
        })
        if(course && course.tariffApplicable) {
            request('GET','tariff/default',null,{receivableId:course.id},true)
            .then((response) => {
                if(response.content) {
                    setDefaultTariff(response.content);
                }
            })
        }
    },[])

    return (
        <div className='flex flex-row w-full h-auto'>
            {course &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <button onClick={onOpen} 
                    className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <div className='relative w-fit h-fit'>
                        <PiBookLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                        {!course.available && <div className='absolute right-0 bottom-0 w-fit h-fit'>
                            <PiLockFill size={20} className='text-red-400 shrink-0'/>
                        </div>}
                    </div>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {course.name}
                        </p>
                        {course.tariffApplicable && defaultTariff? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{`K ${USDecimal.format(defaultTariff.price)}`}</p>
                            </div>
                            :
                            <p className='w-full text-left text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </button>
                <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                    {((highlighted || screenSize === 'xs') && deleteAuthority && parent === PROGRAMS) && 
                        <button onClick={onDelete}
                            className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-500 rounded-full'>
                            <PiTrash size={20}/>
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}

export default CourseItem