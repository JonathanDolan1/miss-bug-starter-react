import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

app.use(cookieParser())
app.use(express.static('public'))

// app.get('/', (req, res) => res.send('Hello there'))

app.get('/api/bug', (req, res) => {

    // const filterBy = {
    //     txt: req.query.txt,
    //     minSpeed: +req.query.minSpeed
    // }

    const filterBy = {}
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: +req.query.createdAt
    }

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug', err)
        })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => `Bug ${bugId} removed`)
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug', err)
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    let visitedBugsIds = []
    if (req.cookies.visitedBugsIds) visitedBugsIds = JSON.parse(req.cookies.visitedBugsIds)
    const { bugId } = req.params
    if (!visitedBugsIds.includes(bugId)) visitedBugsIds.push(bugId)
    if (visitedBugsIds.length > 3) return res.status(401).send('Wait for a bit')
    res.cookie('visitedBugsIds', JSON.stringify(visitedBugsIds), { maxAge: 7 * 1000 })
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})



const port = 3030
app.listen(port, () => console.log(`Server ready at port ${port}`))