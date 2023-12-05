const useBase64 = () => {
  const fromBase64Uri = (base64ContentUri: any) => {
    const base64Content = removeUriPrefix(base64ContentUri);
    return fromBase64(base64Content);
  };

  const fromBase64 = (base64Content: any) => {
    const stingify = Buffer.from(base64Content, "base64").toString("utf-8");
    return JSON.parse(stingify);
  };

  const toBase64 = (content: any) => {
    const stingify = JSON.stringify(content);
    return Buffer.from(stingify).toString("base64");
  };

  const toBase64Uri = (content: any) => {
    const base64Content = toBase64(content);
    return addUriPrefix(base64Content);
  };

  const addUriPrefix = (content: string) => {
    return "data:application/json;base64," + content;
  };

  const removeUriPrefix = (contentWithUri: string) => {
    return contentWithUri.replace("data:application/json;base64,", "");
  };

  return { fromBase64Uri, fromBase64, toBase64, toBase64Uri };
};

export default useBase64;
