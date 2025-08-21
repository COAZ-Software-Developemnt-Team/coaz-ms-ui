import React, {useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { IoCloseOutline } from 'react-icons/io5';

const Feedback = ({student,feedback}) => {
    const {setDialog} = useContext(GlobalContext);

    return (
        <div className='flex flex-col w-[90%] md:w-[640px]  h-fit shadow-xl text-sm font-jostBook tracking-wider bg-white rounded-md overflow-hidden'>
            <div className='flex flex-row w-full items-center justify-between h-8 pl-4 pr-4 shrink-0 text-[rgb(0,175,240)] bg-[rgb(0,175,240,.05)]'>
                <p className='capitalize'>Feedback</p>
                <button onClick={e => {
                        e.preventDefault();
                        setDialog(null);
                    }} 
                    className='flex w-6 h-6 shrink-0 hover:bg-[rgb(235,235,235)]'>
                    <IoCloseOutline size={24}/>
                </button>
            </div>
            {student && feedback && 
            <div className='flex flex-col w-full h-fit p-4 space-y-4 bg-[rgb(0,175,240,.05)]'>
                <div className='flex flex-row w-full h-fit space-x-2 font-helveticaNeueRegular tracking-wider items-center'>
                    <p className='flex w-10 h-10 rounded-full text-xl font-jostMedium items-center justify-center text-white bg-[rgb(0,175,240)] shrink-0'>
                        {student.firstname.charAt(0).toUpperCase()+student.lastname.charAt(0).toUpperCase()}
                    </p>
                    <p className='flex w-auto text-sm font-helveticaNeueRegular tracking-wide whitespace-nowrap text-[rgb(68,71,70)]'>{student.name}</p>
                </div>
                <textarea
                    id='feedback'
                    name='feedback'
                    value={feedback}
                    disabled={true}
                    rows={4}
                    className='relative flex w-full shrink-0 p-2 focus:outline-none font-thin text-sm text-[rgb(0,68,71,70)] bg-white border border-[rgb(0,175,240,.1)] rounded-lg' 
                /> 
                <div className='flex flex-row w-full h-16 mx-auto shrink-0 items-center justify-end'>
                    <button 
                        onClick={e => {
                            e.preventDefault();
                            setDialog(null);
                        }} 
                        className='flex shrink-0 w-32 h-8 rounded-lg items-center justify-center text-[rgb(0,175,240)] bg-[rgba(0,175,240,.2)]'>
                        Cancel
                    </button>
                </div>
            </div>}
        </div>
    )
}

export default Feedback