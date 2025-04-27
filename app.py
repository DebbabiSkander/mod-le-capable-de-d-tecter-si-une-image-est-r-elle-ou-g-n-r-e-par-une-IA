from flask import Flask, request, jsonify, render_template, send_from_directory
import requests
import json
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='.')

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# API credentials
API_USER = '461391386'
API_SECRET = 'p8yrvG9pSS3QDpoaDARy9p5eGNPnEn6d'

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/script.js')
def serve_js():
    """Serve the JavaScript file"""
    return send_from_directory('.', 'script.js')

@app.route('/style.css')
def serve_css():
    """Serve the CSS file"""
    return send_from_directory('.', 'style.css')

@app.route('/detect', methods=['POST'])
def detect():
    """Handle image upload and detection"""
    print("Received detect request")
    print("Files in request:", list(request.files.keys()))
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    print(f"Received file: {file.filename}, {file.content_type}")
    
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Generate a unique filename
    filename = str(uuid.uuid4()) + secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        # Save the uploaded file
        file.save(filepath)
        print(f"File saved to {filepath}")
        
        # Call SightEngine API to check if the image is AI-generated
        result = check_ai_generated(filepath)
        print(f"API result: {result}")
        
        # Delete the file after processing
        os.remove(filepath)
        
        return jsonify(result)
    
    except Exception as e:
        # Clean up the file if there was an error
        if os.path.exists(filepath):
            os.remove(filepath)
        
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def check_ai_generated(image_path):
    """
    Check if an image is AI-generated using SightEngine API
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Result with AI detection score
    """
    # API parameters
    params = {
        'models': 'genai',
        'api_user': API_USER,
        'api_secret': API_SECRET
    }
    
    # Send the request to SightEngine API
    with open(image_path, 'rb') as image_file:
        files = {'media': image_file}
        
        response = requests.post(
            'https://api.sightengine.com/1.0/check.json',
            files=files,
            data=params
        )
    
    # Check if the request was successful
    if response.status_code == 200:
        result = json.loads(response.text)
        
        # Extract the AI score from the response
        ai_score = result.get('type', {}).get('ai_generated', None)
        
        if ai_score is None:
            return {'error': 'Could not determine AI score from API response'}
        
        return {
            'ai_score': ai_score,
            'raw_response': result
        }
    else:
        raise Exception(f"API request failed with status code {response.status_code}: {response.text}")

if __name__ == '__main__':
    app.run(debug=True)