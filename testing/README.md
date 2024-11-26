# EasyImageUpload - Local Testing Instructions

This directory contains resources to help you test the EasyImageUpload module locally using a mock server.

## Table of Contents
- [Installing Dependencies](#installing-dependencies)
- [Starting the Mock Server](#starting-the-mock-server)
- [Testing the Upload and Delete API](#testing-the-upload-and-delete-api)

## Installing Dependencies

To get started, you need to install the necessary dependencies for the mock server:

1. **Ensure Node.js is installed**:

    Before running the mock server, make sure that you have Node.js installed on your machine. If it's not installed, download and install it.

    - To check if `Node.js` is installed, run the following command in your terminal or command prompt:

        ```bash
        node -v
        ```

    - If Node.js is installed, you'll see a version number like v16.13.0. If you see an error or no version number, Node.js is not installed.


2. **Navigate to the `testing/` directory**:

   ```bash
   cd testing
    ```

3. **Run the following command to install Express and Multer**:

    ```bash
    npm install
    ```

## Starting the Mock Server

Once the dependencies are installed, you can start the mock server:

    ```bash
    node mockServer.js
    ```
This will start a local server at http://localhost:3000 that simulates image upload and deletion endpoints.


## Testing the Upload and Delete API

In your main EasyImageUpload module integration, configure the API URLs to use the local mock server by adding the following to your HTML file:

```html
<script>
    // Set your local mock server URLs
    const postMediaUrl = 'http://localhost:3000/upload';  // Local mock upload URL
    const delMediaUrl = 'http://localhost:3000/delete';  // Local mock delete URL

    // Configure EasyImageUpload
    EasyImageUpload.setPostImageAPIURL(postMediaUrl);
    EasyImageUpload.setDeleteImageAPIURL(delMediaUrl);
</script>
```

You can now use the EasyImageUpload module to test image uploads and deletions using the mock server. The mock server will simulate the process without needing a live server.

If you have any issues or suggestions, please feel free to contribute or open an issue in the main repository.

