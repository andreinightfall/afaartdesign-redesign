// server.js — Backend Afa Art Design (NETOPIA + FAN + COD/Transfer)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({ origin: true }));

// Serve static frontend
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Try to load NETOPIA SDK
let NetopiaSDK = null;
try {
  NetopiaSDK = await import('netopia-card');
  console.log('[NETOPIA] SDK loaded.');
} catch (e) {
  console.warn('[NETOPIA] SDK not installed. Using fallback for /api/pay/netopia.');
}

/* ---------- FAN Courier quote ---------- */
app.post('/api/shipping/quote', async (req, res) => {
  const { courier, city, county, weight } = req.body || {};
  if (courier !== 'fan') return res.json({ courier, cost: 25.00 });

  try {
    const username  = process.env.FAN_USER     || 'clienttest';
    const clientid  = process.env.FAN_CLIENTID || '7032158';
    const user_pass = process.env.FAN_PASS     || 'testing';

    const kg = Math.max(1, Math.ceil(Number(weight || 1)));
    const params = new URLSearchParams({
      username, clientid, user_pass,
      weight: String(kg),
      service: 'standard',
      to_city: city || '',
      to_county: county || ''
    });

    const resp = await fetch('https://www.selfawb.ro/ordine_preturi_integrat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const text = await resp.text();
    const m = text.match(/(\d+(\.\d+)?)/);
    const cost = m ? parseFloat(m[1]) : 25.00;
    return res.json({ courier: 'fan', cost });
  } catch (err) {
    console.error('[FAN quote] error:', err);
    return res.status(500).json({ error: 'quote_failed' });
  }
});

/* ---------- Payments: NETOPIA ---------- */
app.post('/api/pay/netopia', async (req, res) => {
  const order = req.body || {};
  const amount = Number(order.total || 0) + Number(order.shipping || 0);

  if (!NetopiaSDK?.Netopia) {
    const fakeId = 'AFA-' + Date.now();
    return res.json({ redirect: `/order-confirmation.html?id=${encodeURIComponent(fakeId)}` });
  }

  try {
    const netopia = new NetopiaSDK.Netopia({
      apiKey: process.env.NETOPIA_API_KEY,
      sandbox: !isProd
    });

    const products = (order.items || []).map(i => ({
      name: i.name, code: i.id, price: Number(i.price || 0), vat: 0, qty: Number(i.qty || 1),
    }));

    const response = await netopia.startPayment({
      amount: amount.toFixed(2),
      currency: 'RON',
      orderId: 'AFA-' + Date.now(),
      returnUrl: process.env.NETOPIA_RETURN_URL || (process.env.BASE_URL || '') + '/order-confirmation.html',
      confirmUrl: process.env.NETOPIA_CONFIRM_URL || (process.env.BASE_URL || '') + '/api/payment/notify',
      invoice: {
        firstName: order.customer?.firstName || '',
        lastName:  order.customer?.lastName  || '',
        email:     order.customer?.email     || '',
        phone:     order.customer?.phone     || '',
        address:   order.customer?.address   || '',
        country:   'Romania',
        county:    order.customer?.county    || '',
        city:      order.customer?.city      || '',
        postalCode: order.customer?.zip || '000000',
        description: 'Comandă Afa Art Design',
        details: products
      }
    });

    if (response?.paymentURL) return res.json({ redirect: response.paymentURL });
    return res.status(400).json({ error: 'no_payment_url' });
  } catch (err) {
    console.error('[NETOPIA] startPayment failed:', err);
    return res.status(500).json({ error: 'netopia_start_failed' });
  }
});

// IPN (optional demo)
const rawBody = express.text({ type: '*/*' });
app.post('/api/payment/notify', rawBody, async (req, res) => {
  try {
    let payload;
    try { payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { payload = { raw: req.body }; }
    console.log('[NETOPIA IPN]', payload);
    return res.status(200).json({ errorCode: 0 });
  } catch (e) {
    return res.status(400).json({ errorCode: 1 });
  }
});

/* ---------- Payments: COD & Transfer ---------- */
app.post('/api/pay/cod', async (req, res) => {
  const order = req.body || {};
  const id = 'COD-' + Date.now();
  // TODO: save order with status "pending_cod"
  return res.json({ redirect: '/order-confirmation.html?id=' + encodeURIComponent(id) });
});

app.post('/api/pay/transfer', async (req, res) => {
  const order = req.body || {};
  const id = 'OP-' + Date.now();
  // TODO: save order with status "pending_transfer"
  // Optionally, email buyer with bank details.
  return res.json({ redirect: '/order-confirmation.html?id=' + encodeURIComponent(id) });
});

// API 404
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
