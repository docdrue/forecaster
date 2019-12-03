const fallback = require('express-history-api-fallback');
const express = require('express');
const app = express();

const root = __dirname;
app.use(express.static(root));
app.use(fallback('/', { root: root }));

app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);
});