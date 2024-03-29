import getDatabase from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import HotKeyQueries from '@dir/queries/HotKeysQueries';
import express from 'express';

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//
router.post('/', async (req, res, next) => {
    const product = req.body.productID;
    const newHotkey = req.body.hotkey;
    const hotkey = new HotKeyQueries(getDatabase());
    hotkey.createNewHotKey(product, newHotkey).then(key => {
        res.status(200).json({ hotkey: key });
    }).catch(err => next(err));
});

//
// ------------------------- Retrieve endpoints -------------------------
//

router.get('/', async (req, res, next) => {
    const hotkey = new HotKeyQueries(getDatabase());
    hotkey.getAllHotkeys().then(key => {
        res.status(200).json({ hotkey: key });
    }).catch(err => next(err));
});

router.get('/:productID', async (req, res, next) => {
    const productID = req.params.productID;
    const hotkey = new HotKeyQueries(getDatabase());
    hotkey.getHotkeyByProduct(productID).then(key => {
        res.status(200).json({ hotkey: key });
    }).catch(err => next(err));
});

//
// ------------------------- Update endpoints -------------------------
//
router.post('/update', async (req, res, next) => {
    const productID = req.body.productID;
    const newHotkey = req.body.hotkey;
    const hotkey = new HotKeyQueries(getDatabase());
    hotkey.updateHotkey(productID, newHotkey).then(key => {
        res.status(200).json({ hotkey: key });
    }).catch(err => next(err));
});

//
// ------------------------- Delete endpoints -------------------------
//

router.post('/delete', async (req, res, next) => {
    const productID = req.body.productID;
    const hotkey = new HotKeyQueries(getDatabase());
    hotkey.deleteHotkey(productID).then(product => {
        if (product.affectedRows === 1) {
            res.status(200).json({ hotkey: 'The product has been deleted' });
        } else {
            next(new EmptySQLResultError('No entry found for ' + productID));
        }
    }).catch(err => next(err));
});

export default router;
