const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
// Use express.json() to parse JSON payloads
app.use(express.json({ limit: '10mb' }));

// Ensure the "uploads" folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// POST endpoint to receive the image data (Base64)
app.post('/upload', (req, res) => {
    const { image } = req.body; // Destructure the image from the body

    if (!image) {
        return res.status(400).json({
            status: false,
            msg: 'No image data received.',
        });
    }

    // Base64 image processing
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

    if (!matches) {
        return res.status(400).json({
            status: false,
            msg: 'Invalid image data format.',
        });
    }

    const imageType = matches[1]; // e.g., png, jpeg
    const base64Data = matches[2]; // Base64-encoded string

    // Generate a filename for the image (using timestamp)
    const imageFilename = Date.now() + '.' + imageType;
    const imagePath = path.join(uploadDir, imageFilename);

    // Convert the base64 string to a buffer and save it to a file
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFile(imagePath, buffer, (err) => {
        if (err) {
            return res.status(500).json({
                status: false,
                msg: 'Error saving the image.',
            });
        }

        const imageURL = `http://localhost:3000/uploads/${imageFilename}`;
        const imageID = imageFilename.split('.')[0];

        res.setHeader('Content-Type', 'application/json');
        res.json({
            status: true,
            image_url: imageURL,
            image_id: imageID,
            msg: 'Upload successful',
        });
    });
});

// GET endpoint to retrieve an image by its ID
app.get('/uploads/:id', (req, res) => {
    const imageID = req.params.id;
    const imagePath = path.join(uploadDir, `${imageID}`); // Assuming filename matches the ID

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({
                status: false,
                msg: `Image with ID ${imageID} not found.`,
            });
        }

        res.sendFile(imagePath);  // Send the image as a response
    });
});

// DELETE endpoint to delete an image by its ID
app.post('/delete', (req, res) => {
    const image = req.body
    const imageID = image.image_id;
    const imagePath = path.join(uploadDir, imageID);

    console.log(imagePath);

    fs.unlink(imagePath, (err) => {
        if (err) {
            return res.status(500).json({
                status: false,
                msg: `Error deleting image with ID ${imageID}`,
            });
        }

        res.json({
            status: true,
            msg: `Image with ID ${imageID} deleted successfully.`,
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
