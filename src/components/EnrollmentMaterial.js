import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import { PiTarget , PiFileTextFill, PiTargetLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import ContentContainer from './ContentContainer';
import Detail from './Detail';
import {useData} from '../data';
import EnrollmentAttemptItem from './EnrollmentAttemptItem';

const EnrollmentMaterial = () => {
    const {setDialog} = useContext(GlobalContext);
    const [enrollmentMaterial,setEnrollmentMaterial] = useState(null);
    const [buttons,setButtons] = useState([]);
    const [loading,setLoading] = useState();
    const [attempts,setAttempts] = useState(0);
    const [attempted,setAttempted] = useState(0);
    const [passGrade,setPassGrade] = useState(0);
    const [highestGrade,setHighestGrade] = useState(0);
    const {currentUserId,programId,studentId,courseId,teacherId,topicId,activityId,attemptId} = useParams();
    const [parentPath,setParentPath] = useState(null);
    const location = useLocation();
    const state = location.state;
    const path = useLocation().pathname;
    const {request} = useData();
    const navigate = useNavigate();

    const onAttempt = async (e) => {
        e.preventDefault();
        if(activityId) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Attempt Quiz' 
                        message='Are you sure you want to attempt this activity?'
                        onYes={async (e) => {
                            setDialog(null);
                            await request('POST','attempt',null,{
                                activityId:activityId
                            },true)
                            .then( async (response) => {
                                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                                    navigate(`${path}/${response.content.id}`,{state:{parentPath:path}})
                                } 
                            })
                        }}
                    />
            })
        }
    }

    const getEnrollmentMaterial = async () => {
        setLoading(true);
        if(activityId) {
            await request('GET','enrollment/material',null,{
                materialId:activityId
            },true)
            .then((response) => {
                if(response.content) {
                    setEnrollmentMaterial(response.content);
                    if(response.content.material && response.content.material.courseTeacher) {
                        request('GET','courseteacher/access',null,{
                            courseId:response.content.material.courseTeacher.courseId,
                            teacherId:response.content.material.courseTeacher.teacherId
                        },true)
                        .then((accessResponse) => {
                            if(accessResponse.content && accessResponse.content === 'STUDENT') {
                                if(response.content.material && response.content.material.classname.toLowerCase() == 'quiz') {
                                    setAttempts(response.content.material.attempts);
                                    setAttempted(response.content.enrollmentAttempts.length);
                                    setPassGrade(response.content.material.passGrade);
                                    let highest = 0;
                                    for(let attempt of response.content.enrollmentAttempts) {
                                        if(attempt.grade > highest) {
                                            highest = attempt.grade;
                                        }
                                    }
                                    setHighestGrade(highest);
                                    if(response.content.enrollmentAttempts.length < response.content.material.attempts) {
                                        setButtons([{
                                            Icon:PiTarget,
                                            name:'Attempt',
                                            handler:onAttempt
                                        }])
                                    }
                                }
                            }
                        })
                    }
                }  else {
                  setEnrollmentMaterial(null);
                }
            })
            .catch((error) => {
                setEnrollmentMaterial(null);
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        if((!programId || !courseId || !teacherId || !topicId || !activityId || !attemptId) && state && state.parentPath) {
            setParentPath(state.parentPath);
        }
        getEnrollmentMaterial();
    },[path])

  return (
    <>{programId && courseId && teacherId && topicId && activityId && attemptId?
        <Outlet/>
        :
        <ContentContainer previous={parentPath?parentPath:currentUserId?`/${currentUserId}/home`:'/home'} 
            buttons={buttons} 
            Icon={PiFileTextFill} 
            text={enrollmentMaterial && enrollmentMaterial.material?enrollmentMaterial.material.name:''} 
            loading={loading}>
            {enrollmentMaterial &&
            <div className='flex flex-col w-full h-auto space-y-4'>
                <div className='flex flex-col w-full h-auto space-y-2 text-xs tracking-wider'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular  text-[rgba(0,175,240,.5)] uppercase'>Details</p>
                    <Detail label='Maximum Attempts' value={attempts}/>
                    <Detail label='Attempts' value={attempted}/>
                    <Detail label='Pass Grade' value={`${passGrade}%`}/>
                    <Detail label='Highest Grade' value={`${highestGrade}%`}/>
                </div>
                {enrollmentMaterial.enrollmentAttempts && enrollmentMaterial.enrollmentAttempts.length > 0 &&
                <div className='flex flex-col w-full h-auto space-y-2'>
                    <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Attempts</p>
                    {enrollmentMaterial.enrollmentAttempts.map((enrollmentAttempt,i) => <EnrollmentAttemptItem key={i} enrollmentAttempt={enrollmentAttempt} reload={getEnrollmentMaterial}/>)}
                </div>
                }
            </div>}
        </ContentContainer>
    }
    </>
  )
}

export default EnrollmentMaterial