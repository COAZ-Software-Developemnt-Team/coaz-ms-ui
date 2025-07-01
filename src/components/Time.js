import React from 'react'

const Time = ({label,id,value,disabled,onChange,register,errors,width}) => {
  return (
    <div id={id}
        style={{width:width+'px'}} 
        className='flex flex-col h-auto shrink-0 space-y-2'>
        <label className={`${disabled?' text-gray-400':'text-gray-600'} text-sm capitalize`}>{label}</label>
        <div className='flex flex-row w-full h-auto items-center space-x-2'>
            <input
                type='number'
                id={id+'_hour'}
                name={id+'_hour'}
                list='hours'
                min={0}
                max={23}
                placeholder='Hr'
                value={value?value.hour:''}
                disabled={disabled}
                onChange={(e) => {
                    let value = e.target.value;
                    if(value < 24) {
                        onChange(e);
                    }
                }}
                className='flex w-20 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg' 
            />
            <datalist id='hours'>
                {(() => {
                    let hours = [];
                    for(let i = 0;i < 24;i++) {
                        hours.push(<option>{i}</option>);
                    }
                    return hours
                })()}
            </datalist>
            <p className='font-thin text-sm'>:</p>
            <input
                type='number'
                id={id+'_min'}
                name={id+'_min'}
                list='mins'
                min={0}
                max={23}
                placeholder='Min'
                value={value?value.min:''}
                disabled={disabled}
                onChange={(e) => {
                    let value = e.target.value;
                    if(value < 60) {
                        onChange(e);
                    }
                }}
                className='flex w-20 h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg' 
            />
            <datalist id='mins'>
                {(() => {
                    let mins = [];
                    for(let i = 0;i < 60;i++) {
                        mins.push(<option>{i}</option>);
                    }
                    return mins
                })()}
            </datalist>
        </div>
    </div>
  )
}

export default Time