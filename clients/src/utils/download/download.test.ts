import { download } from "./download";

describe("download", () => {
  it("should download the file", () => {
    const link = {
      click: vi.fn(),
      download: "",
      href: "",
    };
    const createObjectURL =
      "blob:https://aa086d52-64ed-4111-aa94-c260385d12ff.mdnplay.dev/b18d81e0-55f6-45a9-8824-77e674db39d8";
    window.URL.createObjectURL = vi.fn().mockImplementation(() => {
      return createObjectURL;
    });
    vi.spyOn(document, "createElement").mockReturnValue(
      link as unknown as HTMLAnchorElement
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn());
    vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn());

    download({
      data: "test file contents",
      fileName: "test.txt",
      fileType: "text/plain",
    });

    expect(link.download).toBe("test.txt");
    expect(link.href).toBe(createObjectURL);
    expect(link.click).toHaveBeenCalledTimes(1);
    expect(document.body.appendChild).toHaveBeenCalledTimes(1);
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
    expect(document.body.removeChild).toHaveBeenCalledTimes(1);
    expect(document.body.removeChild).toHaveBeenCalledWith(link);
  });
});
