import { Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import SingleDropDown from "../../../Components/SingleDropDown/SingleDropDown";
import { setReRender } from "../../../../Slices/UploadedFileSlice";
import {
  fetchDataFromIndexedDB,
  updateDataInIndexedDB,
} from "../../../../util/indexDB";

function AppendDataset({ csvData }) {
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [loading, setLoading] = useState(false);
  const [lessThanTwo, setLessThanTwo] = useState(true);
  const [availableDatasets, setAvailableDatasets] = useState();
  const [anotherCsvData, setAnotherCsvData] = useState();
  const [new_dataset_name, setNewDatasetName] = useState("");
  const render = useSelector((state) => state.uploadedFile.rerender);
  const dispatch = useDispatch();

  

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

  const handleChange = async (val) => {
    const data = await fetchDataFromIndexedDB(val);
    setAnotherCsvData(data);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/append/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: csvData,
          file2: anotherCsvData,
        }),
      });
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
      toast.error("Something went wrong. Please try again", {
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

  return (
    <>
      {lessThanTwo ? (
        <h1 className="mt-8 text-4xl font-medium tracking-wide">
          Please add at least two datasets!
        </h1>
      ) : (
        <div className="flex flex-col gap-4 mt-8">
          <div>
            <p>Select Dataset You Wanna Append With</p>
            <SingleDropDown
              columnNames={availableDatasets}
              onValueChange={(val) => handleChange(val)}
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
          <button
            className="self-start border-2 px-6 tracking-wider bg-primary-btn text-white font-medium rounded-md py-2 mt-8"
            onClick={handleSave}
          >
            Append
          </button>
        </div>
      )}
    </>
  );
}

export default AppendDataset;
