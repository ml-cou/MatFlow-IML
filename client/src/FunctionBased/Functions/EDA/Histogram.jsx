import styled from "@emotion/styled";
import { Slider, Stack } from "@mui/material";
import { Checkbox, Input, Loading } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useSelector } from "react-redux";
import SingleDropDown from "../../Components/SingleDropDown/SingleDropDown";

function Histogram({ csvData }) {
  // const [csvData, setCsvData] = useState();
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);
  const [plotlyData, setPlotyData] = useState();
  const [loading, setLoading] = useState(false);

  const [stringColumn, setStringColumn] = useState([]);
  const [numberColumn, setNumberColumn] = useState([]);
  const [activeNumberColumn, setActiveNumberColumn] = useState("");
  const [activeHueColumn, setActiveHueColumn] = useState("");
  const [orientation, setOrientation] = useState("Vertical");
  const [showTitle, setShowTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [title, setTitle] = useState();
  const [aggregate, setAggregate] = useState("count");
  const [KDE, setKDE] = useState(false);
  const [legend, setLegend] = useState(false);
  const [showAutoBin, setShowAutoBin] = useState(true);
  const [autoBinValue, setAutoBinValue] = useState(10);

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
        const resp = await fetch("http://127.0.0.1:8000/api/eda_histogram/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            var: activeNumberColumn || "-",
            hue: activeHueColumn || "-",
            orient: orientation,
            title: title || "",
            file: csvData,
            agg: aggregate,
            autoBin: !showAutoBin ? autoBinValue : 0,
            kde: KDE,
            legend: legend,
          }),
        });
        let data = await resp.json();
        data = JSON.parse(data);
        setPlotyData(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [
    activeNumberColumn,
    activeHueColumn,
    orientation,
    title,
    autoBinValue,
    showAutoBin,
    KDE,
    legend,
    aggregate,
    csvData,
  ]);

  return (
    <div>
      <div className="flex items-center gap-8 mt-8">
        <div className="w-full">
          <p className="text-lg font-medium tracking-wide">Variable</p>
          <SingleDropDown
            columnNames={numberColumn}
            onValueChange={setActiveNumberColumn}
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
            Aggregate Statistics
          </label>
          <select
            name=""
            id=""
            value={aggregate}
            className="bg-transparent p-2 focus:border-[#06603b] border-2 rounded-lg"
            onChange={(e) => setAggregate(e.target.value)}
          >
            <option value="probability">Probability</option>
            <option value="count">Count</option>
            <option value="frequency">Frequency</option>
            <option value="percent">Percent</option>
            <option value="density">Density</option>
          </select>
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
        <Checkbox
          color="success"
          isSelected={showAutoBin}
          onChange={(e) => setShowAutoBin(e.valueOf())}
        >
          Auto Bin
        </Checkbox>
        <Checkbox color="success" onChange={(e) => setKDE(e.valueOf())}>
          KDE
        </Checkbox>
        <Checkbox color="success" onChange={(e) => setLegend(e.valueOf())}>
          Legend
        </Checkbox>
      </div>
      {!showAutoBin && (
        <div className="mt-12">
          <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
            <span>1</span>
            <PrettoSlider
              aria-label="Auto Bin Slider"
              min={1}
              max={35}
              step={1}
              defaultValue={10}
              value={autoBinValue}
              onChange={(e) => setAutoBinValue(e.target.value)}
              valueLabelDisplay="on"
              color="primary"
            />
            <span>35</span>
          </Stack>
        </div>
      )}
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

const PrettoSlider = styled(Slider)({
  color: "#52af77",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#52af77",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});

export default Histogram;
