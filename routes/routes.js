const express = require('express');
const route = express.Router();
const path = require('path');
const imgModel = require('../model/model');
let UploadModel = require('../model/imageModel');
let upload = require('../model/upload');
const fs = require('fs');
route.get('/', (req, res) => {
    imgModel.find({}, async (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            UploadModel.find({}).then((child) => {
                items.forEach(parent => {
                    parent['images'] = child.filter(subchild => {
                        if (subchild.parentId.toString() === parent._id.toString()) {
                            return true;
                        }
                    });
                });
                res.render('index', {
                    books: items
                });
            }).catch(err => {
                throw err;
            })
        }
    });
});
route.post('/addBook', upload.array('image', 5), (req, res, next) => {
    let files = req.files;
    let imgArray;
    if (files) {
        imgArray = files.map(file => {
            let img = fs.readFileSync(file.path);
            return encode_image = img.toString('base64');
        })
    }
    const obj = {
        name: req.body.name,
        desc: req.body.desc,
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            res.render('addPage')
        } else {
            let result = imgArray.map((src, index) => {
                let finalImg = {
                    filename: files[index].originalname,
                    contentType: files[index].mimetype,
                    imageBase64: src,
                    parentId: item['_id']
                }
                let newUpload = new UploadModel(finalImg);
                return newUpload
                    .save()
                    .then(() => {
                        return {
                            msg: `${files[index].originalname} Uploaded Successfully...!`
                        }
                    })
                    .catch(error => {
                        if (error) {
                            if (error.name === 'MongoError' && error.code === 11000) {
                                return Promise.reject({
                                    error: `Duplicate ${files[index].originalname}. File Already exists! `
                                });
                            }
                            return Promise.reject({
                                error: error.message || `Cannot Upload ${files[index].originalname} Something Missing!`
                            })
                        }
                    })
            });

            Promise.all(result)
                .then(msg => {
                    res.redirect('/')
                })
                .catch(err => {
                    res.json(err);
                })
        }
    });
});
route.get('/addBook', (req, res) => {
    res.render('addPage')
});
route.get('/books/:id', (req, res) => {
    console.log("body==>",req.body);
    imgModel.findById(req.params.id, (error, foundBlog) => {
        if (error) {
            res.redirect('/')
        } else {
            UploadModel.find({parentId:req.params.id}).then(childs =>{
                foundBlog['images'] = childs;
                res.render('show', {
                    book: foundBlog
                })
            }).catch(err =>{
                console.log("Error in image fetch process");
                foundBlog['images'] = [];
                res.render('show', {
                    book: foundBlog
                })
            })
        }
    })
});
route.get('/books/:id/edit', (req, res) => {
    imgModel.findById(req.params.id, (error, foundBook) => {
        if (error) {
            res.redirect('/')
        } else {
            UploadModel.find({parentId:req.params.id}).then(childs =>{
                foundBook['images'] = childs;
                res.render('edit', {
                    book: foundBook
                })
            }).catch(err =>{
                console.log("Error in image fetch process");
                foundBook['images'] = [];
                res.render('edit', {
                    book: foundBook
                })
            })
        }
    })
});

route.put('/books/:id',upload.array('image', 5), async (req, res) => {
    let files = req.files;
    console.log('files==>',files);
    let imgArray;
    if (files) {
        imgArray = files.map(file => {
            let img = fs.readFileSync(file.path);
            return encode_image = img.toString('base64');
        })
    }
    const obj = {
        name: req.body.name,
        desc: req.body.desc
    }
    imgModel.findByIdAndUpdate(req.params.id, obj, (error, updatedBlog) => {
        if (error) {
            res.redirect('/')
        } else {
            let result = imgArray.map((src, index) => {
                let finalImg = {
                    filename: files[index].originalname,
                    contentType: files[index].mimetype,
                    imageBase64: src,
                    parentId: req.params.id
                }
                let newUpload = new UploadModel(finalImg);
                return newUpload
                    .save()
                    .then(() => {
                        return {
                            msg: `${files[index].originalname} Uploaded Successfully...!`
                        }
                    })
                    .catch(error => {
                        if (error) {
                            if (error.name === 'MongoError' && error.code === 11000) {
                                return Promise.reject({
                                    error: `Duplicate ${files[index].originalname}. File Already exists! `
                                });
                            }
                            return Promise.reject({
                                error: error.message || `Cannot Upload ${files[index].originalname} Something Missing!`
                            })
                        }
                    })
            });

            Promise.all(result)
                .then(msg => {
                    res.redirect('/books/' + req.params.id)
                })
                .catch(err => {
                    res.json(err);
                })
        }
    })
});
route.delete('/books/:id', (req, res) => {
    imgModel.findByIdAndRemove(req.params.id, async (error) => {
        if (error) {
            res.redirect('/')
        } else {
            UploadModel.deleteMany({
                parentId: req.params.id
            }).then(() => {
                res.redirect('/')
            }).catch(err => {
                throw err;
            })
        }
    })
});
route.get('/uploadedImages', (req, res) => {
    UploadModel.find({}, async (err, images) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('showImages', {
                images: images
            });
        }
    });
});
route.get('/images/:id/:parentId/delete',(req,res) =>{
    UploadModel.findByIdAndRemove(req.params.id, async (error) => {
        if (error) {
            res.redirect('/')
        } else {
            UploadModel.deleteMany({
                parentId: req.params.id
            }).then(() => {
                res.redirect(`/books/${req.params.parentId}`)
            }).catch(err => {
                throw err;
            })
        }
    })
})
module.exports = route;