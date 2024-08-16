const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configure the proxy middleware
app.use('/proxy', createProxyMiddleware({
    target: '', // The target URL you want to proxy requests to
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Add any custom headers if necessary
        proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
    }
}));

app.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
});
