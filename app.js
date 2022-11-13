const {app, localhostPort} = require("./config/server.config.js");
const sequelize = require("./config/sequelize")

require("./routes/user.routes")(app);


const PORT = process.env.PORT || localhostPort;

app.listen(PORT, () => {
    console.log(`App Terminal is running on port ${PORT}.`);
    sequelize.sync({force:false}).then(()=>{
        console.log("Conected to ADG-Database");
    }).catch(error =>{
        console.log("An error has occurred", error);
    })
});