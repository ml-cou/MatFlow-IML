import { Checkbox, Input, Loading } from "@nextui-org/react";
import React, { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useSelector } from "react-redux";
import SingleDropDown from "../../Components/SingleDropDown/SingleDropDown";

function PiePlot({ csvData }) {
  // const [csvData, setCsvData] = useState();
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [activeStringColumn, setActiveStringColumn] = useState("");
  const [stringColumn, setStringColumn] = useState([]);
  const [showTitle, setShowTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [title, setTitle] = useState("");
  const [plotlyData, setPlotlyData] = useState();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(true);
  const [percentage, setPercentage] = useState(true);
  const gapRef = useRef();
  const [gap, setGap] = useState(0);

  useEffect(() => {
    if (activeCsvFile && activeCsvFile.name) {
      const getData = async () => {
        const tempStringColumn = [];

        Object.entries(csvData[0]).forEach(([key, value]) => {
          if (typeof csvData[0][key] === "string") tempStringColumn.push(key);
        });

        setStringColumn(tempStringColumn);
      };

      getData();
    }
  }, [activeCsvFile, csvData]);

  useEffect(() => {
    if (activeStringColumn && csvData) {
      const fetchData = async () => {
        setLoading(true);
        setPlotlyData("");
        const resp = await fetch("http://127.0.0.1:8000/api/eda_pieplot/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cat: activeStringColumn || "-",
            file: csvData,
            title,
            label,
            percentage,
            gap,
          }),
        });
        let data = await resp.json();
        data = JSON.parse(data);
        setPlotlyData(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [activeStringColumn, title, csvData, gap, label, percentage]);

  return (
    <div>
      <div className="flex items-center gap-8 mt-8">
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">
            Categorical Variable
          </p>
          <SingleDropDown
            columnNames={stringColumn}
            onValueChange={setActiveStringColumn}
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <label htmlFor="" className="text-lg font-medium tracking-wide">
            Explode Value
          </label>
          <Input
            ref={gapRef}
            type="number"
            bordered
            min={0}
            max={0.1}
            color="success"
            placeholder="Expected value (0 - 0.1)."
            step={"0.01"}
            helperText="Press Enter to apply"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setGap(gapRef.current.value);
              }
            }}
          />
        </div>
      </div>

      <div className="mt-8 flex gap-10">
        <Checkbox color="success" onChange={() => setShowTitle(!showTitle)}>
          Title
        </Checkbox>
        <Checkbox
          color="success"
          isSelected={label}
          onChange={() => setLabel(!label)}
        >
          Label
        </Checkbox>
        <Checkbox
          color="success"
          isSelected={percentage}
          onChange={() => setPercentage(!percentage)}
        >
          Percentage
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
            config={{  editable: true, responsive: true }}
          />
        </div>
      )}
    </div>
  );
}

export default PiePlot;
