def load_document(file_path):
    """Load a document from the specified file path."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def save_analysis_results(results, output_path):
    """Save the analysis results to a specified output path."""
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(results)

def validate_file_type(file_path, allowed_extensions):
    """Validate the file type against allowed extensions."""
    return file_path.endswith(tuple(allowed_extensions))