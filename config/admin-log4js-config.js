let now = new Date();

let config = {
    appenders: { 
        fileAppender: { 
            type: "dateFile", 
            filename: `../logs/customers/ASM_Admin.log`, 
            pattern: "_yyyy-MM-dd-hh-mm-ss",
            keepFileExt: true, 
            layout: { 
                type: "pattern", 
                pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %f{2}: %l - %m" 
            }
        },
        consoleAppender: { 
            type: "console", 
            layout: { 
                type: "pattern", 
                pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %f{2}: %l - %m" 
            } 
        }   
    },
    categories: { 
        default: { 
            appenders: process.env.NODE_ENV === "production"? ["fileAppender"] : ["fileAppender", "consoleAppender"],  
            level: "info",
            enableCallStack: true 
        }
    }
}

module.exports = config;