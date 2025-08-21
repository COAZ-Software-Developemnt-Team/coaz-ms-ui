import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams, Outlet } from 'react-router-dom';
import {PiGraduationCap,PiGraduationCapFill,PiGraduationCapLight, PiStudent,PiStudentLight,PiTrash,PiDotsThreeVertical,PiTag, PiStudentFill, PiUserPlus, PiUserMinus } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import Scrollable from './Scrollable';
import AddProgram from './AddProgram';
import MessageDialog from './MessageDialog';
import PaymentOptions from './PaymentOptions';
import {useData} from '../data';
import ContentContainer from './ContentContainer';

const Enrollments = () => {
    const {setDialog} = useContext(GlobalContext);
    const [enrolledPrograms,setEnrolledPrograms] = useState([]);
    const [availablePrograms,setAvailablePrograms] = useState([]);
    const {request} = useData();
    const [loading,setLoading] = useState()
    const {currentUserId,programId} = useParams();
    const path = useLocation().pathname;

    const getEnrolledPrograms = async () => {
        await request('GET','enrollments/my',null,null,true)
        .then((response) => {
            if(response.content) {
                setEnrolledPrograms(response.content);
            } else {
                console.log(response)
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const getAvailablePrograms = async () => {        
        await request('GET','enrollments/available',null,null,true)
        .then((response) => {
            if(response.content) {
                setAvailablePrograms(response.content);
            } else {
                console.log(response)
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const load = async () => {
        setLoading(true);
        await getEnrolledPrograms();
        await getAvailablePrograms();
        setLoading(false);
    }

    useEffect(() => {
        load();
    },[path])
  return (
    <>{programId?
        <Outlet/>:
        <ContentContainer previous={`/${currentUserId}/home`} Icon={PiStudentFill} text='Enrollments' loading={loading}>
            <div className='flex flex-col w-full h-auto space-y-4'>
                {enrolledPrograms && enrolledPrograms.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Enrolled Programs
                    </p>
                    {enrolledPrograms.map((enrollment,i) => <EnrollmentItem key={i} enrollment={enrollment} reload={load} setLoading={setLoading}/>)}
                </div>
                }
                {availablePrograms && availablePrograms.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>
                        Available Programs
                    </p>
                    {availablePrograms.map((enrollment,i) => <EnrollmentItem key={i} enrollment={enrollment} reload={load} setLoading={setLoading}/>)}
                </div>
                }
            </div>
        </ContentContainer>
    }
    </>
  )
}

export default Enrollments

const EnrollmentItem = ({enrollment,reload,setLoading}) => {
    const {setDialog,screenSize,setAccess} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const {currentUserId} = useParams();
    const path = useLocation().pathname;
    const {request} = useData();

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        if(enrollment.program && enrollment.student) {
            navigate(`/${currentUserId}/enrollments/enrollment/${enrollment.program.id}`,{state:{parentPath:path}});
        } else if(enrollment.program) {
            navigate(`/${currentUserId}/enrollments/${enrollment.program.id}`,{state:{parentPath:path}})
        }
    }

    const onEnroll = async (e) => {
        e.preventDefault();
        if(enrollment.program) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Enroll' 
                        message={`Are you sure you want to enroll in ${enrollment.program.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('POST','enrollment',null,{
                                programId:enrollment.program.id
                            },true)
                            .then((response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                                    if(!response.content.paid && response.content.tariff && response.content.tariff.receivableId && response.content.tariff.criteriaId) {
                                        navigate(`/payment_options/${currentUserId}/${response.content.tariff.receivableId}/${response.content.tariff.criteriaId}`,{state:{parentPath:path}})
                                        /* setAccess({Component:() => <PaymentOptions user={response.content.student} tariff={response.content.tariff}  reload={reload}/>}); */
                                    } 
                                    reload && reload()
                                } else if(response.message) {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response.message} 
                                            />
                                    })
                                } else {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response} 
                                            />
                                    })
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                            setLoading(false);
                        }}
                    />
            })
        }
    }
    
    const onUnenroll = async (e) => {
        if(enrollment.program && enrollment.student) {
            e.preventDefault();
        if(enrollment.program) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Unenroll' 
                        message={`Are you sure you want to unenroll from ${enrollment.program.name}?`} 
                        onYes={async (e) => {
                            setLoading(true);
                            await request('DELETE','enrollment',null,{
                                programId:enrollment.program.id
                            },true)
                            .then((response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.message) {
                                    reload && reload()
                                } else if(response.message) {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response.message} 
                                            />
                                    })
                                } else {
                                    setDialog({
                                        show:true,
                                        Component:() => 
                                            <MessageDialog 
                                                title='Message' 
                                                message={response} 
                                            />
                                    })
                                }
                            })
                            setLoading(false);
                        }}
                    />
                })
            }
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {enrollment && enrollment.program &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between hover:bg-[rgba(0,0,0,.04)] rounded-md overflow-hidden'>
                <div onClick={onOpen}
                    className='flex flex-row w-full items-center space-x-2 cursor-pointer overflow-hidden'>
                    {enrollment.student?
                        <PiStudentLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <PiGraduationCapLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    }
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular break-words overflow-hidden overflow-ellipsis capitalize`}>
                            {`${enrollment.program.name}`}
                        </p>
                        {enrollment.student?
                            enrollment.paid?
                            <p className={`text-xs ${enrollment.completionPercentage < 100?'text-[rgb(145,145,145)]':'text-green-600'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                {`${enrollment.completionPercentage}% Complete`}
                            </p>:
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{`K ${USDecimal.format(enrollment.tariff && enrollment.tariff.price?enrollment.tariff.price:0)}`}</p>
                            </div>
                            :
                        enrollment.program.tariffApplicable? 
                            <div className='flex flex-row w-full h-fit space-x-2 text-xs items-center text-[rgb(145,145,145)] font-helveticaNeueRegular'>
                                <PiTag size={16}/>
                                <p>{`K ${USDecimal.format(enrollment.tariff && enrollment.tariff.price?enrollment.tariff.price:0)}`}</p>
                            </div>
                            :
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular'>Free</p>
                        }
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0 overflow-hidden'>
                    {((highlighted || screenSize === 'xs') && enrollment.student)? 
                        <button onClick={onUnenroll}
                            className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-red-500 rounded-full'>
                            <PiUserMinus size={20} />
                        </button>
                        :
                        highlighted || screenSize === 'xs'? 
                        <button onClick={onEnroll}
                            className='flex w-10 h-10 items-center justify-center shrink-0 text-[rgb(68,71,70)] hover:bg-[rgba(0,0,0,.06)] hover:text-[rgb(0,175,240)] rounded-full'>
                            <PiUserPlus size={20} />
                        </button>
                        :
                        <></>
                    }
                </div>
            </div>}
        </div>
    )
}