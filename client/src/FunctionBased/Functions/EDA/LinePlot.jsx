import { Checkbox, Input, Loading } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useSelector } from "react-redux";
import SingleDropDown from "../../Components/SingleDropDown/SingleDropDown";

function LinePlot({ csvData }) {
  // const [csvData, setCsvData] = useState();
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [plotlyData, setPlotlyData] = useState();
  const [loading, setLoading] = useState(false);

  const [stringColumn, setStringColumn] = useState([]);
  const [numberColumn, setNumberColumn] = useState([]);
  const [x_var, setX_var] = useState("");
  const [y_var, setY_var] = useState("");
  const [style, setStyle] = useState("");
  const [activeHueColumn, setActiveHueColumn] = useState("");
  const [showTitle, setShowTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [title, setTitle] = useState();
  const [legend, setLegend] = useState(true);

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
    if (x_var && y_var && csvData) {
      const fetchData = async () => {
        setLoading(true);
        setPlotlyData("");
        const resp = await fetch("http://127.0.0.1:8000/api/eda_lineplot/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            x_var,
            y_var,
            hue: activeHueColumn || "-",
            style: style || "-",
            legend,
            title: title || "",
            file: csvData,
          }),
        });
        let data = await resp.json();
        data = JSON.parse(data);
        setPlotlyData(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [x_var, y_var, activeHueColumn, csvData, title, style, legend]);

  return (
    <div>
      <div className="flex items-center gap-8 mt-8">
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">X Variable</p>
          <SingleDropDown columnNames={numberColumn} onValueChange={setX_var} />
        </div>
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">Y Variable</p>
          <SingleDropDown columnNames={numberColumn} onValueChange={setY_var} />
        </div>
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">Hue</p>
          <SingleDropDown
            onValueChange={setActiveHueColumn}
            columnNames={stringColumn}
          />
        </div>
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">Style</p>
          <SingleDropDown onValueChange={setStyle} columnNames={stringColumn} />
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 tracking-wider">
        <Checkbox color="success" onChange={(e) => setShowTitle(e.valueOf())}>
          Title
        </Checkbox>
        <Checkbox
          color="success"
          defaultSelected
          onChange={(e) => setLegend(e.valueOf())}
        >
          Legend
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

export default LinePlot;
