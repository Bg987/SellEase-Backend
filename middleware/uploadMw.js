const formidable1 = require("formidable");

const uploadMiddleware = (req, res, next) => {
    const form = formidable1({
        multiples: true,  // Allow multiple file uploads
        keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({ error: "File upload failed" });
        }
        req.fields = fields;
        req.files = files;
        next();
    });
};

module.exports = uploadMiddleware;
