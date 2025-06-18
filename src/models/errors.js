export const emptyError = (val)=> `${val} cannot be empty`;
export const requiredError = (val)=> `${val} is required`;
export const minCharError = (val , min) => `${val} must atleast have ${min} charcater`;
export const maxCharError = ( val , max ) => `${val} cannot exceed ${max} characters`;
export const minEleError = ( val , min ) => `${val} must atleast have ${min} elements`;
export const urlError = (val) => `Invalid URL in ${val}`;
export const enumError = (val , enums)=>{
    enums = Array.isArray(enums) ? enums : [enums] ;

    if (enums.length === 1) {
        return `${val} must be '${enums[0]}'`;
    }

    const quoted = enums.map(e => `'${e}'`);
    const last = quoted.pop();
    const formatted = `${quoted.join(', ')} or ${last}`;

    return `${val} must be either ${formatted}`;
}