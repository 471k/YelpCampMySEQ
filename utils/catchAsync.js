/**
 * Exports a middleware function that takes another function as a parameter.
 * When the middleware is called, it executes the wrapped function and catches any errors,
 * passing them to the next error handling middleware in the chain.
 */
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
