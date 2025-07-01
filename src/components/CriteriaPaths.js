import React, { useEffect, useState } from 'react'
import FormDialog from './FormDialog'
import Input from './Input'
import { request } from '../App'
import CriteriaPathItem from './CriteriaPathItem2'

const CriteriaPaths = ({receivableId}) => {
    const [criteriaPaths,setCriteriaPaths] = useState([])

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