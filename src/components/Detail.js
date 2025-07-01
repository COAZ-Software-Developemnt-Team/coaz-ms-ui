const Detail = ({label,value,capitalize}) => {
    return (
        <div className='flex flex-row w-full text-xs tracking-wider'>
            <p className='w-32 shrink-0 text-[rgba(68,71,70,.5)] font-helveticaNeueRegular'>{label}</p>
            <p className={`w-full text-[rgb(68,71,70)] font-helveticaNeueRegular ${capitalize?'capitalize':''} overflow-hidden`}>{value}</p>
        </div> 
    )
}

export default Detail