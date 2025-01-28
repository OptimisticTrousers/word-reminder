export function download({
  data,
  fileName,
  fileType,
}: {
  data: BlobPart;
  fileName: string;
  fileType: string;
}) {
  // Create blob link to download
  const blob = new Blob([data], { type: fileType });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  document.body.removeChild(link);
}
