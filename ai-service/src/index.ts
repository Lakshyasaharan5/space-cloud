import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { search } from './search.js'
import { consume } from './consume.js'

const app = new Hono()

app.get('/health', (c) => {
    return c.text('AI Service is up!')
})

app.get('/search', async (c) => {
    const query = c.req.query('q')
    if (!query) return c.json([]);
    const result = await search(query);
    return c.json(result);
});

serve({
    fetch: app.fetch,
    port: 3001
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})

consume()