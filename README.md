# Legal Tone Analyzer Backend

This project is a backend service for the Legal Tone Analyzer web application. It integrates sentiment analysis logic to analyze the tone of legal documents using AI-powered techniques.

## Project Structure

```
legal-tone-analyzer-backend
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── sentiment.py
│   └── utils.py
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd legal-tone-analyzer-backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. **Install the required dependencies:**
   ```
   pip install -r requirements.txt
   ```

## Usage

1. **Run the application:**
   ```
   python app/main.py
   ```

2. **API Endpoints:**
   - **POST /analyze**: Analyze the tone of a legal document.
     - Request body should include the document text or a file upload.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.