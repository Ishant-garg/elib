import { config } from './config/config';
import app from './src/app'


const startServer = ()=>{
    const port = config.port || 8080;

    app.listen(port , ()=>{
        console.log( `App is running on PORT : ${port}`);
    })
}

startServer();