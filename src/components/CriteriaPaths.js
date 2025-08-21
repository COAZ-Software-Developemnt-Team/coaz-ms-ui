import React, { useEffect, useState } from 'react'
import {useData} from '../data'
import CriteriaPathItem from './CriteriaPathItem2'

const CriteriaPaths = ({receivableId}) => {
    const [criteriaPaths,setCriteriaPaths] = useState([]);
    const {request} = useData();

    const load = async () => {
        request('GET','criteriapath/roots',null,{id:receivableId},false) 
        .then((response) => {
            if(response.content) {
                setCriteriaPaths(response.content)
            } else {
                setCriteriaPaths([])
            }
        })
        .catch(() => {
            setCriteriaPaths([])
        })
    }
    useEffect(() => {
        load()
    },[])

  return (
    <div className='flex flex-col w-full h-[320px]'>
        {criteriaPaths && criteriaPaths.length > 0 && criteriaPaths.map((path,i) => 
            <CriteriaPathItem key={i} criteriaPathItem={path} reload={load}/>
        )}
    </div>
  )
}

export default CriteriaPaths