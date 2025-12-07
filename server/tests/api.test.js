import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

/**
 * Integration tests for HTTP API endpoints
 */

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

describe('API Endpoints', () => {
  test('GET /health should return ok status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /health response should have correct content type', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });

  test('GET /nonexistent should return 404', async () => {
    await request(app)
      .get('/nonexistent')
      .expect(404);
  });
});
