import React, {useEffect,useState,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, useOutletContext } from 'react-router-dom';
import EditCourse from './EditCourse';
import { PiBookFill,PiPencilSimple,PiTextAlignLeft,PiTag } from 'react-icons/pi';
import AddTopic from './AddTopic';
import Scrollable from './Scrollable';
import MsHeader from './Header';
import {useData} from '../data';
import TopicItem from './TopicItem';
import Detail from './Detail';
import AddTariff from './AddTariff';
import Tariff from './Tariff';
import ContentContainer from './ContentContainer';

const Course = () => {
    const {setDialog} = useContext(GlobalContext);
    const [course,setCourse] = useState(null);
    const [topics,setTopics] = useState([]);
    const [tariffs,setTariffs] = useState([]);
    const [buttons,setButtons] = useState([]);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [loading,setLoading] = useState(false); 
    const {request} = useData();
    const {courseId} = useParams();
    const {parentPath} = useOutletContext();
    const path = useLocation().pathname;

    const onEdit = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <EditCourse id={courseId} reload={load}/>
        })
    }

    const onAddTopic = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddTopic courseId={courseId} reload={load}/>
        })
    }

    const onAddTariff = (e) => {
        e.preventDefault();
        setDialog({
            show:true,
            Component:() => <AddTariff receivableId={courseId} reload={getTariffs}/>
        })
    }

    const getCourse = async () => {
        let updateAuth = false;
        let createTariffAuth = false;
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                updateAuth = true;
                setUpdateAuthority(true);
            } 
        })

        await request('GET','hasauthority',null,{
            contextName:'TARIFF',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status === 'YES') {
                createTariffAuth = true;
            }
        })

        if(courseId) {
            await request('GET',`course/${courseId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    setCourse(response.content);
                    let btns = [];
                    if(updateAuth) {
                        btns.push(
                            {
                                Icon:PiPencilSimple,
                                name:'Edit',
                                handler:onEdit
                            }
                        );
                        btns.push(
                            {
                                Icon:PiTextAlignLeft,
                                name:'Add Topic',
                                handler:onAddTopic
                            }
                        );
                    }

                    if(response.content.tariffApplicable && updateAuth && createTariffAuth) {
                        btns.push({
                            Icon:PiTag,
                            name:'Add Tariff',
                            handler:onAddTariff
                        })
                    }
                    setButtons(btns);
                }  else {
                    setCourse(null);
                }
            })
            .catch((error) => {
                setCourse(null);
            })
        }
    }

    const getTopics = async () => {
        await request('GET',`topics/${courseId}`,null,null,true)
        .then((response) => {
            if(response.content) {
                setTopics(response.content);
            } else {
                setTopics([])
            }
        })
        .catch((error) => {
            setTopics([])
        })
    }

    const getTariffs = () => {
        if(courseId) {
            request('GET',`tariffs/${courseId}`,null,null,true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    setTariffs(response.content);
                } else {
                    setTariffs([]);
                }
            })
            .catch((error) => {
                setTariffs([]);
            })
        }
    }

    const load = async () => {
        setLoading(true);
        await getCourse();
        await getTopics();
        getTariffs();
        setLoading(false);
    }

    useEffect(() => {
        load()
    },[path])
  return (
    <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
        className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
        <ContentContainer previous={parentPath} buttons={buttons} Icon={PiBookFill} text={course && course.name} subText={course && course.professionalCategory?course.professionalCategory:''} loading={loading}>
            {course && 
                <div className='flex flex-col w-full h-auto space-y-4'>
                    <div className='flex flex-col w-full h-auto space-y-2'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                        <Detail label='External Id' value={course.externalId}/>
                        <Detail label='Points' value={course.points}/>
                    </div>
                    {topics && topics.length > 0 &&
                    <div className='flex flex-col w-full h-auto'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Topics</p>
                        {topics.map((topic,i) => <TopicItem key={i} topic={topic} reload={getTopics} updateAuthority={updateAuthority}/>)}
                    </div>
                    }
                    {tariffs && tariffs.length > 0 &&
                    <div className='flex flex-col w-full h-auto'>
                        <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Tariffs</p>
                        {tariffs.map((tariff,i) => <Tariff key={i} tariff={tariff} reload={getTariffs}/>)}
                    </div>
                    }
                </div>
            }
        </ContentContainer>
    </div>
  )
}

export default Course