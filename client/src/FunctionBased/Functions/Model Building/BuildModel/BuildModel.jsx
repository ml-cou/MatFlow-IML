import { Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  setHyperparameterData,
  setModelSetting,
  setReg,
  setTargetVariable,
  setType,
} from "../../../../Slices/ModelBuilding";
import {
  fetchDataFromIndexedDB,
  updateDataInIndexedDB,
} from "../../../../util/indexDB";
import SingleDropDown from "../../../Components/SingleDropDown/SingleDropDown";
import DecisionTreeClassification from "./components/Categorical/DecisionTreeClassification";
import KNearestNeighbour from "./components/Categorical/KNearestNeighbour";
import LogisticRegression from "./components/Categorical/LogisticRegression";
import MultilayerPerceptron from "./components/Categorical/MultilayerPerceptron";
import RandomForestClassification from "./components/Categorical/RandomForestClassification";
import SupportVectorMachine from "./components/Categorical/SupportVectorMachine";
import DecisionTreeRegression from "./components/Continuous/DecisionTreeRegression";
import LassoRegression from "./components/Continuous/LassoRegression";
import LinearRegression from "./components/Continuous/LinearRegression";
import RandomForestRegression from "./components/Continuous/RandomForestRegression";
import RidgeRegression from "./components/Continuous/RidgeRegression";
import SupportVectorRegressor from "./components/Continuous/SupportVectorRegressor";
import { ReadFile } from "../../../../util/utils";

const REGRESSOR = [
  "Linear Regression",
  "Ridge Regression",
  "Lasso Regression",
  "Decision Tree Regression",
  "Random Forest Regression",
  "Support Vector Regressor",
];

const CLASSIFIER = [
  "K-Nearest Neighbors",
  "Support Vector Machine",
  "Logistic Regression",
  "Decision Tree Classification",
  "Random Forest Classification",
  "Multilayer Perceptron",
];

function BuildModel({
  csvData,
  nodeData = undefined,
  type = "function",
  initValue = undefined,
  onValueChange = undefined,
}) {
  // const [regressor, setRegressor] = useState(Regressor[0]);
  const [allRegressor, setAllRegressor] = useState();
  const [regressor, setRegressor] = useState();
  const [allDatasetName, setAllDatasetName] = useState([]);
  const [loading, setLoading] = useState(false);
  const [whatKind, setWhatKind] = useState();
  const dispatch = useDispatch();
  const [train, setTrain] = useState();
  const [test, setTest] = useState();
  const [model_name, setModelName] = useState("");
  const [current_dataset, setCurrentDataset] = useState();
  const model_setting = useSelector(
    (state) => state.modelBuilding.model_setting
  );
  const Type = useSelector((state) => state.modelBuilding.type);
  const target_variable = useSelector(
    (state) => state.modelBuilding.target_variable
  );
  const reg = useSelector((state) => state.modelBuilding.regressor);
  const [nicherData, setNicherData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let tempDatasets = await fetchDataFromIndexedDB("splitted_dataset");
      tempDatasets = tempDatasets.map((val) => Object.keys(val)[0]);
      setAllDatasetName(tempDatasets);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (type === "node" && nodeData) {
      setWhatKind(nodeData.whatKind);
      if (nodeData.whatKind === "Continuous") {
        setAllRegressor(REGRESSOR);
        setRegressor(nodeData.regressor || REGRESSOR[0]);
        dispatch(setReg(nodeData.regressor || REGRESSOR[0]));
        dispatch(setType("regressor"));
        setModelName(nodeData.model_name || "LR_Regression");
      } else {
        setAllRegressor(CLASSIFIER);
        setRegressor(nodeData.regressor || CLASSIFIER[0]);
        dispatch(setReg(nodeData.regressor || CLASSIFIER[0]));
        dispatch(setType("classifier"));
        setModelName(nodeData.model_name || "KNN_Classification");
      }
      dispatch(setTargetVariable(nodeData.target_variable));
      dispatch(setHyperparameterData({}));
      dispatch(setModelSetting({}));
      setNicherData("");
      setTrain(nodeData.train);
      setTest(nodeData.test);
    }
  }, [nodeData]);

  const handleDatasetChange = async (e) => {
    try {
      let tempDatasets = await fetchDataFromIndexedDB("splitted_dataset");
      tempDatasets.forEach(async (val) => {
        if (e === Object.keys(val)[0]) {
          setCurrentDataset(e);
          setWhatKind(val[e][0]);

          // Check What Kind
          if (val[e][0] === "Continuous") {
            setAllRegressor(REGRESSOR);
            setRegressor(REGRESSOR[0]);
            dispatch(setReg(REGRESSOR[0]));
            dispatch(setType("regressor"));
            setModelName("LR_Regression");
          } else {
            setAllRegressor(CLASSIFIER);
            setRegressor(CLASSIFIER[0]);
            dispatch(setReg(CLASSIFIER[0]));
            dispatch(setType("classifier"));
            setModelName("KNN_Classification");
          }
          dispatch(setTargetVariable(val[e][3]));
          dispatch(setHyperparameterData({}));
          dispatch(setModelSetting({}));
          setNicherData("");

          // const trainData = await fetchDataFromIndexedDB(val[e][1]);
          // const testData = await fetchDataFromIndexedDB(val[e][2]);
          console.log(val[e]);
          const trainData = await ReadFile({
            foldername: val[e][5],
            filename: val[e][1] + ".csv",
          });
          const testData = await ReadFile({
            foldername: val[e][5],
            filename: val[e][2] + ".csv",
          });

          if (
            !testData ||
            !trainData ||
            !testData.length ||
            !trainData.length
          ) {
            setAllRegressor();
            toast.warn("Properly Split Dataset First.", {
              position: "bottom-right",
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
          } else {
            setTrain(trainData);
            setTest(testData);
          }
        }
      });
    } catch (error) {
      setAllRegressor();
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleSave = async () => {
    try {
      // console.log('first')

      let tempModel = await fetchDataFromIndexedDB("models");
      tempModel.forEach((val) => {
        if (current_dataset === Object.keys(val)[0]) {
          if (val[current_dataset] && val[current_dataset][model_name]) {
            throw new Error("Model name exist!");
          }
        }
      });

      const res = await fetch("http://127.0.0.1:8000/api/build_model/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test,
          train,
          target_var: target_variable,
          type: Type,
          [Type === "regressor" ? "regressor" : "classifier"]: reg,
          ...model_setting,
          file: csvData,
        }),
      });
      const data = await res.json();

      // return;
      setNicherData(data.metrics);

      let allModels = await fetchDataFromIndexedDB("models");
      const ind = allModels.findIndex((obj) => current_dataset in obj);

      if (ind !== -1) {
        allModels[ind][current_dataset] = {
          ...allModels[ind][current_dataset],
          [model_name]: {
            metrics: data.metrics,
            metrics_table: data.metrics_table,
            y_pred: JSON.parse(data.y_pred),
            type: Type,
            regressor,
            model_deploy: data.model_deploy,
          },
        };
      } else {
        allModels.push({
          [current_dataset]: {
            [model_name]: {
              metrics: data.metrics,
              metrics_table: data.metrics_table,
              y_pred: JSON.parse(data.y_pred),
              type: Type,
              regressor,
              model_deploy: data.model_deploy,
            },
          },
        });
      }
      await updateDataInIndexedDB("models", allModels);

      toast.success("Model Built Successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      toast.error(JSON.stringify(error.message), {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  useEffect(() => {
    if (whatKind === "Continuous") {
      if (regressor === REGRESSOR[0]) setModelName("LR_Regression");
      if (regressor === REGRESSOR[1]) setModelName("Ridge_Regression");
      if (regressor === REGRESSOR[2]) setModelName("Lasso_Regression");
      if (regressor === REGRESSOR[3]) setModelName("DT_Regression");
      if (regressor === REGRESSOR[4]) setModelName("RF_Classification");
      if (regressor === REGRESSOR[5]) setModelName("svr_Regression");
    } else {
      if (regressor === CLASSIFIER[0]) setModelName("KNN_Classification");
      if (regressor === CLASSIFIER[1]) setModelName("SVM_Classification");
      if (regressor === CLASSIFIER[2]) setModelName("LR_Classification");
      if (regressor === CLASSIFIER[3]) setModelName("DT_Classification");
      if (regressor === CLASSIFIER[4]) setModelName("RF_Classification");
      if (regressor === CLASSIFIER[5]) setModelName("MLP_Classification");
    }
  }, [whatKind, regressor]);

  if (loading) return <div>Loading...</div>;
  if (allDatasetName.length === 0 && type === "function")
    return (
      <div className="my-8">
        <h1 className="text-2xl font-medium">Split a dataset to continue</h1>
      </div>
    );

  return (
    <div className="my-8">
      <ToastContainer
        position="top-right"
        autoClose={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
      {type === "function" && (
        <div>
          <p>Select Train Test Dataset</p>
          <SingleDropDown
            columnNames={allDatasetName}
            onValueChange={(e) => handleDatasetChange(e)}
          />
        </div>
      )}
      {allRegressor && (
        <>
          {type === "function" && (
            <div
              className={`flex items-center gap-8 mt-8 ${
                type === "node" && "flex-col !gap-4"
              }`}
            >
              <div className="w-full">
                <p>{whatKind === "Continuous" ? "Regressor" : "Classifier"}</p>
                <SingleDropDown
                  columnNames={allRegressor}
                  onValueChange={(e) => {
                    setRegressor(e);
                    dispatch(setReg(e));
                    dispatch(setHyperparameterData({}));
                    dispatch(setModelSetting({}));
                    setNicherData("");
                  }}
                  initValue={allRegressor[0]}
                />
              </div>
              <div className="w-full">
                <Input
                  fullWidth
                  label="Model Name"
                  size="lg"
                  value={model_name}
                  onChange={(e) => setModelName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Regressor (for Numerical Column) */}

          {whatKind && whatKind === "Continuous" ? (
            <div className={`${type === "function" && "mt-12"}`}>
              {regressor === REGRESSOR[0] && (
                <LinearRegression
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === REGRESSOR[1] && (
                <RidgeRegression
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === REGRESSOR[2] && (
                <LassoRegression
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === REGRESSOR[3] && (
                <DecisionTreeRegression
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === REGRESSOR[4] && (
                <RandomForestRegression
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === REGRESSOR[5] && (
                <SupportVectorRegressor
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
            </div>
          ) : (
            <div className={`${type === "function" && "mt-12"}`}>
              {regressor === CLASSIFIER[0] && (
                <KNearestNeighbour
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === CLASSIFIER[1] && (
                <SupportVectorMachine
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === CLASSIFIER[2] && (
                <LogisticRegression
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === CLASSIFIER[3] && (
                <DecisionTreeClassification
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === CLASSIFIER[4] && (
                <RandomForestClassification
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
              {regressor === CLASSIFIER[5] && (
                <MultilayerPerceptron
                  train={train}
                  test={test}
                  Type={type}
                  initValue={initValue}
                  onValueChange={onValueChange}
                />
              )}
            </div>
          )}

          {type === "function" && (
            <>
              <button
                className="self-start border-2 px-6 tracking-wider bg-primary-btn text-white font-medium rounded-md py-2 mt-8"
                onClick={handleSave}
              >
                Submit
              </button>
              {nicherData && (
                <p className="mt-4 text-xl tracking-widest">
                  {JSON.stringify(nicherData)}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default BuildModel;
