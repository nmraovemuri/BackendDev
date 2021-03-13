let now = new Date();

let config = {
    appenders: { 
        fileAppender: { 
            type: "file", 
            filename: `./logs/customers/ASM_Customer_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}.log`, 
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