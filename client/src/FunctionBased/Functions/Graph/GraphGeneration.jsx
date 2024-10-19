import React, { useState, useEffect } from "react";
import MultipleDropDown from "../../Components/MultipleDropDown/MultipleDropDown";

function GraphGeneration() {
  const [datasets, setDatasets] = useState([]); // List of datasets
  const [selectedDatasets, setSelectedDatasets] = useState([]); // Selected datasets
  const [columns, setColumns] = useState({}); // Map of datasetName to columns/features
  const [selectedFeatures, setSelectedFeatures] = useState({}); // Map of datasetName to selected features

  useEffect(() => {
    // Fetch datasets from the backend when the component mounts
    fetchDatasets();
  }, []);

  useEffect(() => {
    console.log(selectedFeatures);
  }, [selectedFeatures]);

  useEffect(() => {
    // Fetch columns for each selected dataset
    selectedDatasets.forEach((datasetName) => {
      if (!columns[datasetName]) {
        fetchColumnsForDataset(datasetName);
      }
    });
  }, [selectedDatasets]);

  // Function to fetch datasets from the backend
  const fetchDatasets = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/dataset/"); // Update with your endpoint
      const data = await response.json();

      // Process the nested structure to get a flat list of datasets
      const datasetsList = extractDatasetsFromStructure(data);
      setDatasets(datasetsList);
    } catch (error) {
      console.error("Error fetching datasets:", error);
    }
  };

  // Function to extract dataset paths from nested structure
  const extractDatasetsFromStructure = (data, path = "", result = []) => {
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        const fullPath = path ? `${path}/${file}` : file;
        result.push(fullPath);
      });
    }
    Object.keys(data).forEach((key) => {
      if (key !== "files" && typeof data[key] === "object") {
        const newPath = path ? `${path}/${key}` : key;
        extractDatasetsFromStructure(data[key], newPath, result);
      }
    });
    return result;
  };

  // Function to fetch columns/features for the selected dataset
  const fetchColumnsForDataset = async (datasetPath) => {
    try {
      // Split datasetPath into folder and file
      const pathParts = datasetPath.split("/");
      const file = pathParts.pop();
      const folder = pathParts.join("/");
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (folder) {
        queryParams.append("folder", folder);
      }
      queryParams.append("file", file);
      const response = await fetch(
        `http://localhost:8000/api/read_file/?${queryParams.toString()}`
      ); // Update with your endpoint
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching columns:", data.error);
        return;
      }
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        setColumns((prevColumns) => ({
          ...prevColumns,
          [datasetPath]: columns,
        }));
      } else {
        setColumns((prevColumns) => ({
          ...prevColumns,
          [datasetPath]: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  };

  // Handle dataset selection change
  const handleDatasetChange = (newSelectedDatasets) => {
    setSelectedDatasets(newSelectedDatasets);
  };

  // Handle selected features change for a dataset
  const handleSelectedFeaturesChange = (datasetName, newSelectedFeatures) => {
    setSelectedFeatures((prevSelectedFeatures) => ({
      ...prevSelectedFeatures,
      [datasetName]: newSelectedFeatures,
    }));
  };

  return (
    <div className="my-8">
      <p className="font-medium text-lg">Select Datasets:</p>
      {/* Full width dataset selection dropdown */}
      <div className="w-full mb-4">
        <MultipleDropDown
          columnNames={datasets}
          setSelectedColumns={handleDatasetChange}
          defaultValue={selectedDatasets}
          disabled={false}
        />
      </div>

      {/* Render MultipleDropDown for columns dynamically based on the selected datasets */}
      <div className="grid grid-cols-2 gap-4">
        {selectedDatasets.map((datasetName) =>
          columns[datasetName] ? (
            <div key={datasetName} className="w-full mb-4">
              <p>Select Features for {datasetName}:</p>
              <MultipleDropDown
                columnNames={columns[datasetName]}
                setSelectedColumns={(newSelectedFeatures) =>
                  handleSelectedFeaturesChange(datasetName, newSelectedFeatures)
                }
                defaultValue={selectedFeatures[datasetName] || []}
                disabled={false}
              />
            </div>
          ) : (
            <div key={datasetName}>Loading columns for {datasetName}...</div>
          )
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button className="self-start border-2 px-5 tracking-wider bg-primary-btn text-white font-medium rounded-md py-1.5">
          Generate
        </button>
      </div>
    </div>
  );
}

export default GraphGeneration;
