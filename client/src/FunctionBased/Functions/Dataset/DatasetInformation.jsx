import { Popover } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import AgGridComponent from "../../Components/AgGridComponent/AgGridComponent";

const DatasetInformation = ({ csvData }) => {
  // const [rowData, setRowData] = useState([]);
  const activeCsvFile = useSelector((state) => state.uploadedFile.activeFile);

  return (
    <div>
      <h1 className="text-3xl font-bold my-4">Dataset Information</h1>
      {csvData.length > 0 && <MyAgGridComponent rowData={csvData} />}
    </div>
  );
};

const MyAgGridComponent = ({ rowData }) => {
  const [rangeIndex, setRangeIndex] = useState("");
  const [totalColumns, setTotalColumns] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      const startRowIndex = 0; // Start index assumed to be 1
      const endRowIndex = rowData.length;
      setRangeIndex(`${startRowIndex} - ${endRowIndex}`);

      const columnsCount = Object.keys(rowData[0]).length;
      setTotalColumns(columnsCount);

      // Calculate memory usage assuming each character takes 2 bytes
      const memoryUsageBytes = JSON.stringify(rowData).length * 2;
      const memoryUsageKB = Math.round(memoryUsageBytes / 1024); // Convert to kilobytes
      setMemoryUsage(memoryUsageKB);
    }
  }, [rowData]);

  const data = useMemo(() => {
    const columns = Object.keys(rowData[0] || {});
    const columnInfo = [];

    columns.forEach((column) => {
      const uniqueValues = new Set();
      let nonNullCount = 0;

      if (column !== "id") {
        rowData.forEach((row) => {
          const value = row[column];
          if (value !== undefined && value !== null) {
            uniqueValues.add(value);
            nonNullCount++;
          }
        });

        const nullCount = rowData.length - nonNullCount;
        const nullPercentage = (nullCount / rowData.length) * 100;
        const dtype = typeof rowData[0][column];

        columnInfo.push({
          column,
          uniqueValues: uniqueValues.size,
          nonNullCount,
          nullPercentage,
          dtype,
        });
      }
    });

    return columnInfo;
  }, [rowData]);

  const columnDefs = useMemo(() => {
    const columns = Object.keys(data[0] || {});
    return columns.map((column) => ({
      headerName: column,
      field: column,
      filter: true,
      filterParams: {
        suppressAndOrCondition: true, // Optional: Suppress 'and'/'or' filter conditions
        newRowsAction: "keep", // Optional: Preserve filter when new rows are loaded
      },
      sortable: true,
      flex: 1,
    }));
  }, [data]);

  return (
    <div className="w-full">
      <div className="ag-theme-alpine h-[600px] w-full">
        {columnDefs && data && (
          <>
            <div className="w-full flex mb-2 justify-end">
              <Popover placement={"bottom-right"} shouldFlip isBordered>
                <Popover.Trigger>
                  <h3 className="text-base underline cursor-pointer text-[#06603b] font-medium tracking-wide">
                    Dataset Details
                  </h3>
                </Popover.Trigger>
                <Popover.Content>
                  <div className="min-w-[175px] px-6 py-4 flex flex-col gap-1 bg-[#0a8b55] text-slate-200">
                    <p className="text-md">
                      <span className="font-medium tracking-wide">
                        Range Index :
                      </span>{" "}
                      {rangeIndex}
                    </p>
                    <p className="text-md">
                      <span className="font-medium tracking-wide">
                        Total Columns :
                      </span>{" "}
                      {totalColumns}
                    </p>
                    <p className="text-md">
                      <span className="font-medium tracking-wide">
                        Memory Usage :
                      </span>{" "}
                      {memoryUsage}+ KB
                    </p>
                  </div>
                </Popover.Content>
              </Popover>
            </div>
            <AgGridComponent rowData={data} columnDefs={columnDefs} />
          </>
        )}
      </div>
    </div>
  );
};

export default DatasetInformation;
