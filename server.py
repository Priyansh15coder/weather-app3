from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import importlib
import os
from openai import OpenAI

app = Flask(__name__, static_folder='.', static_url_path='')

# CRITICAL: Enable CORS for all routes - FIX FOR FAILED TO FETCH
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

OPENAI_KEY = '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'
client = OpenAI(api_key=OPENAI_KEY)

client = OpenAI(api_key=OPENAI_KEY)


@app.before_request
def handle_preflight():
    """Handle CORS preflight requests"""
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        return response


@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat_api():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json(force=True)
        message = data.get('message', '')
        model = data.get('model', 'gpt-5.4-mini')
        
        if not message:
            return jsonify({'error': 'no message provided'}), 400

        if client is None:
            return jsonify({'error': 'OPENAI_API_KEY not set on the server.'}), 500

        print(f"[CHAT] Received message: {message}")
        
        resp = client.chat.completions.create(
            model=model,
            messages=[{'role': 'user', 'content': message}],
            temperature=0.6,
            max_completion_tokens=600,
        )

        msg = ''
        if hasattr(resp, 'choices') and resp.choices:
            choice = resp.choices[0]
            if hasattr(choice, 'message'):
                msg = choice.message.content
            elif isinstance(choice, dict):
                msg = choice.get('message', {}).get('content', '')

        print(f"[CHAT] Sending reply: {msg}")
        return jsonify({'reply': msg})
    
    except Exception as e:
        print(f"[CHAT ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/listen', methods=['POST', 'OPTIONS'])
def speech_listen():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        speech_recognition = importlib.import_module('speech_recognition')
        print("[LISTEN] Speech recognition module loaded")
    except ImportError as e:
        print(f"[LISTEN ERROR] SpeechRecognition not installed: {e}")
        return jsonify({'error': 'SpeechRecognition package not installed. Install with: pip install SpeechRecognition'}), 500

    data = request.get_json(force=True) or {}
    timeout = float(data.get('timeout', 5.0))
    phrase_time_limit = float(data.get('phrase_time_limit', 5.0))

    recognizer = speech_recognition.Recognizer()
    try:
        print("[LISTEN] Initializing microphone...")
        with speech_recognition.Microphone() as mic:
            print("[LISTEN] Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(mic, duration=0.3)
            print(f"[LISTEN] Listening for {timeout}s...")
            audio = recognizer.listen(mic, timeout=timeout, phrase_time_limit=phrase_time_limit)
            print("[LISTEN] Processing audio...")
            text = recognizer.recognize_google(audio)
            print(f"[LISTEN] Recognized: {text}")
            
            lang = 'en'
            try:
                langdetect = importlib.import_module('langdetect')
                lang = langdetect.detect(text)
                print(f"[LISTEN] Detected language: {lang}")
            except Exception:
                lang = 'en'
            
            return jsonify({'text': text, 'lang': lang})
    
    except speech_recognition.UnknownValueError:
        print("[LISTEN] Could not understand audio")
        return jsonify({'text': '', 'lang': 'unknown'})
    
    except speech_recognition.RequestError as e:
        print(f"[LISTEN ERROR] API error: {e}")
        return jsonify({'error': f'Google Speech Recognition API error: {e}'}), 500
    
    except Exception as e:
        print(f"[LISTEN ERROR] {type(e).__name__}: {str(e)}")
        error_msg = str(e)
        if 'pyaudio' in error_msg.lower():
            return jsonify({'error': 'PyAudio not installed. Install with: pip install PyAudio'}), 500
        if 'microphone' in error_msg.lower() or 'audio' in error_msg.lower():
            return jsonify({'error': f'Microphone error: {error_msg}. Check your audio device.'}), 500
        return jsonify({'error': error_msg}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Backend is running'}), 200


@app.route('/')
def index():
    return send_from_directory('.', 'app weather.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)


@app.errorhandler(Exception)
def handle_exception(e):
    print(f"[ERROR] Unhandled exception: {e}")
    return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("WEATHER APP BACKEND STARTING")
    print("=" * 50)
    print("Running on: http://0.0.0.0:5000")
    print("CORS enabled for all origins")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
