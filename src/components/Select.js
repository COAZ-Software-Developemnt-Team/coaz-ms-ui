import React from 'react';
import { MdError } from 'react-icons/md';

const Select = ({label,id,name,value,children,disabled,onChange,register,errors,width}) => {
    let isInvalid = false;

    if(errors) {
        if(errors.length > 0){
            let found = errors.find((error) => {return error.id == id});
            if(found) {
                isInvalid = true;
            }
        } else {
            isInvalid = false;
        }
    }
    
    return (
        <div style={{'--input-width':width+'px'}} className='flex flex-col w-[var(--input-width)] gap-2 shrink-0'>
            <div className='flex justify-between'>
                <label htmlFor={id} className={`${disabled?'text-gray-400':'text-gray-600'} text-sm capitalize`}>{label}</label>
                {isInvalid && (
                    <InputError message='Required'/>
                )}
            </div>
            {disabled? (
                    <select
                        id={id}
                        name={name}
                        value={value}
                        disabled={true}
                        className='flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg'
                    >
                        {children}
                    </select>
                ): (
                    register? (
                    <select
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className='flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg'
                        {...register(id)}
                    >
                        {children}
                    </select>
                     ):(
                    <select
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className='flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg'
                    >
                        {children}
                    </select> 
                    )
                )
            }
        </div>
    )
}

const InputError = ({message}) => {
    return (
        <p className='flex items-center gap-1 px-2 text-sm font-thin italic text-red-500'>
            <MdError/>
            {message}
        </p>
    )
}

export default Select