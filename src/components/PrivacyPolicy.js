import React, {useState,useEffect,useContext, Component} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { PiShieldDuotone } from 'react-icons/pi';
import { ImCheckboxChecked,ImCheckboxUnchecked } from 'react-icons/im';
import Scrollable from './Scrollable';

export function useIAgree() {
    const [iAgree,setIAgree] = useState(false);

    return {iAgree:iAgree,setIAgree:setIAgree}
}

export function IAgree({iAgree,setIAgree}) {
    const {setDialog} = useContext(GlobalContext);
    const showPrivacyPolicy = () => {
        setDialog({
            show:true,
            Component:() => <PrivacyPolicy/>
        })
    }
    return (
        <div className={`flex flex-row w-full h-fit items-center shrink-0 space-x-2 overflow-hidden`}>
            <button onClick={() => {setIAgree(!iAgree);}} className='w-fit h-fit text-slate-600 shrink-0'>
                {iAgree?<ImCheckboxChecked size={16}/>:
                <ImCheckboxUnchecked size={16}/>}
            </button>
            <div className='flex flex-wrap w-full h-fit overflow-hidden'>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>I</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>have</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>read</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>the</span>
                <button onClick={showPrivacyPolicy} className='h-5 mr-1 text-sm my-auto text-[rgb(0,175,240)] hover:underline'>privacy policy</button>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>and</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>agree</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>to</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>the</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>COAZ</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>terms</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>and</span>
                <span className='h-5 mr-1 text-sm text-gray-600 my-auto'>conditions</span>
            </div>
        </div>
    )
}

const PrivacyPolicy = () => {
    const {setDialog} = useContext(GlobalContext);
    return (
        <div className='flex flex-col w-[90vw] sm:w-[640px] bg-white h-fit py-4 justify-between font-helveticaNeueRegular  rounded-xl overflow-hidden'>
                <div className='flex flex-col w-full h-fit space-y-4'>
                    <div className='flex flex-col w-full h-fit items-center justify-center text-[rgb(0,175,240)]'>
                        <PiShieldDuotone size={64}/>
                        <span className='text-lg font-helveticaNeueRegular uppercase tracking-wider'>Privacy Policy</span>
                    </div>
                    <p className='w-full p-4 text-sm/8 text-[rgb(68,71,70)]'>
                        {`By using this website and submitting your personal information through any of its forms, you expressly 
                        consent to the Clinical Officers Association of Zambia (COAZ) collecting, storing, and processing your 
                        personal data in accordance with the Data Protection Act No. 3 of 2021. This data will be used solely 
                        for purposes related to the Association's functions, including communication, membership management, 
                        regulatory compliance, and service improvement.`}
                    </p>
                </div>
                <button onClick={() => setDialog(null)} className='flex shrink-0 w-fit h-10 px-4 mt-8 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-sm text-white font-helveticaNeueLight'>
                    I've understood
                </button>
        </div>
    )
}
 