"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const down = process.env.DOWN === 'true';
const mode = process.env.MODE;
const app = (0, express_1.default)();
const pool = new pg_1.Pool({
    connectionString: process.env.DB_CONNECTION
});
const port = process.env.PORT || 3000;
if (!down) {
    const corsOptions = {
        origin: mode === 'development' ? 'https://localhost:5173' : '',
        credentials: true,
        methods: 'GET, POST, PUT, DELETE'
    };
    app.set('trust proxy', 1);
    app.use((0, cors_1.default)(corsOptions));
    app.options('*', (0, cors_1.default)(corsOptions));
    app.use(body_parser_1.default.urlencoded({
        extended: true
    }));
    app.use(body_parser_1.default.json());
    app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
    app.get('/api/records', async (req, res) => {
        try {
            const records = [];
            const recordsQuery = await pool.query(`SELECT id, value FROM records`);
            for (let index = 0; index < recordsQuery.rows.length; index += 1) {
                const record = recordsQuery.rows[index];
                records.push({
                    ...record.value,
                    key: record.id,
                    id: record.id
                });
            }
            res.json(records);
        }
        catch (error) {
            res.status(500).send('Internal server error.');
        }
    });
    app.get('/api/record/:id', async (req, res) => {
        try {
            const recordId = req.params.id;
            const recordQuery = await pool.query(`SELECT id, value FROM records WHERE id = $1`, [recordId]);
            if (recordQuery.rowCount === 0) {
                res.status(404).send('Order not found.');
            }
            else {
                const record = recordQuery.rows[0];
                res.json({
                    ...record.value,
                    id: record.id
                });
            }
        }
        catch (error) {
            res.status(500).send('Internal server error.');
        }
    });
    app.delete('/api/record/:id', async (req, res) => {
        try {
            const recordId = req.params.id;
            // delete items
            await pool.query('DELETE FROM records WHERE id = $1', [recordId]);
            res.status(209).send('Deleted order.');
        }
        catch (error) {
            res.status(500).send('Internal server error');
        }
    });
    app.put('/api/record/:id', async (req, res) => {
        const recordId = req.params.id;
        const recordQuery = await pool.query(`SELECT id FROM records WHERE id = $1`, [recordId]);
        if (recordQuery.rowCount === 0) {
            res.status(404).send('Order not found.');
        }
        else {
            const newValue = req.body;
            // first we deal with the customer
            await pool.query(`UPDATE records SET value = $1
         WHERE id = $2`, [newValue, recordId]);
            res.status(201).send();
        }
    });
    app.post('/api/record', async (req, res) => {
        try {
            const record = req.body;
            // first we deal with the customer
            await pool.query('INSERT INTO records (value) VALUES ($1) RETURNING id', [
                record
            ]);
            res.status(201).send();
        }
        catch (error) {
            res.status(500).send('Internal server error.');
        }
    });
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../client/dist/index.html'));
    });
}
else {
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, './down.html'));
    });
}
app.listen(port, () => {
    console.log(`[server]: Server is running at port ${port}`);
});
