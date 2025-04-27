AI Image Detector
This web application leverages the SightEngine API to analyze images and detect whether they are AI-generated or not. It features a modern, user-friendly interface with drag-and-drop functionality and detailed analysis results.
Features

User-friendly interface: Modern design with intuitive controls
Drag & Drop: Easily upload images via drag and drop or file browser
Real-time analysis: Instant processing of images with visual feedback
Detailed results: Confidence score, visual indicators, and interpretation of results
Responsive design: Works on both desktop and mobile devices

Installation
Prerequisites

Python 3.6+
pip (Python package manager)

Setup Instructions

Clone or download this repository to your local machine
Install required Python packages:
pip install flask requests

Verify your project structure:
Ensure you have the following files in your project directory:

app.py - Flask application
index.html - Web interface
style.css - Styling
script.js - Frontend JavaScript


Run the application:
python app.py

Access the web interface:
Open your browser and navigate to http://127.0.0.1:5000/

Usage

Upload an image:

Drag and drop an image onto the upload area, or
Click "Browse Files" to select an image from your computer


Analyze the image:

Click the "Detect AI" button to analyze the uploaded image
A loading spinner will appear while processing


View results:

The analysis results show the probability that the image is AI-generated
A visual score bar indicates the likelihood
Color coding (red for AI-generated, green for natural) provides quick assessment
The confidence level is clearly stated



Technical Details
How It Works

The frontend collects the image via drag-and-drop or file input
The image is sent to the Flask backend server
The server forwards the image to the SightEngine API
SightEngine analyzes the image and returns an AI generation probability score
The server processes the API response and returns the results to the frontend
The frontend displays the results in a user-friendly format

API Integration
This application uses the SightEngine API with the 'genai' model to detect AI-generated images. The API returns a score between 0 and 1, where:

0: Very likely natural/human-created
1: Very likely AI-generated

File Structure

app.py: Backend Flask application that:

Handles HTTP requests
Manages file uploads
Communicates with SightEngine API
Processes and returns results


index.html: Frontend web interface with:

Upload area
Results display
Responsive layout


style.css: Styling for the web interface:

Modern design
Visual indicators
Responsive elements


script.js: Frontend JavaScript for:

Handling drag and drop
Form submission
Results display
Error handling



Troubleshooting
Common Issues

Drag and drop not working: Check your browser console for errors and ensure the browser supports HTML5 drag and drop
Upload errors: Verify that the file is a valid image format and not too large
Analysis fails: Check your internet connection and ensure the SightEngine API is accessible
