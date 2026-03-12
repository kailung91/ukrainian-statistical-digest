export const KATOTTG_MAP = {
  "05": "vinnytsia",
  "07": "volyn",
  "12": "dnipro",
  "14": "donetsk",
  "18": "zhytomyr",
  "21": "zakarpattia",
  "23": "zaporizhzhia",
  "26": "ivanofrankivsk",
  "32": "kyiv_obl",
  "35": "kirovohrad",
  "44": "luhansk",
  "46": "lviv",
  "48": "mykolaiv",
  "51": "odessa",
  "53": "poltava",
  "56": "rivne",
  "59": "sumy",
  "61": "ternopil",
  "63": "kharkiv",
  "65": "kherson",
  "68": "khmelnytsky",
  "71": "cherkasy",
  "73": "chernivtsi",
  "74": "chernihiv",
  "80": "kyiv_city",
  "01": "crimea",
  "85": "crimea" // Севастополь мапиться на Крим
};

export function extractOblastKey(identifier) {
  if (!identifier) return null;
  const match = String(identifier).match(/UA(\d{2})/);
  if (match && match[1]) {
    return KATOTTG_MAP[match[1]] || null;
  }
  return null;
}
