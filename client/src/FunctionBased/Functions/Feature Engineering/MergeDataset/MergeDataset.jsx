import { Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import SingleDropDown from "../../../Components/SingleDropDown/SingleDropDown";
import {
  fetchDataFromIndexedDB,
  updateDataInIndexedDB,
} from "../../../../util/indexDB";
import { setReRender } from "../../../../Slices/UploadedFileSlice";

const HOW = ["left", "right", "outer", "inner", "cross"];

function MergeDataset({ csvData }) {
  const leftDataframe = Object.keys(csvData[0]);
  const [lessThanTwo, setLessThanTwo] = useState(true);
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rightDataframe, setRightDataframe] = useState([]);
  const [anotherCsvData, setAnotherCsvData] = useState();
  const [new_dataset_name, setNewDatasetName] = useState("");
  const [how, setHow] = useState();
  const [leftDataframeValue, setLeftDataframeValue] = useState();
  const [rightDataframeValue, setRightDataframeValue] = useState();
  const [secondDatasetName, setSecondDatasetName] = useState("");
  const dispatch = useDispatch();
  const render = useSelector((state) => state.uploadedFile.rerender);

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_URL}${
          import.meta.env.VITE_APP_API_MERGE_DATASET
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            how,
            left_dataframe: leftDataframeValue,
            right_dataframe: rightDataframeValue,
            file: csvData,
            file2: anotherCsvData,
          }),
        }
      );
      let Data = await res.json();
      Data = JSON.parse(Data);

      let fileName = new_dataset_name;

      const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles"));
      const fileExist = uploadedFiles.filter((val) => val.name === fileName);

      if (fileExist.length === 0) {
        uploadedFiles.push({ name: fileName });
      }
      localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));

      const temp = await fetchDataFromIndexedDB(fileName);
      await updateDataInIndexedDB(fileName, Data);

      toast.success(`Data updated successfully!`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      dispatch(setReRender(!render));
    } catch (error) {
      toast.error(error.message, {
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
    let temp = JSON.parse(localStorage.getItem("uploadedFiles"));
    if (temp && temp.length > 1) {
      setLoading(true);
      setLessThanTwo(false);
      temp = temp.filter((val) => val.name !== activeCsvFile.name);
      temp = temp.map((val) => val.name);
      setAvailableDatasets(temp);
    }
    setLoading(false);
  }, [activeCsvFile]);

  const handleDatasetMerge = async (val) => {
    const data = await fetchDataFromIndexedDB(val);
    setRightDataframe(Object.keys(data[0]));
    setAnotherCsvData(data);
    setSecondDatasetName(val);
  };

  return (
    <div>
      {lessThanTwo ? (
        <h1 className="mt-8 text-4xl font-medium tracking-wide">
          Please add at least two datasets!
        </h1>
      ) : !loading ? (
        <div className="mt-8 flex flex-col gap-4">
          <div>
            <p>Select Dataset You Wanna Merge With</p>
            <SingleDropDown
              columnNames={availableDatasets}
              onValueChange={(e) => handleDatasetMerge(e)}
            />
          </div>
          <div>
            <Input
              bordered
              color="success"
              fullWidth
              label="New Dataset Name"
              value={new_dataset_name}
              onChange={(e) => setNewDatasetName(e.target.value)}
            />
          </div>
          <div>
            <p>How</p>
            <SingleDropDown columnNames={HOW} onValueChange={setHow} />
          </div>
          <div>
            <p>Select column name for left dataframe:</p>
            <SingleDropDown
              columnNames={leftDataframe}
              onValueChange={setLeftDataframeValue}
            />
          </div>
          <div>
            <p>Select column name for right dataframe:</p>
            <SingleDropDown
              columnNames={rightDataframe}
              onValueChange={setRightDataframeValue}
            />
          </div>
          <button
            className="self-start border-2 px-6 tracking-wider bg-primary-btn text-white font-medium rounded-md py-2 mt-8"
            onClick={handleSave}
          >
            Merge
          </button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default MergeDataset;
