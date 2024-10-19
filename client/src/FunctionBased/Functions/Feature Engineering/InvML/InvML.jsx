import React, { useEffect, useState } from "react";
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import MultipleDropDown from "../../../Components/MultipleDropDown/MultipleDropDown";
import CustomSlider from "../../../Components/CustomSlider/CustomSlider";
import SingleDropDown from "../../../Components/SingleDropDown/SingleDropDown";
import AgGridAutoDataComponent from "../../../Components/AgGridComponent/AgGridAutoDataComponent";
import { Progress } from "@nextui-org/react";
import { toast } from "react-toastify";

function InvML({ csvData }) {
  const [features, setFeatures] = useState([]);
  const [target, setTarget] = useState("");
  const [testSize, setTestSize] = useState(0.2);

  // PSO Configuration state variables
  const [swarmSize, setSwarmSize] = useState(50);
  const [maxIterations, setMaxIterations] = useState(100);
  const [omega, setOmega] = useState(0.5);
  const [phiP, setPhiP] = useState(0.5);
  const [phiG, setPhiG] = useState(0.5);
  const [numSolutions, setNumSolutions] = useState(10);
  const [numProcessors, setNumProcessors] = useState(4);
  const [maxRounds, setMaxRounds] = useState(5);
  const [progress, setProgress] = useState(0);

  const [selectedGraphFormat, setSelectedGraphFormat] = useState("png");

  // New state for selected features to tune bounds
  const [selectedFeaturesForBounds, setSelectedFeaturesForBounds] = useState(
    []
  );
  const [hyperparameterBounds, setHyperparameterBounds] = useState({});

  // State variable for epsilon
  const [epsilon, setEpsilon] = useState(0);

  // New state variables for handling API call and response
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const handleFeatureChange = (selectedFeatures) => {
    setFeatures(selectedFeatures);
  };

  const handleBoundChange = (feature, boundType, value) => {
    setHyperparameterBounds((prev) => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [boundType]: parseFloat(value),
      },
    }));
  };

  const handleSelectedFeaturesForBoundsChange = (selectedFeatures) => {
    const newBounds = {};

    // Retain bounds for selected features
    selectedFeatures.forEach((feature) => {
      newBounds[feature] = hyperparameterBounds[feature] || {
        lower: 0,
        upper: 1,
      };
    });

    // Update the state with only the selected features' bounds
    setSelectedFeaturesForBounds(selectedFeatures);
  };

  const renderHyperparameterBounds = () => {
    return selectedFeaturesForBounds.map((feature) => (
      <div key={feature} className="mt-6 w-full grid grid-cols-2 gap-8">
        <TextField
          label={`Lower bound for ${feature}`}
          type="number"
          size="small"
          value={hyperparameterBounds[feature]?.lower || 0}
          onChange={(e) => handleBoundChange(feature, "lower", e.target.value)}
          InputProps={{
            inputProps: {
              step: 0.01,
            },
          }}
        />
        <TextField
          label={`Upper bound for ${feature}`}
          type="number"
          size="small"
          value={hyperparameterBounds[feature]?.upper || 1}
          onChange={(e) => handleBoundChange(feature, "upper", e.target.value)}
          InputProps={{
            inputProps: {
              step: 0.01,
            },
          }}
        />
      </div>
    ));
  };

  // Function to calculate min and max for each feature
  const calculateFeatureBounds = (csvData) => {
    const bounds = {};
    const featureKeys = Object.keys(csvData[0]);

    featureKeys.forEach((key) => {
      const values = csvData
        .map((row) => parseFloat(row[key]))
        .filter((v) => !isNaN(v));
      bounds[key] = {
        lower: Math.min(...values),
        upper: Math.max(...values),
      };
    });

    return bounds;
  };

  useEffect(() => {
    // Calculate default bounds when csvData is loaded
    const defaultBounds = calculateFeatureBounds(csvData);
    setHyperparameterBounds(defaultBounds);
  }, [csvData]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev + 3 < 96) return prev + 3;
          return 96;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Function to handle the "Run Optimization" button click
  const handleRunOptimization = () => {
    setLoading(true); // Start the loader
    // Construct the data object according to the required format
    const requestData = {
      data: csvData,
      features: features,
      target: target,
      target_value: epsilon,
      pso_config: {
        lb: [],
        ub: [],
        swarmsize: swarmSize,
        omega: omega,
        phip: phiP,
        phig: phiG,
        maxiter: maxIterations,
        n_solutions: numSolutions,
        nprocessors: numProcessors,
        max_rounds: maxRounds,
        debug_flag: false,
      },
    };

    // Collect the lower and upper bounds for each feature
    features.forEach((feature) => {
      const bounds = selectedFeaturesForBounds.includes(feature)
        ? hyperparameterBounds[feature] // Use user-specified bounds
        : hyperparameterBounds[feature]; // Default to calculated min/max

      if (bounds) {
        requestData.pso_config.lb.push(bounds.lower);
        requestData.pso_config.ub.push(bounds.upper);
      }
    });
    setProgress(0);

    // Send the POST request
    fetch("http://localhost:8000/api/optimize/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data
        console.log("Success:", data);

        // Initialize an array for the transformed table
        const transformedTable = [];

        // Extract feature names dynamically
        const featureNames = Object.keys(data.comparison_table);
        const modelNames = Object.keys(data.comparison_table[featureNames[0]]);

        // Loop through each model and create a row dynamically
        modelNames.forEach((model) => {
          const row = { "Model Name": model };

          // Add feature values to the row dynamically
          featureNames.forEach((feature) => {
            row[feature] = data.comparison_table[feature][model];
          });

          transformedTable.push(row);
        });
        data.comparison_table = transformedTable;

        setResponseData(data); // Save the response data
        setLoading(false); // Stop the loader
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.message);
        setProgress(100);
        setLoading(false); // Stop the loader even if there's an error
      });
  };

  const handleDownloadImage = () => {
    if (
      responseData &&
      responseData.graphs &&
      responseData.graphs[selectedGraphFormat]
    ) {
      const link = document.createElement("a");
      const mimeType =
        selectedGraphFormat === "png"
          ? "image/png"
          : selectedGraphFormat === "jpg"
          ? "image/jpeg"
          : selectedGraphFormat === "svg"
          ? "image/svg+xml"
          : "application/pdf"; // Fallback for PDF
      link.href = `data:${mimeType};base64,${responseData.graphs[selectedGraphFormat]}`;
      link.download = `plot.${selectedGraphFormat}`;
      link.click();
    }
  };

  return (
    <div className="my-8 w-full">
      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <p>Select Features:</p>
          <MultipleDropDown
            columnNames={Object.keys(csvData[0])}
            setSelectedColumns={handleFeatureChange}
            defaultValue={features}
          />
        </div>
        <div>
          <p>Select Target:</p>
          <SingleDropDown
            columnNames={Object.keys(csvData[0])}
            onValueChange={(e) => setTarget(e)}
            initValue={target}
          />
        </div>
      </div>
      {features.length > 0 && (
        <div>
          <div className="grid grid-cols-2 items-center gap-4">
            <CustomSlider
              label="Test Set Size"
              value={testSize}
              onChange={(e, v) => setTestSize(v)}
              min={0.1}
              max={0.5}
              step={0.01}
            />
            <div className="mt-4 space-y-2">
              <p>Target Feature</p>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={epsilon}
                onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <Typography
            variant="h5"
            className="!mt-4 !font-medium"
            gutterBottom
            sx={{ mt: 3 }}
          >
            PSO Configuration
          </Typography>
          <div className="grid grid-cols-2 gapy-4 gap-x-8">
            <CustomSlider
              label="Swarm size"
              value={swarmSize}
              onChange={(e, v) => setSwarmSize(v)}
              min={10}
              max={100}
              step={1}
            />
            <CustomSlider
              label="Max iterations"
              value={maxIterations}
              onChange={(e, v) => setMaxIterations(v)}
              min={10}
              max={1000}
              step={10}
            />
            <CustomSlider
              label="Omega"
              value={omega}
              onChange={(e, v) => setOmega(v)}
              min={0.0}
              max={1.0}
              step={0.01}
            />
            <CustomSlider
              label="Phi P"
              value={phiP}
              onChange={(e, v) => setPhiP(v)}
              min={0.0}
              max={2.0}
              step={0.01}
            />
            <CustomSlider
              label="Phi G"
              value={phiG}
              onChange={(e, v) => setPhiG(v)}
              min={0.0}
              max={2.0}
              step={0.01}
            />
            <CustomSlider
              label="Number of solutions"
              value={numSolutions}
              onChange={(e, v) => setNumSolutions(v)}
              min={1}
              max={50}
              step={1}
            />
            <CustomSlider
              label="Number of processors"
              value={numProcessors}
              onChange={(e, v) => setNumProcessors(v)}
              min={1}
              max={10}
              step={1}
            />
            <CustomSlider
              label="Max rounds"
              value={maxRounds}
              onChange={(e, v) => setMaxRounds(v)}
              min={1}
              max={20}
              step={1}
            />
          </div>
          <Typography
            variant="h5"
            className="!mt-6 !font-medium"
            gutterBottom
            sx={{ my: 4 }}
          >
            Hyperparameter Bounds
          </Typography>
          <div>
            <p>Select features to tune bounds:</p>
            <MultipleDropDown
              columnNames={features}
              setSelectedColumns={handleSelectedFeaturesForBoundsChange}
              defaultValue={selectedFeaturesForBounds}
            />
          </div>
          {renderHyperparameterBounds()}
          <div className="flex justify-end">
            <button
              className="mt-12 border-2 px-6 tracking-wider bg-primary-btn text-white font-medium rounded-md py-2"
              onClick={handleRunOptimization}
              disabled={loading} // Disable button when loading
            >
              Run Optimization
            </button>
          </div>
          {loading && (
            <div className="mt-6">
              <Progress
                value={progress}
                shadow
                color="success"
                status="secondary"
                striped
              />
            </div>
          )}
          {responseData && (
            <div className="mt-12">
              <Typography variant="h5" className="!font-medium" gutterBottom>
                Optimization Results
              </Typography>
              <div>
                <Typography variant="body1">
                  <strong>Best Model:</strong> {responseData.best_model}
                </Typography>
                <Typography variant="body1">
                  <strong>Best Runtime:</strong> {responseData.best_runtime}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="h6"
                  className="!mt-4 !font-medium"
                  gutterBottom
                >
                  Best Solutions
                </Typography>
                <AgGridAutoDataComponent
                  rowData={responseData.best_solution}
                  rowHeight={50}
                  paginationPageSize={10}
                  headerHeight={50}
                  download={true}
                  height="600px"
                />
              </div>
              <div className="mt-20">
                <Typography
                  variant="h6"
                  className="!mt-4 !font-medium"
                  gutterBottom
                >
                  Comparison Table
                </Typography>
                <AgGridAutoDataComponent
                  rowData={responseData.comparison_table}
                  rowHeight={50}
                  paginationPageSize={10}
                  headerHeight={50}
                  download={true}
                  height="600px"
                />
              </div>

              <div className="mt-20">
                <Typography
                  variant="h6"
                  className="!mt-4 !font-medium"
                  gutterBottom
                >
                  Optimization Graph
                </Typography>
                <img
                  src={`data:image/png;base64,${responseData.graphs.png}`}
                  alt="Optimization Graph"
                  className="w-full max-w-4xl h-auto border rounded-md"
                />
                <FormControl className="mt-4" variant="outlined" fullWidth>
                  <InputLabel>Select Format</InputLabel>
                  <Select
                    value={selectedGraphFormat}
                    onChange={(e) => setSelectedGraphFormat(e.target.value)}
                    label="Select Format"
                  >
                    {Object.keys(responseData.graphs).map((format) => (
                      <MenuItem key={format} value={format}>
                        {format.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  className="!mt-4"
                  color="primary"
                  onClick={handleDownloadImage}
                >
                  Download Graph
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InvML;
