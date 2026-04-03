import express from 'express';
/* DESC: Import dotenv, this will inject environment variables
 * without file specific imports 
 * TODO: Remove any dotenv imports from other files, if you notice any
 */
import 'dotenv/config';

import authRouter from './modules/auth/auth.routes';
import webhookRouter from './modules/webhook/webhook.routes';
import { errorHandler } from './middlewares/global.errorHandler';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/webhook', webhookRouter);

app.get('/health', (req, res) => {
    res.status(200).send('Alive');
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`backend running on http://localhost:${PORT}`);
	console.log('ready for React Native to connect gmail');
});
