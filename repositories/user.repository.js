const Pool = require("pg").Pool;
const db = require("../config/localdatabase.config");

class UserRepository {
    constructor(){
        this.cursor = null;
        this.pool = new Pool(db);
    }

//     //Obtener Lista de Usuarios
//   async obtenerUsuarios() {
//     const usuarios = await this.pool.query("SELECT * FROM public.usuario");
//     return usuarios;
//   }

//   //Obtener Usuario
//   async obtenerUsuario(data){
//     const {id_usuario}=data.params;
//     const usuario =await this.pool.query(
//       "SELECT * FROM public.usuario WHERE id_usuario=$1",
//       [id_usuario]
//     );
//     return usuario;
//   }

//     //Crear un Usuario
//     async crearUsuario(data) {
//         const {
//             carnet,
//             nombres,
//             apellido_paterno,
//             apellido_materno,
//             celular_referencia,
//             correo_electronico,
//             id_sindicato,
//             nombre_usuario,
//             password,
//             rol,
//             habilitado
//         } = data;
//         const nuevo_usuario = await this.pool.query(
//           "INSERT INTO public.usuario(carnet, nombres, apellido_paterno, apellido_materno, celular_referencia, correo_electronico, id_sindicato, nombre_usuario, password, rol,habilitado, codigo_password ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
//           [
//             carnet,
//             nombres,
//             apellido_paterno,
//             apellido_materno,
//             celular_referencia,
//             correo_electronico,
//             id_sindicato,
//             nombre_usuario,
//             password,
//             rol,
//             habilitado,
//             0
//           ]
//         );
//         return nuevo_usuario.rows[0];
//     }

//   //Obtener Cantidad Usuarios
//   async obtenerCantidadUsuarios(){
//     const cantidad = await this.pool.query(
//       "SELECT count(*) FROM public.usuario"
//     );
//     return Number(cantidad.rows[0].count);
//   }

//   //Eliminar Usuario
//   async eliminarUsuario(id_usuario){
//     const usuarioEliminado = await this.pool.query(
//       "DELETE FROM public.usuario WHERE id_usuario=$1",
//       [id_usuario]
//     );
//     return usuarioEliminado.rows[0];
//   }

//   //Actualizar Usuario
//   async actualizarUsuario(id_usuario, data){
    
//     const{
//         carnet,
//         nombres,
//         apellido_paterno,
//         apellido_materno,
//         celular_referencia,
//         correo_electronico,
//         id_sindicato,
//         nombre_usuario,
//         rol,
//         habilitado
//     } = data;
//     const usuarioActualizado = await this.pool.query(
//       "UPDATE public.usuario SET carnet=$2, nombres=$3, apellido_paterno=$4, apellido_materno=$5, celular_referencia=$6, correo_electronico=$7, id_sindicato=$8, nombre_usuario=$9, rol=$10, habilitado=$11, codigo_password=0  WHERE id_usuario=$1 RETURNING *",
//       [
//         id_usuario,
//         carnet,
//         nombres,
//         apellido_paterno,
//         apellido_materno,
//         celular_referencia,
//         correo_electronico,
//         id_sindicato,
//         nombre_usuario,
//         rol,
//         habilitado
//       ]
//     );
//     return usuarioActualizado.rows[0]; 
//   }



//   //Set codigo
//   async setCodigo(nombre_usuario,codigo){
//     const usuarioActualizado = await this.pool.query(
//       "UPDATE public.usuario SET codigo_password=$2 WHERE nombre_usuario=$1 RETURNING *",
//       [
//         nombre_usuario,
//         codigo
//       ]
//     );
//     return usuarioActualizado.rows[0]; 
//   }

//   //Restablecer Password
//   async restablecerPassword(id_usuario,nueva_password){
//     const usuarioActualizado = await this.pool.query(
//       "UPDATE public.usuario SET password=$2, codigo_password=0 WHERE id_usuario=$1 RETURNING *",
//       [
//         id_usuario,
//         nueva_password,
//       ]
//     )
//     return usuarioActualizado.rows[0]
//   }

//   async validarUsuario(id_usuario,sindicato_usuario){
//     const resultado = await this.pool.query(
//       "SELECT EXISTS(SELECT 1 from public.usuario WHERE id_usuario = $1 and id_sindicato=$2)",[id_usuario,sindicato_usuario]
//     );
//     return resultado.rows[0].exists;
//   }

    //Manage User
    async ManageUser(id_user){
        const user_updated = await this.pool.query(
        "UPDATE public.user SET enabled= NOT enabled WHERE uuid_user=$1 RETURNING *",
        [
            id_user,
        ]
        );
        return user_updated.rows[0]; 
    }
}

module.exports = UserRepository;
