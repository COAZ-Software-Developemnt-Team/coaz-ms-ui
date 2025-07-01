import React,{useEffect,useState,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import AddAnswers from './AddAnswers';
import { RiCheckboxBlankLine,RiCheckboxLine } from 'react-icons/ri';
import {request} from '../App'

const Question = ({number,question}) => {
	const {setDialog} = useContext(GlobalContext);
	const [answers,setAnswers] = useState([]);

	const getAnswers = async () => {
		if(question) {
            request('GET',`answers/${question.id}`,null,null,true)
			.then(async (response) => {
				if(response.status && response.status === 'SUCCESSFUL' && response.content) {
					setAnswers(response.content);
				}
			})
		}
	}

	useEffect(() => {
		getAnswers();
	},[])

  return (
    <div className='flex flex-row w-full h-auto text-sm font-helveticaNeueRegular text-[rgb(68,71,70)] '>
        <p className='w-8 h-fit font-helveticaNeueMedium overflow-hidden shrink-0'>{`${number}.`}</p>
        {question &&
            <div className='flex flex-col w-full h-fit space-y-2'>
                <p className='w-full h-fit'>{question.description}</p>
                <div className='flex flex-col w-full h-auto space-y-2'>
                    {answers && answers.map((answer,i) => {
                        let c  = String.fromCharCode('a'.charCodeAt(0) + i);
                        return <div key={i} className='flex flex-row w-full h-fit space-x-2 text-[rgb(68,71,70)]'>
                                <p className='w-8 h-6 font-helveticaNeueMedium overflow-hidden overflow-ellipsis whitespace-nowrap shrink-0'>
                                    {`(${c})`}
                                </p>
                                <p className='w-full font-helveticaNeueRegular'>{answer.description}</p>
                                <button disabled={true}>
                                    {answer.correct?
                                        <RiCheckboxLine size={20}/>:
                                        <RiCheckboxBlankLine size={20}/>}
                                </button>
                        </div> }
                    )}
                </div>
                <div className='flex flex-row w-full h-fit items-center justify-between'>
                  <button onClick={(e) => {
                      e.preventDefault();
                      setDialog({
                          show:true,
                          Component:() => <AddAnswers 
								questionId={question.id} 
								reload={getAnswers}
							/>
                      })
                  }}
                    className='h-6 px-2 text-sm font-helveticaNeueLight text-[rgb(0,175,240)] border rounded-sm'>
                    {answers && answers.length > 0?'Edit Answers':'Add Answers'}
                  </button>
                  <p className='font-helveticaNeueMedium'>{`Marks [${question.marks}]`}</p>
                </div>  
            </div>
        }
    </div>
  )
}

export default Question