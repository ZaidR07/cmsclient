import * as XLSX from "xlsx";

export const handleExcelDataUpload = (data) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsBinaryString(data.file);

    reader.onload = (e) => {
      try {
        const binaryData = e.target.result;
        const workbook = XLSX.read(binaryData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const parsedData = XLSX.utils.sheet_to_json(sheet);

        const modifiedData = parsedData.map((row) => {
          const modifiedRow = {};
          Object.keys(row).forEach((key) => {
            const newKey = key.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "");
            modifiedRow[newKey] = row[key];
          });
          return modifiedRow;
        });

        resolve(modifiedData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };
  });
};
