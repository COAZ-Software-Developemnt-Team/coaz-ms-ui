import React from 'react';
import { MdError } from 'react-icons/md';

const TextArea = ({label,id,name,value,placeholder,disabled,onChange,register,errors,width}) => {
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

    return (<div style={{'--input-width':width && width+'px'}} className={`flex flex-col ${width?'w-[var(--input-width)]':'w-full'} gap-2 shrink-0`}>
                <div className='flex justify-between'>
                    <label htmlFor={id} className={`${disabled?' text-gray-400':'text-gray-600'} text-sm capitalize`}>{label}</label>
                    {isInvalid && (
                        <InputError message='Required'/>
                    )}
                </div>
                {disabled? (
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    disabled={true}
                    rows={4}
                    className='relative flex w-full shrink-0 p-2 focus:outline-none font-thin text-sm bg-transparent border rounded-lg' 
                /> 
                ): (
                register? (
                    <textarea
                        id={id}
                        name={name}
                        value={value}
                        disabled={disabled}
                        placeholder={placeholder}
                        onChange={onChange}
                        rows={4}
                        className='relative flex w-full shrink-0 p-2 focus:outline-none font-thin text-sm bg-transparent border rounded-lg'
                        {...register(id)} 
                    /> 
                    ):(
                        <textarea
                            id={id}
                            name={name}
                            value={value}
                            disabled={disabled}
                            placeholder={placeholder}
                            onChange={onChange}
                            rows={4}
                            className='relative flex w-full shrink-0 p-2 focus:outline-none font-thin text-sm bg-transparent border rounded-lg' 
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


export default TextArea