import React, { useContext } from 'react'
import FormDialog from './FormDialog'
import { GlobalContext } from '../contexts/GlobalContext'
import { PiDeviceMobile, PiLaptop } from 'react-icons/pi';
import { useState } from 'react';
import { BiLogoVisa } from 'react-icons/bi';
import RadioButton from './RadioButton';
import Payment from './Payment';
import MobilePayment from './MobilePayment';

const PaymentOptions = ({user,tariff,reload}) => {
    const {setDialog,setAccess} = useContext(GlobalContext);
    const [selected,setSelected] = useState(null);

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

    const onContinue = (e) => {

        if(selected && selected.id === 'main_acc') {
            setAccess({Component:() => <Payment user={user} tariff={tariff}  reload={reload}/>});
        } else if(selected && selected.id === 'mobile') {
            setAccess({Component:() => <MobilePayment user={user} tariff={tariff}  reload={reload}/>});
        }
    }

  return (
    <FormDialog title='Payment Options'>
        <div className='flex flex-col w-fit h-fit p-4 space-y-8'>
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
                <button onClick={e => setDialog(null)} 
                    className='flex shrink-0 w-32 h-8 rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                    Cancel
                </button>
            </div>
        </div>
    </FormDialog>
  )
}

export default PaymentOptions