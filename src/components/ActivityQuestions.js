import React, {useEffect,useState,useContext,useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useParams,useNavigate, useOutletContext } from 'react-router-dom';
import { RiFileListFill,RiFileList3Line,RiTimeFill,RiQuestionnaireLine,RiMore2Line} from "react-icons/ri";
import { PiArrowLeft,PiQuestion } from 'react-icons/pi';
import Scrollable from './Scrollable';
import AddQuestion from './AddQuestion';
import Question from './Question';
import {useData} from '../data';

const ActivityQuestions = () => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [activity,setActivity] = useState(null);
    const [questions,setQuestions] = useState([]);
    const {request} = useData();
    const {activityId} = useParams();
    const {parentPath} = useOutletContext();
    const moreRef = useRef(null);

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const navigate = useNavigate();

    const getQuestions = async () => {
        await request('GET',`questions/${activityId}`,null,null,true)
        .then((response) => {
            if(response.content) {
                setQuestions(response.content);
            }
        })
    }

    const onAddQuestion = async (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => 
                <AddQuestion id={activityId} reload={getQuestions}/>
        })
    }

    useEffect(() => {
        ( async () => {
            await request('GET',`activity/${activityId}`,null,null,true)
            .then(async (response) => {
                if(response.content) {
                    setActivity(response.content);
                }
            })
        }
        )();
        getQuestions();
    },[])

  return (
    <>{activity &&
        <div className='relative flex flex-col w-full h-full items-center bg-white overflow-hidden'>
            <Scrollable vertical={true}>
                <div className='flex flex-col w-[90%] my-4 lg:w-3/4 min-h-[90%] m-auto h-auto rounded-md shadow-lg'>
                    {activity && 
                    <div className='flex flex-col w-full h-auto pb-4 space-y-8 bg-[rgba(255,255,255,.96)]'>
                        <div className='flex flex-row w-full h-fit p-4 justify-between shrink-0 space-x-2 text-[rgb(0,175,240)] items-center'>
                            <button 
                                onClick={(e) => navigate(parentPath)}
                                className='flex w-12 h-12 hover:bg-[rgba(0,0,0,.05)] rounded-full'
                            >
                                <PiArrowLeft size={32} className='flex m-auto'/>
                            </button>
                            <button ref={moreRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPopupData({
                                        show:true,
                                        parentElement:moreRef.current,
                                        Component:
                                            <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                                <button 
                                                    onClick={onAddQuestion}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiQuestion size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Add Question
                                                    </p>
                                                </button>
                                            </div>
                                    })
                                }}
                                className='flex w-12 h-12 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.05)] rounded-full'>
                                <RiMore2Line size={32} />
                            </button>
                        </div>
                        <div className='flex flex-col w-full h-auto px-8 space-y-4 font-[arial]'>
                            <div className='flex flex-row w-full h-auto items-center space-x-4'>
                                {activity.classname === 'Assignment'?
                                    <RiFileList3Line size={80} className='text-[rgb(0,175,240)]'/>:
                                activity.classname === 'Quiz'?
                                    <RiFileListFill size={80} className='text-[rgb(0,175,240)]'/>:
                                    <></>
                                }
                                <div className='flex flex-col w-auto h-fit'>
                                    {activity.name &&
                                        <p className='flex w-full h-auto text-xl font-semibold text-[rgb(68,70,71)] uppercase'>
                                            {activity.name}
                                        </p>
                                    }
                                    <p className='flex w-full h-auto text-sm text-[rgb(143,145,145)] capitalize'>
                                        Questions
                                    </p>
                                </div>
                            </div>
                            {activity.duration &&
                                <div className='flex flex-row items-center space-x-2 text-sm text-[rgb(68,70,71)]'>
                                    <RiTimeFill size={20} className='text-[rgb(0,175,240)]'/>
                                    <p className='font-semibold '>Duration:</p>
                                    <p className='tracking-wide'>
                                        {`${USDecimal.format(activity.duration)} mins`}
                                    </p>
                                </div>
                            }
                        </div>
                        <div className='flex flex-col w-full h-auto px-8 space-y-4 shrink-0'>
                            {questions && questions.map((question,i) => 
                                <Question key={i} number={++i} question={question}/>
                            )}
                        </div>
                    </div>
                    }
                </div>
            </Scrollable>
        </div>}
    </>
  )
}

export default ActivityQuestions