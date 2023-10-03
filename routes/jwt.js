import express from 'express';
import jwt from 'jsonwebtoken';
import connectToDB from '../dbConfig/dbGql.js';
const router = express.Router();

router.post('/', async (req, res) => {
    const user = req.body.user;
    if (!user || !user.email) {
        res.send({ error: true, message: 'must provide a valid user object containing a user email' })
    }

    const { userCollection } = await connectToDB();
    const userData = await userCollection.findOne({ email: user.email }, { projection: { _id: 1, role: 1, email: 1 } });

    if (!userData) {
        res.send({ error: true, message: 'user does not exists / internal server error' });
        return;
    }
    const userId = userData._id.toString();
    const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });
    const tokenId = jwt.sign({ userId }, process.env.JWT_SECRET2, { expiresIn: '1h' });

    res.cookie("token_ca", token, {
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    res.cookie("userId_ca", tokenId, {
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    res.send({ success: true, message: "token and tokenId cookies are sent", token, tokenId });
})


router.get('/', (req, res) => {
    console.log(req.headers, '<==>', req.cookies);
    res.send('hi there')
})

router.get('/is-username-taken/:username', async (req, res) => {
    const username = req.params.username;
    const { userCollection } = await connectToDB();
    const user = await userCollection.findOne({ username: username.toLowerCase() });
    res.send({ isUsernameTaken: Boolean(user) });
})

router.get('/is-account-exists/:email', async (req, res) => {
    const email = req.params.email;
    const { userCollection } = await connectToDB();
    const user = await userCollection.findOne({ email: email.toLowerCase() });
    res.send({ isAccountExists: Boolean(user) });
})


export default router;