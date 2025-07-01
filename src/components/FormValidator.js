import React, {useState} from 'react'

export function useFormValidator (onSubmitCallback) {
  const [errors,setErrors] = useState([]);
  const [registeredElements,setRegisteredElements] = useState([]);

  function register(id) {
    let found = registeredElements.find((elementId) => {return elementId == id});
    if(!found) {
      registeredElements.push(id);
      setRegisteredElements(registeredElements);
    } 
  }

  function handleChange(e,callback) {
    let element = document.getElementById(e.target.id);
    let found = errors.find((error) => {return error.id == element.id});
    if(element) {
      if(element.value === '' || element.value === null) {
        if(!found) {
          errors.push({id:element.id,name:element.name,error:'empty'});
          errors.sort(function(a, b){
            let x = a.id.toLowerCase();
            let y = b.id.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
          });
          setErrors(Array.from(errors));
        }
      } else {
        if(found) {
          errors.sort(function(a, b){
            let x = a.id.toLowerCase();
            let y = b.id.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
          });
          setErrors(errors.filter(error => error.id !== element.id));
        }
      } 
    }
    callback(e);
  }

  function handleSubmit() {
    setErrors([]);
    let hasEmptyField = false;

    registeredElements.forEach((elementId,index) => {
      let element = document.getElementById(elementId);
      if(element) {
        if(!element.disabled && (element.value === '' || element.value === null)) {
          errors.push({id:elementId,name:element.name,error:'empty'});
          hasEmptyField = true;
        } 
      }
    });
    errors.sort(function(a, b){
      let x = a.id.toLowerCase();
      let y = b.id.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    
    setErrors(Array.from(errors));

    if(!hasEmptyField) {
      onSubmitCallback();
    }
  }
  
  return [register,handleChange,handleSubmit,errors];
}

const FormValidator = ({children}) => {
  return (
    <>{children}</>
  )
}

export default FormValidator