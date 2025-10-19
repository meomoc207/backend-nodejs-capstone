/* jshint esversion: 8 */
const express = require('express')
const multer = require('multer')
const router = express.Router()
const connectToDatabase = require('../models/db')
const logger = require('../logger')

// Define the upload directory path
const directoryPath = 'public/images'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath) // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Use the original file name
  }
})

const upload = multer({ storage: storage })

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
  logger.info('/ GET called')
  try {
    // Step 2: task 1 - insert code here
    const db = await connectToDatabase()
    // Step 2: task 2 - insert code here
    const collection = db.collection('secondChanceItems')

    // Step 2: task 3 - insert code here
    const secondChanceItems = await collection.find({}).toArray()

    // Step 2: task 4 - insert code here
    res.json(secondChanceItems)
  } catch (e) {
    logger.console.error('oops something went wrong', e)
    next(e)
  }
})

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
  logger.info('/ POST called')
  try {
    // Step 3: task 1 - insert code here
    const db = await connectToDatabase()
    // Step 3: task 2 - insert code here
    const collection = db.collection('secondChanceItems')
    // Step 3: task 3 - insert code here
    let secondChanceItem = req.body
    // Step 3: task 4 - insert code here
    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1)
    await lastItemQuery.forEach((item) => {
      secondChanceItem.id = (parseInt(item.id) + 1).toString()
    })
    // Step 3: task 5 - insert code here
    const dateAdded = Math.floor(new Date().getTime() / 1000)
    secondChanceItem.date_added = dateAdded

    secondChanceItem = await collection.insertOne(secondChanceItem)

    res.status(201).json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
  logger.info('/:id GET called')
  try {
    // Step 4: task 1 - insert code here
    const db = await connectToDatabase()
    // Step 4: task 2 - insert code here
    const collection = db.collection('secondChanceItems')
    // Step 4: task 3 - insert code here
    const secondChanceItem = await collection.findOne({ id: req.params.id })
    // Step 4: task 4 - insert code here
    if (!secondChanceItem) {
      logger.error(`Item id:${req.params.id} not found`)
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Update and existing item
router.put('/:id', async (req, res, next) => {
  logger.info('/:id PUT called')
  try {
    // Step 5: task 1 - insert code here
    const db = await connectToDatabase()
    // Step 5: task 2 - insert code here
    const collection = db.collection('secondChanceItems')
    // Step 5: task 3 - insert code here
    const id = req.params.id
    const secondChanceItem = await collection.findOne({ id })
    if (!secondChanceItem) {
      logger.error(`Item id:${id} not found`)
      res.status(404).json({ error: 'Item not found' })
    }
    // Step 5: task 4 - insert code here
    secondChanceItem.category = req.body.category
    secondChanceItem.condition = req.body.condition
    secondChanceItem.age_days = req.body.age_days
    secondChanceItem.description = req.body.description
    secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1))
    secondChanceItem.updatedAt = new Date()

    const updatepreloveItem = await collection.findOneAndUpdate({ id }, { $set: secondChanceItem }, { returnDocument: 'after' })
    // Step 5: task 5 - insert code here
    if (updatepreloveItem) {
      res.json({ uploaded: 'success' })
    } else {
      res.json({ uploaded: 'failed' })
    }
  } catch (e) {
    next(e)
  }
})

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
  logger.info('/:id DELETE called')
  try {
    // Step 6: task 1 - insert code here
    const db = await connectToDatabase()
    // Step 6: task 2 - insert code here
    const collection = db.collection('secondChanceItems')
    // Step 6: task 3 - insert code here
    const secondChanceItem = await collection.findOne({ id: req.params.id })
    if (!secondChanceItem) {
      logger.error(`Item id:${req.params.id} not found`)
      return res.status(404).json({ error: 'Item not found' })
    }
    // Step 6: task 4 - insert code here
    await collection.deleteOne(secondChanceItem)
    res.json({ deleted: 'success' })
  } catch (e) {
    next(e)
  }
})

module.exports = router
