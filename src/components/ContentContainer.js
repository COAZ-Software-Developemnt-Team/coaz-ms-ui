import React from 'react'
import Scrollable from './Scrollable';
import MsHeader from './Header';
import LoadingIcons from 'react-loading-icons'

const ContentContainer = ({previous,buttons,Icon,text,subText,children,loading}) => {
    
  return (
        <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
            className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
            <MsHeader previous={previous} buttons={buttons} Icon={Icon} text={text} subText={subText} loading={loading}/>
            <div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
                {loading?
                    <div className='flex w-full h-full items-center justify-center text-[rgb(0,175,240)]'>
                        <LoadingIcons.ThreeDots width={32} height={64} fill="rgb(0,175,240)"/>
                    </div>:
                    <Scrollable vertical={true}>
                        {children}
                    </Scrollable>
                }
            </div>
        </div>
  )
}

export default ContentContainer