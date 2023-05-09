import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Helmet from "helmet";
import dotenv from 'dotenv';
dotenv.config();

import { indexRouter } from './routers';
import { authRouter } from './routers/authentication';

const api: Express = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

api.use(cookieParser());
api.use(Helmet());
api.use(jsonParser);
api.use(urlencodedParser);

api.disable('x-powered-by');

api.use('/', indexRouter);
api.use('/authentication', authRouter);

api.listen(3005, () => console.log("Started Running"));