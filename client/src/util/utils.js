export const CreateFile = async ({ data, filename, foldername = "" }) => {
  try {
    // Make a POST request to the backend to create a new file with the provided data and filename
    const response = await fetch("http://localhost:8000/api/create-file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        filename: filename + ".csv",
        foldername,
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error("Failed to create file");
    }

    // Handle success (You can enable toast notifications here if needed)
    console.log("File created successfully!");
  } catch (error) {
    // Handle errors
    console.error("Error creating file:", error);
    throw new Error(
      error.message || "An error occurred while creating the file"
    );
  }
};

export const ReadFile = async ({ foldername = "", filename }) => {
  try {
    // Construct the URL with query parameters for folder and filename
    const params = new URLSearchParams();
    if (foldername) params.append("folder", foldername);
    params.append("file", filename);

    // Make a GET request to the backend to read the file content
    const response = await fetch(
      `http://localhost:8000/api/read_file/?${params.toString()}`
    );

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    // Parse and return the file data
    const fileData = await response.json();
    return fileData; // Return the file data received from the server
  } catch (error) {
    // Handle errors
    console.error("Error reading file:", error);
    throw new Error(
      error.message || "An error occurred while reading the file"
    );
  }
};
