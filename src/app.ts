import express from 'express';
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;

// const { app, localhostPort} = require("./config/server.config.js");
// const sequelize = require("./src/database/config/sequelize")
//
// require("./routes/user.routes")(app);
// require("./routes/authentication.routes")(app);
// require("./routes/general.routes")(app);
// require("./routes/attendance.routes")(app);
//
//
// const PORT = process.env.PORT || localhostPort;
//
// app.listen(PORT, () => {
//     console.log(`App Admigan is running on port ${PORT}.`);
//     sequelize.sync({force:false}).then(()=>{
//         console.log("Conected to Admigan-Database");
//     }).catch(error =>{
//         console.log("An error has occurred", error);
//     })
// });