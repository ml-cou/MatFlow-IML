import { Loading } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useSelector } from "react-redux";
import MultipleDropDown from "../../Components/MultipleDropDown/MultipleDropDown";
import SingleDropDown from "../../Components/SingleDropDown/SingleDropDown";

function CustomPlot({ csvData }) {
  // const [csvData, setCsvData] = useState();
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [numberColumn, setNumberColumn] = useState([]);
  const [stringColumn, setStringColumn] = useState([]);
  const [x_var, setX_var] = useState([]);
  const [y_bar, setY_var] = useState("");
  const [activeHue, setActiveHue] = useState("");
  const [loading, setLoading] = useState(false);
  const [plotlyData, setPlotlyData] = useState();

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
        setY_var(tempNumberColumn[0]);
      };

      getData();
    }
  }, [activeCsvFile, csvData]);

  useEffect(() => {
    if (x_var && x_var.length > 0 && CanvasCaptureMediaStreamTrack) {
      const fetchData = async () => {
        setLoading(true);
        setPlotlyData("");
        const resp = await fetch("http://127.0.0.1:8000/api/eda_customplot/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: csvData,
            x_var,
            y_var: y_bar,
            hue: activeHue || "None",
          }),
        });
        let data = await resp.json();
        data = JSON.parse(data);
        setPlotlyData(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [x_var, y_bar, activeHue, csvData]);

  return (
    <div>
      <div className="flex items-center gap-8 mt-8">
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">X Variable</p>
          <MultipleDropDown
            columnNames={numberColumn}
            setSelectedColumns={setX_var}
          />
        </div>
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">Y Variable</p>
          <SingleDropDown
            columnNames={numberColumn}
            initValue={y_bar}
            onValueChange={setY_var}
          />
        </div>
        <div className="w-full flex flex-col tracking-wider">
          <p className="text-lg font-medium tracking-wide">Hue Variable</p>
          <SingleDropDown
            columnNames={stringColumn}
            onValueChange={setActiveHue}
          />
        </div>
      </div>

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

export default CustomPlot;
