const ImageUploadModule = (() => {

    let imageUploadModal;
    let imageSeclectModal;
    let currSelectedBtn;

    let deleteImageAPIURL;
    let postImageAPIURL;
    let deleteImageHeaders;
    let postImageHeaders;


    function showToast(message) {
        var toast = new bootstrap.Toast(document.getElementById("liveToast"));
        var toastBody = document.querySelector("#liveToast .toast-body");
        toastBody.textContent = message;
        toast.show();
    }


    function createImageContainer(image_url) {
        const imageDivElement = document.createElement('div');
        imageDivElement.classList.add('user-image', 'mx-2', 'my-2', 'd-flex', 'justify-content-center', 'align-items-center', 'flex-column');
        imageDivElement.style.position = 'relative';
        const imgElement = document.createElement('img');
        imgElement.src = image_url;
        imgElement.setAttribute('onclick', 'ImageUploadModule.imageEdit(this)');
        imgElement.alt = '';
        imageDivElement.appendChild(imgElement);

        return imageDivElement;
    }

    function openUploadImageModal(clickedBtn) {

        currSelectedBtn = clickedBtn;
        imageUploadModal = new bootstrap.Modal(document.getElementById('imageUploadModal'), {
            'responsive': true,
            'centered': true
        });
        imageUploadModal.show();

    }

    function sniffImageUpload() {
        let fileInput = document.getElementById('imageInput');
        let imageUploadIcon = document.querySelector('.upload-box');
        imageUploadIcon.onclick = function () {
            fileInput.click();
        }

        fileInput.addEventListener("change", handleImage)
    }


    function handleImage() {


        let fileInput = document.getElementById('imageInput');

        if (fileInput.files.length === 0) {
            showToast('Please select an image file.');
            return;
        }

        let file = fileInput.files[0];
        const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedFormats.includes(file.type)) {
            showToast('Please select a valid PNG, JPG, or JPEG image file.');
            return;
        }


        const reader = new FileReader();

        reader.addEventListener('load', function () {

            let modalImageContainer = document.querySelector('.image-container');
            let imageDivElement = createImageContainer(reader.result);
            let imageFirstChild = document.querySelector('.upload-box');
            modalImageContainer.insertBefore(imageDivElement, imageFirstChild.nextSibling);
            uploadImage(imageDivElement);
        });

        reader.readAsDataURL(file);

    }


    function createImagePreviewCard(src, imageID, uploadDate) {

        const containerDiv = document.createElement("div");
        containerDiv.className = "container d-flex flex-wrap flex-column justify-content-center";

        // Create the div for the image with class and img settings
        const prevImgDiv = document.createElement("div");
        prevImgDiv.className = "prev-img";
        prevImgDiv.id = `prev-img-${imageID}`;
        const image = document.createElement("img");
        image.src = src;
        image.alt = "";
        prevImgDiv.appendChild(image);

        // Create the div for the image info with class
        const prevImgInfoDiv = document.createElement("div");
        prevImgInfoDiv.className = "prev-img-info w-100";

        // Create the date info div with class and content
        const dateDiv = document.createElement("div");
        dateDiv.className = "d-flex mt-3";
        const dateLabel = document.createElement("label");
        dateLabel.innerText = "Upload: ";
        const dateInfoDiv = document.createElement("div");
        dateInfoDiv.id = "prev-img-dt";
        dateInfoDiv.className = "mx-2";
        dateInfoDiv.innerText = uploadDate;
        dateDiv.appendChild(dateLabel);
        dateDiv.appendChild(dateInfoDiv);

        // Create the image URL info div with class and content
        const urlDiv = document.createElement("div");
        urlDiv.className = "d-flex my-2 justify-content-start";
        const urlLabel = document.createElement("label");
        urlLabel.innerText = "Image URL: ";
        const urlLinkDiv = document.createElement("div");
        urlLinkDiv.className = "pre-img-url mx-2";
        const urlLink = document.createElement("a");
        urlLink.href = src;
        urlLink.innerText = src;
        urlLink.setAttribute('target', 'blank_');
        urlLinkDiv.appendChild(urlLink);
        urlDiv.appendChild(urlLabel);
        urlDiv.appendChild(urlLinkDiv);

        // Append all created elements to the main container div
        prevImgInfoDiv.appendChild(dateDiv);
        prevImgInfoDiv.appendChild(urlDiv);
        containerDiv.appendChild(prevImgDiv);
        containerDiv.appendChild(prevImgInfoDiv);

        return containerDiv;

    };


    function imageEdit(imageElem) {

        const imageURL = imageElem.src;
        const imageID = imageElem.id;

        const uploadDate = 'May 18, 2020';

        const prevImageCard = createImagePreviewCard(imageURL, imageID, uploadDate)

        const imageEditModalBody = document.querySelector('#imageSeclectModal .modal-body');
        imageEditModalBody.innerHTML = '';
        imageEditModalBody.appendChild(prevImageCard);

        const imageDelBtn = document.querySelectorAll('#imageSeclectModal .modal-footer button')[0];
        imageDelBtn.id = imageID.slice(2)
        imageDelBtn.onclick = deleteImage;

        const imageInsertBtn = document.querySelectorAll('#imageSeclectModal .modal-footer button')[1];
        imageInsertBtn.onclick = insertImage;


        imageSeclectModal = new bootstrap.Modal(document.getElementById('imageSeclectModal'), {
            'responsive': true,
            'centered': true
        });
        imageSeclectModal.show();

    }


    function closeImageEditModal() {
        if (imageSeclectModal) {
            imageSeclectModal.hide();
        }
    }


    function loadPreloader(imageDivElement) {
        // preloader
        let loaderDiv = document.createElement('div');
        loaderDiv.classList.add('loader');
        loaderDiv.style.zIndex = 2;
        imageDivElement.appendChild(loaderDiv);


        let overlayDiv = document.createElement('div');
        overlayDiv.classList.add('uploading-image-overlay');
        overlayDiv.style.borderRadius = '10px';
        imageDivElement.appendChild(overlayDiv);
    }


    function removePreloader() {
        let loaderDiv = document.querySelector('.loader');
        let overlayDiv = document.querySelector('.uploading-image-overlay');
        loaderDiv.remove();
        overlayDiv.remove();
    }


    function uploadImage(imageDivElement) {
        let previewImage = imageDivElement.querySelector('img');

        loadPreloader(imageDivElement);

        const templateId = '001';
        const imageData = {
            image: previewImage.src, // Base64-encoded image data
            template_id: templateId, // Replace previewTemplateId with the actual template ID
        };

        if (!postImageAPIURL) {
            const errorMessage = 'Post Image API URL is not provided!';
            showToast(errorMessage);
            imageDivElement.remove();
            return;
        }
        
        const fetchOptions = {
            method: 'POST',
            headers:postImageHeaders,
            body: JSON.stringify(imageData),
        };

        const uploadUrl = postImageAPIURL;

        fetch(uploadUrl, fetchOptions)
            .then(response => {

                removePreloader();

                if (!response.ok) {
                    return response.json().then(data => {
                        const errorMessage = data.error || 'Request failed';
                        throw { message: errorMessage, response: data };
                    });
                }
                return response.json();
            }).then(responseJson => {
                // The uploaded image URL will be available in data.secure_url
                if (responseJson['status']) {
                    const imageUrl = responseJson.image_url;
                    const imageID = responseJson.image_id;
                    previewImage.src = imageUrl;
                    previewImage.id = `m-${imageID}`
                    showToast(responseJson.msg);
                } else {
                    imageDivElement.remove();
                    showToast(responseJson.msg);
                }
            }).catch(error => {
                console.log(error);
                
                removePreloader();
                imageDivElement.remove();
                try {
                    console.log(error);                    
                    showToast(error.response.msg);
                } catch (error) {
                    showToast(error);
                }
            });
    }


    function deleteImage() {

        const imageID = this.id;
        this.innerText = 'Deleting...';

        if (!deleteImageAPIURL) {
            const errorMessage = 'Post Image API URL is not provided!';
            showToast(errorMessage);
            return;
        }

        const templateId = '001';
        const imageInfo = {
            image_id: imageID,
            template_id: templateId
        };

        const fetchOptions = {
            method: 'POST',
            headers:deleteImageHeaders,
            body: JSON.stringify(imageInfo),
        };

        console.log(fetchOptions);
        
        const deleteURL = deleteImageAPIURL;

        fetch(deleteURL, fetchOptions)
            .then(response => {
                this.innerText = 'Delete';
                if (!response.ok) {
                    return response.json().then(data => {
                        const errorMessage = data.error || 'Request failed';
                        throw { message: errorMessage, response: data };
                    });
                }
                return response.json();
            }).then(responseJson => {
                // The uploaded image URL will be available in data.secure_url
                if (responseJson['status']) {
                    closeImageEditModal();
                    const mainImage = document.getElementById(`m-${imageID}`);
                    const parentElement = mainImage.parentElement;
                    parentElement.remove();
                    showToast(responseJson.msg);
                } else {
                    showToast(responseJson.msg);
                }
            }).catch(error => {
                this.innerText = 'Delete';
                try {
                    showToast(error.response.msg);
                } catch (error) {
                    showToast(error);
                }
            });
    }


    function isBase64Image(imageData) {
        // A simple check to determine if imageData starts with 'data:image/' (indicating Base64 data)
        return /^data:image\/[a-z]+;base64,/.test(imageData);
    }

    function insertImage() {
        let selectedImageUrl = document.querySelector('#imageSeclectModal .prev-img img').src;
        if (!isBase64Image(selectedImageUrl)) {
            if (currSelectedBtn) {
                currSelectedBtn.setAttribute('data-sel-img-url', selectedImageUrl);
                closeImageEditModal();
                return;
            }
        }

        showToast("Oops! Something went wrong. Please refresh the page!");
        return;
    }

    (function () {
        sniffImageUpload();
    })();

    return {
        setDeleteImageAPIURL: function (url) {
            deleteImageAPIURL = url;
        },
        setPostImageAPIURL: function (url) {
            postImageAPIURL = url;
        },
        setDeleteImageHeaders: function (headers) {
            deleteImageHeaders = headers;
        },
        setPostImageHeaders: function (headers) {
            postImageHeaders = headers;
        },
        openUploadImageModal,
        imageEdit
    };

})();

