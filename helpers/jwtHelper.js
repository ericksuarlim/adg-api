const jwt = require('jsonwebtoken');
module.exports ={
    verifyAccessToken: (req,res,next)=>{
        try {
            if(!req.headers['authorization'])return res.status(401).json({ error: 'Access denied, token required' });
            const authHeader = req.headers['authorization'];
            const bearerToken = authHeader.split(' ');
            const token = bearerToken[1];
            const verified = jwt.verify(token, 'secreto');
            req.user = verified
            next()
        } catch (error) {
            res.status(401).json({error: 'Invalid token'})
        }
    }
}