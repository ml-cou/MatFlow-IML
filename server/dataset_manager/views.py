import os
import pandas as pd
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json

# Path to the dataset directory (one level up from the current file directory)
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset')

def get_nested_directory_structure(root_path):
    """
    Recursively traverse the directory to create a nested JSON structure.
    """
    structure = {}
    for item in os.listdir(root_path):
        item_path = os.path.join(root_path, item)
        if os.path.isdir(item_path):
            structure[item] = get_nested_directory_structure(item_path)  # Recursive call for subfolders
        else:
            # For files, append the file names to the structure
            if 'files' not in structure:
                structure['files'] = []
            structure['files'].append(item)
    return structure

def get_dataset_structure(request):
    """
    View that returns the nested folder and file structure within the dataset directory.
    Optional file content can be read by providing 'folder' and 'file' query parameters.
    """
    # Get folder and file from the query parameters
    folder = request.GET.get('folder')
    if folder == '/':
        folder = ""
    print(folder)
    file = request.GET.get('file')

    # If folder and file are provided, read the file content
    if folder or file:
        # Construct the file path based on the folder and file names
        file_path = os.path.join(DATASET_DIR, folder, file)
        # print(file_path)

        # Check if the file exists at the constructed path
        if os.path.isfile(file_path):
            try:
                # Read the file based on the extension
                file_extension = os.path.splitext(file_path)[1].lower()
                if file_extension == '.csv':
                    df = pd.read_csv(file_path)  # Read CSV file
                elif file_extension in ['.xlsx', '.xls']:
                    df = pd.read_excel(file_path)  # Read Excel file
                else:
                    return HttpResponse("Unsupported file type", status=400)

                # Return the content as a JSON response
                return JsonResponse(df.to_dict(orient='records'), safe=False)
            except Exception as e:
                # Return error message if there was an issue reading the file
                return HttpResponse(f"Error reading file: {e}", status=500)
        else:
            # Return 404 if the file is not found
            return HttpResponse("File not found", status=404)
    
    # If no specific file is requested, return the nested directory structure
    nested_structure = get_nested_directory_structure(DATASET_DIR)

    # Return the directory structure as a JSON response
    return JsonResponse(nested_structure, safe=False)


@csrf_exempt
def create_folder(request):
    import json
    data = json.loads(request.body)
    folder_name = data.get('folderName')
    parent = data.get('parent')

    # Create the folder inside the dataset directory
    if folder_name:
        folder_path = os.path.join(DATASET_DIR, parent, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        return JsonResponse({"message": "Folder created successfully!"}, status=201)

    return JsonResponse({"error": "Folder name is required"}, status=400)



@csrf_exempt
def upload_file(request):
    folder = request.POST.get('folder', '')
    file = request.FILES.get('file')

    if file:
        file_path = os.path.join(DATASET_DIR, folder, file.name)
        path = default_storage.save(file_path, ContentFile(file.read()))
        return JsonResponse({"message": "File uploaded successfully!"}, status=201)

    return JsonResponse({"error": "No file uploaded"}, status=400)


import shutil
@csrf_exempt
def delete_item(request):
    """
    View to handle deletion of files and folders.
    Accepts 'folder' and optional 'file' as query parameters.
    """
    if request.method == 'DELETE':
        # Extract the folder and file parameters from the URL
        folder = request.GET.get('folder', '')
        file = request.GET.get('file')

        try:
            # Construct the path based on whether it's a file or folder
            if file:
                path = os.path.join(DATASET_DIR, folder, file)
                if os.path.isfile(path):
                    os.remove(path)  # Delete the file
                    return JsonResponse({"message": "File deleted successfully!"}, status=200)
                else:
                    return JsonResponse({"error": "File not found"}, status=404)
            else:
                path = os.path.join(DATASET_DIR, folder)
                if os.path.isdir(path):
                    # Use shutil.rmtree() to delete the folder and all its contents recursively
                    shutil.rmtree(path)
                    return JsonResponse({"message": "Folder and its contents deleted successfully!"}, status=200)
                else:
                    return JsonResponse({"error": "Folder not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return HttpResponse(status=405)  # Method not allowed

@csrf_exempt
def create_file(request):
    """
    API endpoint to create a new file with provided data and save it in the backend.
    Expects 'data', 'filename', and 'foldername' in the request body.
    Assumes 'data' is always an array of objects (list of dictionaries).
    Supports saving data only in CSV or Excel format.
    """
    if request.method == 'POST':
        try:
            print("s")
            # Parse the JSON request body
            body = json.loads(request.body)
            data = body.get('data')
            filename = body.get('filename')
            foldername = body.get('foldername', '')  # Default to root dataset directory if foldername is empty
            print(filename, foldername)
            
            # Validate the input
            if not filename:
                return JsonResponse({"error": "Filename is required."}, status=400)

            # Determine the extension and validate data type accordingly
            file_extension = os.path.splitext(filename)[1]  # Get file extension from filename
            if file_extension.lower() not in ['.csv', '.xlsx']:  # Support only CSV and Excel
                return JsonResponse({"error": f"Unsupported file extension: {file_extension}. Use .csv or .xlsx only."}, status=400)

            # Convert the provided data (assumed to be list of dictionaries) to a DataFrame
            try:
                df = pd.DataFrame(data)
            except ValueError as e:
                return JsonResponse({"error": f"Data is not compatible with CSV/Excel format: {str(e)}"}, status=400)

            # Determine the path to save the file
            folder_path = os.path.join(DATASET_DIR, foldername)
            if not os.path.exists(folder_path):
                os.makedirs(folder_path, exist_ok=True)  # Create the folder if it does not exist

            # Create the full file path and save data according to the file type
            file_path = os.path.join(folder_path, filename)
            if file_extension.lower() == '.csv':
                df.to_csv(file_path, index=False)  # Save DataFrame as CSV
            elif file_extension.lower() == '.xlsx':
                df.to_excel(file_path, index=False)  # Save DataFrame as Excel

            return JsonResponse({"message": f"File '{filename}' created successfully in '{foldername}'!"}, status=201)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=500)
    
    return HttpResponse(status=405)  # Method not allowed


@csrf_exempt
def read_file(request):
    """
    View to read the content of a specific file.
    Accepts 'folder' and 'file' query parameters to identify the file.
    Returns the file content as a JSON response.
    """
    folder = request.GET.get('folder', '')  # Default to empty string if no folder is provided
    file = request.GET.get('file')  # Get the file name from the query parameters
    # print(folder, file)

    # If no file is specified, return an error response
    if not file:
        return JsonResponse({"error": "File name is required."}, status=400)

    # Construct the full path to the file
    file_path = os.path.join(DATASET_DIR, folder, file)
    print(file_path)

    # Check if the file exists
    if not os.path.isfile(file_path):
        return JsonResponse({"error": f"File '{file}' not found in folder '{folder}'."}, status=404)

    try:
        # Read the file based on its extension
        file_extension = os.path.splitext(file_path)[1].lower()
        if file_extension == '.csv':
            df = pd.read_csv(file_path)  # Read CSV file into DataFrame
        elif file_extension in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)  # Read Excel file into DataFrame
        else:
            return JsonResponse({"error": "Unsupported file type. Supported types are .csv, .xlsx, .xls."}, status=400)

        # Convert the DataFrame to a list of dictionaries and return as JSON
        return JsonResponse(df.to_dict(orient='records'), safe=False)
    except Exception as e:
        # Return error message if there was an issue reading the file
        return JsonResponse({"error": f"Error reading file: {str(e)}"}, status=500)
