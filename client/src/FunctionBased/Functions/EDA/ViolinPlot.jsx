import { Checkbox, Input, Loading } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useSelector } from "react-redux";
import SingleDropDown from "../../Components/SingleDropDown/SingleDropDown";

function ViolinPlot({ csvData }) {
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [plotlyData, setPlotlyData] = useState();
  const [loading, setLoading] = useState(false);

  const [stringColumn, setStringColumn] = useState([]);
  const [numberColumn, setNumberColumn] = useState([]);
  const [activeStringColumn, setActiveStringColumn] = useState("");
  const [activeNumberColumn, setActiveNumberColumn] = useState("");
  const [activeHueColumn, setActiveHueColumn] = useState("");
  const [orientation, setOrientation] = useState("Vertical");
  const [showTitle, setShowTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [title, setTitle] = useState();
  const [dodge, setDodge] = useState(false);
  const [split, setSplit] = useState(false);

  useEffect(() => {
    if (activeCsvFile && activeCsvFile.name) {
      const getData = async () => {
        const tempStringColumn = [];
        const tempNumberColumn = [];

        Object.entries(csvData[0]).forEach(([key, value]) => {
          if (typeof csvData[0][key] === "string") tempStringColumn.push(key);
          else tempNumberColumn.push(key);
        });

        setStringColumn(tempStringColumn);
        setNumberColumn(tempNumberColumn);
      };

      getData();
    }
  }, [activeCsvFile, csvData]);

  useEffect(() => {
    if (activeNumberColumn && csvData) {
      const fetchData = async () => {
        setLoading(true);
        setPlotlyData("");
        const resp = await fetch("http://127.0.0.1:8000/api/eda_violinplot/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cat: activeStringColumn || "-",
            num: activeNumberColumn || "-",
            hue: activeHueColumn || "-",
            orient: orientation,
            dodge: dodge,
            title: title || "",
            file: csvData,
            split,
          }),
        });
        let data = await resp.json();
        data = JSON.parse(data);
        setPlotlyData(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [
    activeNumberColumn,
    activeHueColumn,
    activeStringColumn,
    orientation,
    title,
    dodge,
    csvData,
    split,
  ]);

  return (
    <div>
      <div className="flex items-center gap-8 mt-8">
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">
            Numerical Variable
          </p>
          <SingleDropDown
            columnNames={numberColumn}
            onValueChange={setActiveNumberColumn}
          />
        </div>
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">
            Categorical Variable
          </p>
          <SingleDropDown
            columnNames={stringColumn}
            onValueChange={setActiveStringColumn}
          />
        </div>
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">Hue</p>
          <SingleDropDown
            onValueChange={setActiveHueColumn}
            columnNames={stringColumn}
          />
        </div>
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="" className="text-lg font-medium tracking-wide">
            Orientation
          </label>
          <select
            name=""
            id=""
            value={orientation}
            className="bg-transparent p-2 focus:border-[#06603b] border-2 rounded-lg"
            onChange={(e) => setOrientation(e.target.value)}
          >
            <option value="Vertical">Vertical</option>
            <option value="Horizontal">Horizontal</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 tracking-wider">
        <Checkbox color="success" onChange={(e) => setShowTitle(e.valueOf())}>
          Title
        </Checkbox>
        <Checkbox color="success" onChange={(e) => setDodge(e.valueOf())}>
          Dodge
        </Checkbox>
        <Checkbox color="success" onChange={(e) => setSplit(e.valueOf())}>
          Split
        </Checkbox>
      </div>
      {showTitle && (
        <div className="mt-4">
          <Input
            clearable
            bordered
            color="success"
            size="lg"
            label="Input Title"
            placeholder="Enter your desired title"
            fullWidth
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            helperText="Press Enter to apply"
            onKeyDown={(e) => {
              if (e.key === "Enter") setTitle(titleValue);
            }}
          />
        </div>
      )}
      {loading && (
        <div className="grid place-content-center mt-12 w-full h-full">
          <Loading color={"success"} size="xl">
            Fetching Data...
          </Loading>
        </div>
      )}
      {plotlyData && (
        <div className="flex justify-center mt-4">
          <Plot
            data={plotlyData?.data}
            layout={{ ...plotlyData.layout, showlegend: true }}
            config={{ editable: true, responsive: true }}
          />
        </div>
      )}
    </div>
  );
}

export default ViolinPlot;
