import React from 'react';
import { MdError } from 'react-icons/md';

const Input = ({label,type,inputMode,id,name,value,list,placeholder,disabled,onChange,register,errors,width}) => {

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
    
    return (<div style={{'--input-width':width+'px'}} className='flex flex-col w-[var(--input-width)] gap-2 shrink-0'>
                <div className='flex justify-between'>
                    <label htmlFor={id} className={`${disabled?' text-gray-400':'text-gray-600'} text-sm capitalize`}>{label}</label>
                    {isInvalid && (
                        <InputError message='Required'/>
                    )}
                </div>
                {disabled? (
                    <input
                        type={type}
                        id={id}
                        name={name}
                        value={value}
                        list={list}
                        disabled={true}
                        className='relative flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg'
                    />
                    ): (
                        register? (
                        <input
                            type={type}
                            id={id}
                            name={name}
                            inputMode={inputMode}
                            value={value}
                            list={list}
                            placeholder={placeholder}
                            onChange={onChange}
                            className='relative flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg' 
                            {...register(id)}
                        /> 
                        ):(
                        <input
                            type={type}
                            id={id}
                            name={name}
                            inputMode={inputMode}
                            value={value}
                            list={list}
                            placeholder={placeholder}
                            onChange={onChange}
                            className='relative flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg' 
                        /> 
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

export default Input