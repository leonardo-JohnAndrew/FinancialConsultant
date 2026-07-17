const AdmZip = require("adm-zip");

function stripExternalLinks(xlsxBuffer) {
  const zip = new AdmZip(xlsxBuffer);

  // 1. Alisin ang externalLinks/*.xml files
  zip
    .getEntries()
    .filter((e) => e.entryName.startsWith("xl/externalLinks/"))
    .forEach((e) => zip.deleteFile(e.entryName));

  // 2. Alisin ang externalLink relationships sa workbook.xml.rels
  const relsPath = "xl/_rels/workbook.xml.rels";
  let rels = zip.getEntry(relsPath).getData().toString("utf8");
  rels = rels.replace(
    /<Relationship[^>]*Type="[^"]*\/externalLink"[^>]*\/>/g,
    "",
  );
  zip.updateFile(relsPath, Buffer.from(rels, "utf8"));

  // 3. Alisin ang <externalReferences> node sa workbook.xml
  const wbPath = "xl/workbook.xml";
  let wb = zip.getEntry(wbPath).getData().toString("utf8");
  wb = wb.replace(/<externalReferences>.*?<\/externalReferences>/s, "");

  // 4. Alisin ang definedNames na tumutukoy pa rin sa '[n]...' (external index)
  //    kasi mabubura na yung externalReferences list nila sa itaas
  wb = wb.replace(/<definedName[^>]*>'?\[\d+\][^<]*<\/definedName>/g, "");

  zip.updateFile(wbPath, Buffer.from(wb, "utf8"));

  return zip.toBuffer();
}

module.exports = { stripExternalLinks };
