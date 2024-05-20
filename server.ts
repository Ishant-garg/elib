import { config } from './config/config';
import app from './src/app'
import { db } from './config/db';

const startServer = ()=>{
    db()
    const port = config.port || 8080;

    app.listen(port , ()=>{
        console.log( `App is running on PORT : ${port}`);
    })
}

startServer();