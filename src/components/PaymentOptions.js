import React, { useContext } from 'react'
import { useLocation,useNavigate,useParams } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext'
import { useState } from 'react';
import RadioButton from './RadioButton';
import { useData } from '../data';
import Access from './Access';

const PaymentOptions = () => {
    const {setDialog} = useContext(GlobalContext);
    const [selected,setSelected] = useState(null);
    const location = useLocation();
    const state = location.state;
    const {request} = useData();
    const {currentUserId,receivableId,criteriaId} = useParams();
    const path = useLocation().pathname;
    const navigate = useNavigate();

    const onSelect = (option) => {
        setSelected(option);
    }

    const options = [
        {
            id:'main_acc',
            name:'Main Account'
        },
        {
            id:'mobile',
            name:'Mobile Money'
        },
        {
            id:'card',
            name:'Card'
        }
    ]

    const close = () => {
        navigate(state && state.parentPath?state.parentPath:currentUserId?`/${currentUserId}/home`:'/home')
    }

    const onContinue = async (e) => {
        if(!currentUserId || !receivableId || !criteriaId) {
            return;
        }
        let user = null;
        await request('GET','current',null,null,true) 
        .then((response) => {
            if(response.content && response.content.user) {
                user = response.content.user;
            }
        })
        let tariff = null;
        await request('GET','tariff',null,{receivableId:receivableId,criteriaId:criteriaId},true) 
        .then((response) => {
            if(response.content) {
                tariff = response.content;
            }
        })
        if(!user || !tariff) {
            return;
        }
        if(selected && selected.id === 'main_acc') {
            navigate('/payment',{state:{parentPath:path,user:user,tariff:tariff}});
        } else if(selected && selected.id === 'mobile') {
            navigate('/mobile_payment',{state:{parentPath:path,user:user,tariff:tariff}});
        }
    }

  return (
    <Access onClose={close}>
        <div className='flex flex-col w-fit h-fit p-4 space-y-8 bg-white shadow-lg rounded-md'>
            <span className='w-full h-fit font-helveticaNeueRegular text-sm text-[rgb(150,150,150)]'>Payment Options</span>
            <div className='flex flex-col w-fit h-fit space-y-4'>
            {options.map((option,i) => <RadioButton key={i} radioButton={option} selected={selected} onSelect={onSelect}/>)}
            </div>
            <div className='flex flex-row w-fit h-fit shrink-0 items-center justify-center space-x-4'>
                <button 
                    onClick={e => {
                        e.preventDefault();
                        onContinue(e);
                        setDialog(null);
                    }} 
                    disabled={!selected}
                    className={`flex shrink-0 w-32 h-8 rounded-lg items-center justify-center ${selected?'bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)]':'bg-gray-300'}  text-white`}>
                    Continue
                </button>
                <button onClick={close} 
                    className='flex shrink-0 w-32 h-8 rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                    Cancel
                </button>
            </div>
        </div>
    </Access>
  )
}

export default PaymentOptions