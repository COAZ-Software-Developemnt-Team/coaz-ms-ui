import React,{useEffect,useState,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Scrollable from './Scrollable';
import TextArea from './TextArea';
import Message from './Message';
import FormDialog from './FormDialog';
import { RiCheckboxBlankLine,RiCheckboxLine,RiDeleteBin6Line } from 'react-icons/ri';
import {useData} from '../data';

const AddAnswers = ({questionId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [newAnswer,setNewAnswer] = useState('');
    const [oldAnswer,setOldAnswer] = useState('');
    const [answers,setAnswers] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const {request} = useData();

    const setCorrectAnswer = (answer) => {
        for(let ans of answers) {
            ans.correct = false;
        }
        answer.correct = true;
        setAnswers(answers.filter(ans => ans));
    }

    const submit = async (e) => {
        let corrects = 0;
        for(let answer of answers) {
            if(answer.correct) {
                corrects++;
            }
        }
        if(corrects === 0 || corrects > 1) {
            setMessage({content:'No correct answer or multiple correct answers',success:false});
            return;
        }
        setMessage({content:'',success:false});
        setLoading(true);
        await request('POST','answers',answers,{
            questionId:questionId
        },true)
        .then((response) => {
            setLoading(false);
            if(response.status) {
                if(response.status === 'SUCCESSFUL' && response.content) {
                    reload && reload();
                    setDialog(null);
                } else {
                    setMessage({content:response.message,success:false});
                }
            } else  {
                setMessage({content:response,success:false});
            }
        })
        .catch((error) => {
            setMessage({content:error.message,success:false});
            setLoading(false);
        });
    };
    
    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);
    const getAnswers = async () => {
        if(questionId) {
            await request ('GET',`answers/${questionId}`,null,null,true)
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
    <div>
            <FormDialog title='Add Answers'>
                <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                        <Scrollable vertical={true}>
                            <div onClick={(e) => {
                                    setOldAnswer('')
                                    setNewAnswer('')
                                }} 
                                className='flex flex-col w-full h-auto space-y-4 shrink-0'>
                                <div className='flex flex-col w-full h-auto space-y-2'>
                                    {answers && answers.map((answer,i) =>
                                        <div key={i} className='flex flex-row w-full h-fit space-x-2 text-[rgb(68,71,70)]'>
                                                <p className='w-8 h-6 text-center font-helveticaNeueMedium overflow-hidden overflow-ellipsis whitespace-nowrap shrink-0'>
                                                    {`(${String.fromCharCode('a'.charCodeAt(0) + i)})`}
                                                </p>
                                                <p onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setOldAnswer(answer.description);
                                                        setNewAnswer(answer.description);
                                                    }}
                                                    className='w-full font-helveticaNeueRegular cursor-pointer'>
                                                    {answer.description}
                                                </p>
                                                <button onClick={(e) => setCorrectAnswer(answer)}>
                                                    {answer.correct?
                                                        <RiCheckboxLine size={20}/>:
                                                        <RiCheckboxBlankLine size={20}/>}
                                                </button>
                                                <button onClick={(e) => {
                                                        setAnswers(answers.filter(ans => ans !== answer));
                                                    }}
                                                    className='w-6 h-6 shrink-0'>
                                                    <RiDeleteBin6Line size={16} />
                                                </button>
                                        </div>
                                    )}
                                </div>
                                <div onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                if(oldAnswer === '' && newAnswer !== ''){
                                                    let newAnswers = JSON.parse(JSON.stringify(answers));
                                                    newAnswers.push({description:newAnswer});
                                                    setAnswers(newAnswers);
                                                } else if(oldAnswer !== '') {
                                                    let found = answers.find((answer) => {return answer.description === oldAnswer });
                                                    found.description = newAnswer;
                                                }
                                                setNewAnswer('');
                                                setOldAnswer('');
                                            }
                                        }
                                    } 
                                    onClick={(e) => e.stopPropagation()}
                                    className='w-full h-auto'>
                                    <TextArea
                                        id='newAnswer'
                                        name='newAnswer'
                                        value={newAnswer}
                                        placeholder='New answer'
                                        onChange={(e) => handleChange(e,(e) => setNewAnswer(e.target.value))}
                                    /> 
                                </div>
                                <Message message={message}/>
                                <button onClick={handleSubmit} className='flex shrink-0 w-64 h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                    Submit
                                </button>
                            </div>
                        </Scrollable>
                    </div>
                </FormValidator>
            </FormDialog>
        </div>
  )
}

export default AddAnswers