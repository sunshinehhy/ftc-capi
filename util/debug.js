const debug = require('debug');
module.exports = function(namespace){
    const error = debug(namespace);
    const info = debug(namespace);
    info.log = console.log.bind(console);  //这样log绑定到console上
    return {
        info,
        error
    };
}