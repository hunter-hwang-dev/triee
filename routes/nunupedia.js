const router = require('express').Router()

router.get('/nunupedia/hello', (req, res) => {
    res.send('안녕 반가워')
})

router.get('/nunupedia/bye', (req, res) => {
    res.send('안녕 잘가')
})

module.exports = router