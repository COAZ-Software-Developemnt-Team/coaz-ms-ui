import React,{useState} from 'react';
import { MdError } from 'react-icons/md';

const FileInput = ({label,id,name,accept,placeholder,disabled,onChange,register,errors,width}) => {

    const [invalid,setInvalid] = useState({
        value:false,
        message:''
    });
    if(errors) {
        if(errors.length > 0){
            let found = errors.find((error) => {return error.id == id});
            if(found) {
                if(invalid.value === false) {
                    invalid.value = true;
                    invalid.message = 'Required';
                }
            }
        }
    }
    
    const validate = (e) => {
        if(!e) {
            return;
        }
        let type = e.target.files[0].name.split('.').pop();
        if(accept.includes(type)) {
            setInvalid({value:false,message:''});
            onChange(e);
        } else {
            setInvalid({...invalid,value:true,message:'Invalid file'});
            e.target.value = '';
        }
    }
    return (<div style={{'--input-width':width+'px'}} className='flex flex-col w-[var(--input-width)] gap-2 shrink-0'>
                <div className='flex justify-between'>
                    <label htmlFor={id} className={`${disabled?' text-gray-400':'text-gray-600'} text-sm capitalize`}>{label}</label>
                    {invalid.value && (
                        <InputError message={invalid.message}/>
                    )}
                </div>
                {disabled? (
                    <input
                        type="file"
                        id={id}
                        name={name}
                        accept={accept}
                        disabled={true}
                        className='relative flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg'
                    />
                    ): (
                        register? (
                        <input
                            type="file"
                            id={id}
                            name={name}
                            accept={accept}
                            placeholder={placeholder}
                            onChange={(e) => {
                                e.preventDefault()
                                validate(e);
                            }}
                            className='relative flex w-full h-10 shrink-0 p-2 focus:outline-none font-thin text-sm whitespace-nowrap bg-transparent border rounded-lg' 
                            {...register(id)}
                        /> 
                        ):(
                        <input
                            type="file"
                            id={id}
                            name={name}
                            accept={accept}
                            placeholder={placeholder}
                            onChange={(e) => {
                                e.preventDefault()
                                let type = e.target.files[0].name.split('.').pop();
                                if(accept.includes(type)) {
                                    invalid.value = false;
                                    invalid.message = '';
                                    onChange(e);
                                } else {
                                    invalid.value = true;
                                    invalid.message = 'Invalid file';
                                    e.target.value = '';
                                }
                            }}
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

export default FileInput