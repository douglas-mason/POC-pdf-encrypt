import express from "express";
import muhammara from "muhammara";
import bent from "bent";

const Recipe = muhammara.Recipe;

const setup = async () => {
  const getBuffer = bent("buffer");

  const pdfBuffer = await getBuffer(
    "https://www.dmv.virginia.gov/sites/default/files/forms/dmv39.pdf"
  );
  // const pdfDoc = new Recipe("Drata Mission Control.pdf", "output.pdf");

  if (pdfBuffer instanceof ArrayBuffer) {
    return;
  }

  // const buf = new muhammara.PDFRStreamForBuffer(pdfBuffer);
  const pdfDoc = new Recipe(pdfBuffer);

  pdfDoc
    // edit 1st page
    .editPage(1)
    .text("Add some texts to an existing pdf file", 150, 300)
    .rectangle(20, 20, 40, 100)
    .comment("Add 1st comment annotation", 200, 300)
    .endPage()
    // edit 2nd page
    .editPage(2)
    .comment("Add 2nd comment annotation", 200, 100)
    .endPage()
    // end and save
    .endPDF();
};

// setup();

const processStream = async () => {
  const getBuffer = bent("buffer");

  const pdfBuffer = await getBuffer(
    "https://www.dmv.virginia.gov/sites/default/files/forms/dmv39.pdf"
  );
  if (pdfBuffer instanceof ArrayBuffer) {
    return;
  }
  const inputStream = new muhammara.PDFRStreamForBuffer(pdfBuffer);
  // const inputStream = new muhammara.PDFRStreamForFile(
  //   "./Drata Mission Control.pdf"
  // );
  console.log("input stream", inputStream.length);

  const outputStream = new muhammara.PDFWStreamForFile("./output.pdf");
  // const muhammaraWriteStream = new muhammara.PDFStreamForResponse(outputStream);

  muhammara.recrypt(inputStream, outputStream, {
    userPassword: "123",
  });

  console.log("output stream", outputStream.length);

  outputStream.close();

  // await uploadToS3(muhammaraWriteStream);
};

// processStream();

const app = express();

app.use(require("express-status-monitor")());

app.get("/process", async (req, res) => {
  let start = Date.now();
  let end;

  await processStream();
  end = Date.now();
  res.status(200).json({
    start,
    end,
    duration: end - start,
  });
});

app.listen(8081, () => {
  console.log(`Example app listening on port ${8081}`);
});
