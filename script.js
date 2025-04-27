document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const selectButton = document.getElementById('select-button');
    const fileInfo = document.getElementById('file-info');
    const detectButton = document.getElementById('detect-button');
    const uploadForm = document.getElementById('upload-form');
    const resultContent = document.getElementById('result-content');
    
    // Keep track of the currently selected file
    let currentFile = null;

    // Handle file selection via button
    selectButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Prevent default behaviors for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
        console.log("Drop event triggered");
        const dt = e.dataTransfer;
        const files = dt.files;
        
        console.log("Files dropped:", files.length);
        
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    // Process the selected files
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            console.log("Processing file:", file.name, file.type);
            
            if (file.type.startsWith('image/')) {
                // Store the current file for later use
                currentFile = file;
                
                // Update UI
                fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
                detectButton.disabled = false;
                
                // Set the file to the file input for form submission
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                // Display image preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    resultContent.innerHTML = `
                        <div class="ai-result">
                            <img src="${e.target.result}" alt="Selected image" class="result-image">
                            <p>Click "Detect AI" to analyze this image</p>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                fileInfo.textContent = 'Please select an image file.';
                detectButton.disabled = true;
                currentFile = null;
            }
        }
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // Handle form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentFile) {
            resultContent.innerHTML = `
                <div class="ai-result">
                    <p class="result-text">Error: No file selected</p>
                </div>
            `;
            return;
        }
        
        // Show loading state
        resultContent.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Analyzing image...</p>
            </div>
        `;
        
        const formData = new FormData();
        formData.append('image', currentFile);
        
        console.log("Sending file:", currentFile.name);
        
        // Send the image to the server for analysis
        fetch('/detect', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Server error');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Response data:", data);
            displayResults(data, currentFile);
        })
        .catch(error => {
            console.error("Error:", error);
            resultContent.innerHTML = `
                <div class="ai-result">
                    <p class="result-text">Error: ${error.message || 'Could not process the image.'}</p>
                </div>
            `;
        });
    });

    // Display results
    function displayResults(data, file) {
        if (data.error) {
            resultContent.innerHTML = `
                <div class="ai-result">
                    <p class="result-text">Error: ${data.error}</p>
                </div>
            `;
            return;
        }
        
        const score = data.ai_score * 100;
        const isAI = score > 50;
        const confidence = getConfidenceLevel(score);
        
        // Create an object URL for the file
        const objectUrl = URL.createObjectURL(file);
        
        resultContent.innerHTML = `
            <div class="ai-result">
                <img src="${objectUrl}" alt="Analyzed image" class="result-image">
                <div class="score-bar-container">
                    <div class="score-bar" style="width: ${score}%"></div>
                </div>
                <div class="result-score ${isAI ? 'ai-true' : 'ai-false'}">${score.toFixed(1)}%</div>
                <p class="result-text">
                    <strong>${confidence}</strong> this image ${isAI ? 'IS' : 'is NOT'} AI-generated
                </p>
                <p class="details">Analyzed on ${new Date().toLocaleString()}</p>
            </div>
        `;
        
        // Clean up the object URL when it's no longer needed
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    }

    // Get confidence level text
    function getConfidenceLevel(score) {
        if (score >= 90) return 'Very high confidence';
        if (score >= 70) return 'High confidence';
        if (score >= 50) return 'Moderate confidence';
        if (score >= 30) return 'Low confidence';
        return 'Very low confidence';
    }
});