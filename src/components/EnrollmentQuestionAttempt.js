import React,{useEffect,useState} from 'react'
import { RiCheckboxBlankLine,RiCheckboxLine } from 'react-icons/ri';
import {useData} from '../data'

const EnrollmentQuestionAttempt = ({number,enrollmentQuestionAttempt, action,reload}) => {
    const [attemptAnswer,setAttemptAnswer] = useState(null);
    const [textAnswer,setTextAnswer] = useState('');
    const [questionAttemptMarks,setQuestionAttemptMarks] = useState('');
    const [marks,setMarks] = useState('');
    const [request] = useData;

    useEffect(() => {
        if(enrollmentQuestionAttempt && enrollmentQuestionAttempt.questionAttempt) {
            setAttemptAnswer(enrollmentQuestionAttempt.questionAttempt.answer);
            setTextAnswer(enrollmentQuestionAttempt.questionAttempt.textAnswer);
            setQuestionAttemptMarks(enrollmentQuestionAttempt.marks);
        }
    })
  return (
    <div className='relative flex flex-row w-full h-auto text-sm font-helveticaNeueRegular text-[rgb(68,71,70)]'>
        <p className='w-8 h-6 font-helveticaNeueMedium overflow-hidden overflow-ellipsis whitespace-nowrap shrink-0'>{`${number}.`}</p>
        {enrollmentQuestionAttempt && enrollmentQuestionAttempt.questionAttempt && enrollmentQuestionAttempt.questionAttempt.question && enrollmentQuestionAttempt.questionAttempt.attempt &&
            <div className='flex flex-col w-full h-fit space-y-2'>
                <p className='w-full h-fit'>{enrollmentQuestionAttempt.questionAttempt.question.description}</p>
                {enrollmentQuestionAttempt.answers && enrollmentQuestionAttempt.answers.length > 0? 
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        {enrollmentQuestionAttempt.answers.map((answer,i) => {
                            let c  = String.fromCharCode('a'.charCodeAt(0) + i);
                            return <div key={i} className='flex flex-row w-full h-fit space-x-2 text-[rgb(68,71,70)]'>
                                    <p className='w-8 h-6 font-helveticaNeueMedium overflow-hidden overflow-ellipsis whitespace-nowrap shrink-0'>
                                        {`(${c})`}
                                    </p>
                                    <p className='w-full font-helveticaNeueRegular'>{answer.description}</p>
                                    <button onClick = {(e) => {
                                            e.preventDefault()
                                            if(action === 'ATTEMPTING') {
                                                setAttemptAnswer(answer);
                                                enrollmentQuestionAttempt.questionAttempt.answer = answer
                                            }
                                        }}
                                        disabled={action !== 'ATTEMPTING'}
                                        > 
                                        {attemptAnswer && attemptAnswer.id === answer.id?
                                            <RiCheckboxLine size={20} 
                                                className={`${enrollmentQuestionAttempt.questionAttempt.marked && answer.correct?'text-green-600':enrollmentQuestionAttempt.questionAttempt.marked?'text-red-600':''}`}/>:
                                            <RiCheckboxBlankLine size={20}
                                                className={`${enrollmentQuestionAttempt.questionAttempt.marked && answer.correct?'text-green-600':''}`}/>}
                                    </button>
                            </div> }
                        )}
                    </div>:
                    <textarea
                        id='textAnswer'
                        name='textAnswer'
                        value={textAnswer?textAnswer:''}
                        disabled = {action !== 'ATTEMPTING'}
                        placeholder='Answer...'
                        onChange={(e) => {
                            setTextAnswer(e.target.value)
                            enrollmentQuestionAttempt.questionAttempt.textAnswer = e.target.value;
                        }}
                        rows={4}
                        className='relative flex w-full shrink-0 p-2 focus:outline-none font-thin text-sm bg-transparent border rounded-lg'/>
                }
                
                <div className='flex flex-row-reverse w-full h-fit justify-between items-center'>
                    <div className='flex flex-row w-fit space-x-2'>
                        <p className='font-helveticaNeueMedium'>{`Marks [${enrollmentQuestionAttempt.questionMarks}]`}</p>
                    </div>
                    {!enrollmentQuestionAttempt.multipleChoice && action === 'MARKING' && 
                        <input
                            onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        request('PUT','question/attempt/mark',null,{
                                            questionId:enrollmentQuestionAttempt.questionAttempt.question.id,
                                            attemptId:enrollmentQuestionAttempt.questionAttempt.attempt.id,
                                            marks:marks
                                        },true)
                                        .then((response) => {
                                            if(response.status && response.status === 'SUCCESSFUL') {
                                                reload && reload();
                                                setQuestionAttemptMarks(marks);
                                                setMarks('');
                                            }
                                        })
                                    }
                                }
                            }
                            type='number'
                            name='marks'
                            value={marks}
                            placeholder='Grade...'
                            onChange={(e) => {
                                if(e.target.value <= enrollmentQuestionAttempt.questionMarks) {
                                    setMarks(e.target.value)
                                }
                            }}
                            className='text-sm focus:outline-none bg-transparent'
                        />
                    }
                </div>  
            </div>
        }
        {!enrollmentQuestionAttempt.multipleChoice && enrollmentQuestionAttempt.questionAttempt.marked && questionAttemptMarks != null && questionAttemptMarks != undefined &&
            <p className='absolute w-fit text-center font-bold h-fit top-0 bottom-0 left-0 right-0 m-auto text-5xl text-[rgba(255,0,0,.2)]'>{questionAttemptMarks}</p>
        }
    </div>
  )
}

export default EnrollmentQuestionAttempt