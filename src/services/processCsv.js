import Papa from "papaparse";
import { extractOblastKey } from "../utils/normalizeOblast";

export const processCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data;
          if (!data || data.length === 0) {
            throw new Error("CSV файл порожній");
          }

          // Знаходимо колонку з останнім роком
          const firstRow = data[0];
          const yearKeys = Object.keys(firstRow).filter(k => /^\d{4}$/.test(k));
          let latestYear = "";
          
          if (yearKeys.length > 0) {
             const maxYear = Math.max(...yearKeys.map(Number));
             latestYear = String(maxYear);
          } else {
             latestYear = new Date().getFullYear().toString();
          }

          const oblastData = {};

          data.forEach((row) => {
            const sex = row["Стать"];
            const locType = row["Тип місцевості"];
            
            // Беремо лише рядки, де колонка "Стать" дорівнює "Усього" або "Загалом",
            // а "Тип місцевості" дорівнює "Загалом"
            const isSexValid = !sex || sex === "Усього" || sex === "Загалом";
            const isLocTypeValid = !locType || locType === "Загалом";

            if (isSexValid && isLocTypeValid) {
              const terr = row["Територіальний розріз"];
              const key = extractOblastKey(terr);
              
              if (key && row[latestYear] !== undefined && row[latestYear] !== null) {
                 const value = parseFloat(row[latestYear]);
                 if (!isNaN(value)) {
                    oblastData[key] = value;
                 }
              }
            }
          });

          const result = {
            topic: "labor",
            period: `${latestYear} рік`,
            title: firstRow["Показник"] ?? "Дані Держстату",
            unit: firstRow["Одиниця виміру"] ?? "",
            description: "Показник",
            oblastData: oblastData,
            stats: [],
            summary: "Дані завантажено з CSV. Аналітичний висновок не генерувався."
          };

          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};
