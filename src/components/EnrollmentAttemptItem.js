import React, {useEffect,useState,} from 'react'
import { useContext } from 'react';
import { PiChatCircleText, PiTargetLight } from "react-icons/pi";
import { GlobalContext } from '../contexts/GlobalContext';
import Feedback from './Feedback';

const EnrollmentAttemptItem = ({enrollmentAttempt,onOpen}) => {
    const {screenSize,setDialog} = useContext(GlobalContext);
    const [date,setDate] = useState(null);
    const [highlighted,setHighlighted] = useState(false);

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onFeedback = (student,feedback) => {
        setDialog({
            show:true,
            Component:() => 
                <Feedback student={student} feedback={feedback}/>
        })
    }

    useEffect(() => {
        if(enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.createdOn) {
            setDate(new Date(enrollmentAttempt.attempt.createdOn));
        }
    },[enrollmentAttempt])

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollmentAttempt && enrollmentAttempt.attempt && enrollmentAttempt.attempt.user && enrollmentAttempt.attempt.activity &&
            <div onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.05)] rounded-md'>
                <div onClick={(e) => onOpen && onOpen(e,enrollmentAttempt)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiTargetLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${enrollmentAttempt.attempt.activity.name} (${enrollmentAttempt.attempt.user.name})`}
                        </p>
                        <div className='flex flex-wrap space-x-1'>
                            <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular overflow-hidden overflow-ellipsis capitalize`}>
                                {`${date && date.toLocaleString('default', { month: 'long' })+' '+date.getDate()+', '+date.getFullYear()+' '+date.toLocaleTimeString('en-US')}`}
                            </p>
                            {enrollmentAttempt.attempt.status === 'PENDING'?
                                <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    , Pending...
                                </p>
                                :
                            enrollmentAttempt.attempt.status === 'CLOSED'?
                                <div className='flex flex-row space-x-1 text-[rgb(145,145,145)]'>
                                    <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                        {`${enrollmentAttempt.marks} of ${enrollmentAttempt.totalMarks}`}
                                    </p>
                                    <p className={`text-xs ${enrollmentAttempt.passed && 'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                        {`, ${USDecimal.format(enrollmentAttempt.grade)}%`}
                                    </p>
                                </div>
                                :
                            enrollmentAttempt.attempt.status === 'NEW'?
                                <p className={`text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    , New
                                </p>
                                :
                                <></>
                            }
                        </div>
                    </div> 
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                    {((highlighted || screenSize === 'xs')) && enrollmentAttempt.attempt.feedback && enrollmentAttempt.attempt.feedback != '' &&
                        <button onClick={(e) => onFeedback(enrollmentAttempt.attempt.user,enrollmentAttempt.attempt.feedback)}
                            className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiChatCircleText size={20}/>
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}

export default EnrollmentAttemptItem

