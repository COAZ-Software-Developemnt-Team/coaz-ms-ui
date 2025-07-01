import React, {useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams} from 'react-router-dom';
import { PiTextAlignLeftLight,PiTrash,PiDotsThreeVertical } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import { request } from '../App';

const TopicItem = ({topic,reload,updateAuthority}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const {courseId,teacherId} = useParams();
    const path = useLocation().pathname;
    const moreRef = useRef(null)

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        if(courseId && teacherId) {
            navigate(`${path}/${topic.id}`);
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(topic) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Delete Topic' 
                        message={`Are you sure you want to delete ${topic.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE',`topic/${topic.id}`,null,null,true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {topic &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={onOpen}
                    className={`flex flex-row w-fit items-center space-x-2 shrink-0 ${courseId && teacherId?'cursor-pointer':''}`}>
                    <PiTextAlignLeftLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {topic.name}
                        </p>
                    </div>
                </div>
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
                    }
                </div>
            </div>}
        </div>
    )
}

export default TopicItem