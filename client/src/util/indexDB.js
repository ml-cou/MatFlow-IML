import Papa from "papaparse";
import * as XLSX from "xlsx";

const fetchDataFromIndexedDB = (name) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction(["data"], "readonly");
      const objectStore = transaction.objectStore("data");
      const getDataRequest = objectStore.getAll();

      getDataRequest.onsuccess = (event) => {
        const data = event.target.result;
        const dataWithoutId = data.map((innerArray) => {
          const { id, ...rest } = innerArray;
          return rest;
        });
        resolve(dataWithoutId);
      };

      transaction.onerror = (event) => {
        console.error("IndexedDB transaction error:", event.target.error);
        reject(event.target.error);
      };
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data", { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

const checkNameExistInIndexedDB = (name) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      db.close();
      resolve(true); // Name exists in IndexedDB
    };

    request.onupgradeneeded = (event) => {
      event.target.result.close();
      resolve(event.oldVersion === 0); // Check if the database doesn't exist
    };
  });
};

const storeDataInIndexedDB = (data, name) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);
  
    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction(["data"], "readwrite");
      const objectStore = transaction.objectStore("data");

      transaction.onerror = (event) => {
        console.error("IndexedDB transaction error:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        resolve();
      };
      
      data.forEach((item) => {
        objectStore.add(item);
      });
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data", { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

const updateDataInIndexedDB = (name, data) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction(["data"], "readwrite");
      const objectStore = transaction.objectStore("data");

      // Ulta palta korle remove kore daw
      objectStore.clear();

      transaction.onerror = (event) => {
        console.error("IndexedDB transaction error:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        resolve();
      };

      data.forEach((item) => {
        objectStore.put(item);
      });
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data", { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

const deleteIndexedDB = (name) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase(name);

    request.onerror = (event) => {
      console.error("Error deleting IndexedDB database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = () => {
      console.log("IndexedDB database deleted successfully");
      resolve();
    };
  });
};

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);

      let id = 1;
      Papa.parse(sheetData, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          let data = [];
          if (results.errors.length > 0) {
            const validData = results.data.filter(
              (_, index) => !results.errors.some((error) => error.row === index)
            );
            data = validData;
          } else data = results.data;

          const temp = data.map((row) => {
            const modifiedRow = { ...row };
            if (modifiedRow[""] || modifiedRow[" "]) {
              modifiedRow[`Unnamed Column ${id}`] = modifiedRow[""];
              delete modifiedRow[""];
            }
            return modifiedRow;
          });
          resolve(temp);
        },
        error: (error) => {
          reject(error);
        },
      });
    };
    reader.readAsArrayBuffer(file);
  });
};

const parseCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        let data = [];
        if (results.errors.length > 0) {
          const validData = results.data.filter(
            (_, index) => !results.errors.some((error) => error.row === index)
          );
          data = validData;
        } else data = results.data;

        const temp = data.map((row) => {
          const modifiedRow = { ...row };
          if (modifiedRow[""]) {
            modifiedRow[`Unnamed Column`] = modifiedRow[""];
            delete modifiedRow[""];
          }
          return modifiedRow;
        });
        resolve(temp);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

function fixMismatchedColumns(parsedData) {
  const maxColumns = Math.max(...parsedData.map((row) => row.length));

  // Align columns for each row
  const alignedData = parsedData.map((row) => {
    if (row.length < maxColumns) {
      // Add empty values or placeholders for missing columns
      const missingColumns = maxColumns - row.length;
      return [...row, ...Array(missingColumns).fill("")];
    } else if (row.length > maxColumns) {
      // Truncate extra columns
      return row.slice(0, maxColumns);
    } else {
      // Row already has the correct column count
      return row;
    }
  });

  return alignedData;
}

export {
  checkNameExistInIndexedDB,
  deleteIndexedDB,
  fetchDataFromIndexedDB,
  fixMismatchedColumns,
  parseCsv,
  parseExcel,
  storeDataInIndexedDB,
  updateDataInIndexedDB,
};
