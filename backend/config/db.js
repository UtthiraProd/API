const mongoose =require('mongoose')
//const connString = 'mongodb+srv://mmageshsd:GgmVgW@matrimoneycluster.njk6uqa.mongodb.net/matrimoney?retryWrites=true&w=majority'
const connString = 'mongodb+srv://mmageshsd:GgmVgW@serverlessinstance0.4ltdngl.mongodb.net/matrimoney?retryWrites=true&w=majority&appName=ServerlessInstance0'

const connectDB = async () =>{

    try{

        // const conn = await mongoose.connect(connString)
        // console.log(`MongoDB connected: ${conn.connection.host}`);

        const conn = await mongoose.connect(process.env.CONNECTION_STRING, {
            ssl: true,  // Enable SSL if required
            tlsAllowInvalidCertificates: true  // If you're using self-signed certificates
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error){
       console.log(`Error:${error.message}`)
       process.exit(1)
    }
}

module.exports = connectDB