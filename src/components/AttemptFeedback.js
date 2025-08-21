import React, {useState,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { IoCloseOutline } from "react-icons/io5";
import { PiExclamationMarkFill, PiQuestionMarkFill } from "react-icons/pi";
import TextArea from './TextArea';
import { RiInformationFill, RiQuestionFill, RiQuestionMark } from 'react-icons/ri';
import { useData } from '../data';
import Message from './Message';

const AttemptFeedback = ({attempt}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const {request} = useData();
    const [feedback,setFeedback] = useState('');
    const [message,setMessage] = useState({content:'',success:false});

    const onPost = async () => {
        setLoading(true);
        if(attempt && feedback && feedback != '') {
            attempt.feedback = feedback;
            await request('PUT','attempt',attempt,null,true)
            .then( async (response) => {
                if(response.status && response.status === 'SUCCESSFUL') {
                    setDialog(null)
                } else {
                    setMessage({content:response,success:false});
                }
            }) 
            .catch((error) => {
                setMessage({content:error.message,success:false});
            })
        }
        setLoading(false);
    }
    return (
        <div className='flex flex-col w-fit h-fit shadow-xl text-sm font-jostBook tracking-wider bg-[rgb(252,252,252)] rounded-md overflow-hidden'>
            <div className='flex flex-row w-full items-center justify-between h-8 pl-4 pr-4 shrink-0 text-[rgb(150,150,150)] bg-[rgb(247,247,247)]'>
                <p className='capitalize'>Feedback</p>
                <button onClick={e => {
                        e.preventDefault();
                        setDialog(null);
                    }} 
                    className='flex w-6 h-6 shrink-0 hover:bg-[rgb(235,235,235)]'>
                    <IoCloseOutline size={24}/>
                </button>
            </div>
            <div className='flex flex-col w-fit h-fit p-4'>
                <div className='flex flex-row w-fit h-fit items-center justify-center space-x-4'>
                    <RiInformationFill size={32} className='text-[rgb(0,175,240)]'/>
                    <p className='w-full max-w-md h-fit text-[rgb(68,71,70)]'>
                        Attempt successfully saved
                    </p>
                </div>
                <div className='flex flex-row w-fit h-fit items-center justify-center space-x-4'>
                    <RiQuestionFill size={32} className='text-[rgb(0,175,240)]'/>
                    <p className='w-full max-w-md h-fit text-[rgb(68,71,70)]'>
                        How was your experience?
                    </p>
                </div>
                <TextArea
                    id='feedback'
                    name='feedback'
                    value={feedback}
                    placeholder='Your feedback'
                    onChange={(e) => setFeedback(e.target.value)}
                /> 
                <Message message={message}/>
                <div className='flex flex-row w-fit h-16 mx-auto shrink-0 items-center justify-center space-x-4'>
                    <button 
                        onClick={e => {
                            e.preventDefault();
                            onPost();
                        }} 
                        className='flex shrink-0 w-32 h-8 rounded-lg items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)]'>
                        Post
                    </button>
                    <button 
                        onClick={e => {
                            e.preventDefault();
                            setDialog(null);
                        }} 
                        className='flex shrink-0 w-32 h-8 rounded-lg items-center justify-center text-[rgb(0,175,240)] border border-[rgba(0,175,240,.2)]'>
                        Skip
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AttemptFeedback