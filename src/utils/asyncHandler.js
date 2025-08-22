//promises method
 
const asyncHandler = (requestHandler) => {
    return (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
}





export { asyncHandler }



/*
const asynchandler = (func) => {}
const asyncHandler = (func) => () => {}
const asyncHandler = (func) => async() => {}
*/
/* try catch method
const asyncHandler = (fn) => async(req,res,next) =>{
    try{
        await fn(req,res,next)
    }catch(error){
        res,status(error.code ||500).json({
            successs: false,
            message: error.message
        })
    }
}

*/