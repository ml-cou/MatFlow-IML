import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useEffect, useState } from "react";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultipleDropDown = ({
  columnNames,
  setSelectedColumns,
  curInd = 0,
  disabled = false,
  defaultValue,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (defaultValue) setSelectedItems(defaultValue);
  }, [defaultValue]);

  return (
    <div className="mt-1">
      <Autocomplete
        multiple
        limitTags={2}
        id="checkboxes-tags-demo"
        options={columnNames}
        disabled={disabled}
        disableCloseOnSelect
        value={selectedItems}
        onChange={(e, newValue) => {
          setSelectedItems(newValue);
          setSelectedColumns(newValue, curInd);
        }}
        getOptionLabel={(option) => option}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 4 }}
              checked={selected}
            />
            {option}
          </li>
        )}
        size="small"
        renderInput={(params) => <TextField {...params} />}
      />
    </div>
  );
};

export default MultipleDropDown;
