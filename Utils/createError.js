
const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    return err;
}
// export default createError;
module.exports = createError;

// to use this function in the controller,
// next(createError(400, "something went wrong"))
