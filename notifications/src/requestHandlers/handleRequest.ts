import { Request, Response } from 'express';
import fetch from 'node-fetch-commonjs';
import createMollieClient from '@mollie/api-client';
import config from '../../config/config';
import { createAuthMiddlewareForClientCredentialsFlow } from '@commercetools/sdk-middleware-auth';
import { createHttpMiddleware } from '@commercetools/sdk-middleware-http';
import { createClient } from '@commercetools/sdk-client';
import actions from './index';
import { isOrderOrPayment } from '../utils';

const mollieApiKey = config.mollieApiKey;
const mollieClient = createMollieClient({ apiKey: mollieApiKey });

const {
  ctConfig: { projectKey, clientId, clientSecret, host, authUrl, scopes },
} = config;

const ctAuthMiddleware = createAuthMiddlewareForClientCredentialsFlow({
  host: authUrl,
  projectKey,
  credentials: {
    clientId,
    clientSecret,
  },
  scopes,
  fetch,
});

const ctHttpMiddleWare = createHttpMiddleware({
  host,
  fetch,
});

const commercetoolsClient = createClient({ middlewares: [ctAuthMiddleware, ctHttpMiddleWare] });

/**
 * FLOW TO IMPLEMENT
 * Webhook will call / with order or payment id
 * Call to mollie's API for order/payment status
 * Call to CT for Payment object to update
 * Format update actions for CT
 * Call updatePaymentByKey on CT with new status
 */

/**
 * handleRequest
 * @param req Request
 * @param res Response
 */
export default async function handleRequest(req: Request, res: Response) {
  const {
    body: { id },
    path,
  } = req;
  // Only accept '/' endpoint
  if (path !== '/') return res.sendStatus(400);

  try {
    // Receive webhook trigger from Mollie with order or payment ID
    const resourceType = isOrderOrPayment(id);
    if (resourceType === 'invalid') {
      return res.status(400).send(`ID ${id} is invalid`);
    }

    // Call to mollie's API for order/payment status
    if (resourceType === 'order') {
      const order = await actions.getOrderDetailsById(id, mollieClient);
      console.log(order.id); // To show this is working
    } else {
      const payment = await actions.getPaymentDetailsById(id, mollieClient);
      console.log(payment.id); // To show this is working
      // TODO: https://anddigitaltransformation.atlassian.net/browse/CMI-44
      return res.status(200).send('Payment flow not implemented yet');
    }

    // TODO: Parse for order & payment statuses

    // Get payment from CT -> payment key == mollie order_id
    const ctPayment = await actions.getPaymentByKey(id, commercetoolsClient, projectKey);

    // TODO: Parse CT Payment for transactions & statuses

    // TODO: should order / payment status be updated?

    // TODO: Format update actions

    // TODO: UpdatePaymentByKey on CT

    // Return ctPayment for now to demo getPaymentByKey
    res.status(200).send(ctPayment);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
}
